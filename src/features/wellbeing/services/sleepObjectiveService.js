
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { auth, db } from '../../../services/firebase/firebaseConfig';

// Referência do objetivo atual
function obterReferenciaObjetivoSono(userId) {
  if (!userId) {
    throw new Error('Usuário não autenticado.');
  }

  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    throw new Error('Usuário inválido ou não autenticado.');
  }

  return doc(db, 'users', userId, 'sleepObjectives', 'objective');
}

// Referência da coleção de histórico
function obterColecaoHistoricoSono(userId) {
  return collection(db, 'users', userId, 'sleepObjectiveHistory');
}

// Buscar objetivo atual
export async function buscarObjetivoSono(userId) {
  try {
    const referencia = obterReferenciaObjetivoSono(userId);
    const documento = await getDoc(referencia);

    if (!documento.exists()) {
      return null;
    }

    return documento.data();
  } catch (error) {
    console.error('Erro ao buscar objetivo de sono:', error);
    throw error;
  }
}

// Buscar histórico de objetivos anteriores
export async function buscarHistoricoObjetivosSono(userId) {
  try {
    obterReferenciaObjetivoSono(userId);

    const historicoRef = obterColecaoHistoricoSono(userId);

    const consulta = query(
      historicoRef,
      where('active', '==', false)
    );

    const snapshot = await getDocs(consulta);

    return snapshot.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .sort((a, b) => {
        const dataA = a.startAt?.toMillis?.() ?? 0;
        const dataB = b.startAt?.toMillis?.() ?? 0;

        return dataB - dataA;
      });
  } catch (error) {
    console.error('Erro ao buscar histórico de objetivos:', error);
    throw error;
  }
}

// Salvar ou atualizar objetivo de sono
export async function salvarObjetivoSono(userId, objetivo) {
  try {
    const referencia = obterReferenciaObjetivoSono(userId);
    const historicoRef = obterColecaoHistoricoSono(userId);

    const referenciaAtual = doc(historicoRef, 'current');

    const {
      dailyGoalHours,
      notificationsEnabled,
      reminderTime,
    } = objetivo;

    if (
      typeof dailyGoalHours !== 'number' ||
      !Number.isFinite(dailyGoalHours) ||
      dailyGoalHours < 1 ||
      dailyGoalHours > 24
    ) {
      throw new Error(
        'O objetivo de sono deve estar entre 1 e 24 horas.'
      );
    }

    const novoHistoricoRef = doc(historicoRef);

    await runTransaction(db, async (transaction) => {
      // Todas as leituras acontecem antes das gravações
      const documentoAtual = await transaction.get(referencia);
      const historicoAtual = await transaction.get(referenciaAtual);

      const dadosAtuais = documentoAtual.exists()
        ? documentoAtual.data()
        : null;

      const dadosHistorico = historicoAtual.exists()
        ? historicoAtual.data()
        : null;

      const agora = Timestamp.now();

      const objetivoAnterior = dadosAtuais?.dailyGoalHours;

      const objetivoFoiAlterado =
        dadosAtuais &&
        objetivoAnterior !== dailyGoalHours;

      // Encerra a versão anterior quando o objetivo muda
      if (objetivoFoiAlterado) {
        if (dadosHistorico?.active) {
          transaction.set(
            novoHistoricoRef,
            {
              dailyGoalHours: dadosHistorico.dailyGoalHours,
              startAt: dadosHistorico.startAt || agora,
              endAt: agora,
              active: false,
              createdAt: agora,
            }
          );
        } else {
          // Preserva o objetivo anterior caso ainda não exista
          // um histórico ativo registrado
          transaction.set(
            novoHistoricoRef,
            {
              dailyGoalHours: objetivoAnterior,
              startAt: dadosAtuais.updatedAt || agora,
              endAt: agora,
              active: false,
              createdAt: agora,
            }
          );
        }

        // Inicia a nova versão
        transaction.set(referenciaAtual, {
          dailyGoalHours,
          startAt: agora,
          endAt: null,
          active: true,
          createdAt: agora,
        });
      } else if (!historicoAtual.exists()) {
        // Cria o primeiro histórico
        transaction.set(referenciaAtual, {
          dailyGoalHours,
          startAt: dadosAtuais?.updatedAt || agora,
          endAt: null,
          active: true,
          createdAt: agora,
        });
      }

      // Atualiza o objetivo atual
      transaction.set(
        referencia,
        {
          dailyGoalHours,
          notificationsEnabled: Boolean(notificationsEnabled),
          reminderTime: reminderTime || '22:00',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    });

    console.log('Objetivo e histórico salvos com sucesso!');

    return true;
  } catch (error) {
    console.error('Erro ao salvar objetivo de sono:', error);
    console.error('Código do erro:', error?.code);
    console.error('Mensagem:', error?.message);

    throw error;
  }
}
