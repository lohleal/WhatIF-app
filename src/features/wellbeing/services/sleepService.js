
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../../../services/firebase/firebaseConfig';

function obterColecaoSono(userId) {
  if (!userId) {
    throw new Error('Usuário não informado.');
  }

  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado.');
  }

  if (auth.currentUser.uid !== userId) {
    throw new Error('Usuário não autorizado.');
  }

  return collection(db, 'users', userId, 'sleepRecords');
}

function gerarDataReferencia(fim) {
  const ano = fim.getFullYear();
  const mes = String(fim.getMonth() + 1).padStart(2, '0');
  const dia = String(fim.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function validarPeriodo(periodo) {
  const inicio = new Date(periodo.inicio);
  const fim = new Date(periodo.fim);

  if (
    Number.isNaN(inicio.getTime()) ||
    Number.isNaN(fim.getTime())
  ) {
    throw new Error('Data ou horário inválido.');
  }

  const duracaoMinutos = Math.round(
    (fim.getTime() - inicio.getTime()) / 60000
  );

  if (duracaoMinutos <= 0 || duracaoMinutos > 1440) {
    throw new Error(
      'Cada período precisa ter duração maior que zero e de até 24 horas.'
    );
  }

  return {
    inicio,
    fim,
    duracaoMinutos,
    dataReferencia:
      periodo.dataReferencia || gerarDataReferencia(fim),
  };
}

function validarSobreposicao(periodos) {
  const ordenados = [...periodos].sort(
    (a, b) => a.inicio.getTime() - b.inicio.getTime()
  );

  for (let i = 1; i < ordenados.length; i++) {
    if (
      ordenados[i].inicio.getTime() <
      ordenados[i - 1].fim.getTime()
    ) {
      throw new Error(
        'Existem períodos de sono sobrepostos. Confira os horários.'
      );
    }
  }
}

export async function buscarRegistrosSono(userId) {
  const colecao = obterColecaoSono(userId);

  const consulta = query(
    colecao,
    orderBy('inicio', 'desc')
  );

  const snapshot = await getDocs(consulta);

  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function salvarRegistrosSono(userId, periodos) {
  const colecao = obterColecaoSono(userId);

  if (!Array.isArray(periodos) || periodos.length === 0) {
    throw new Error('Adicione pelo menos um período de sono.');
  }

  const periodosValidados = periodos.map(validarPeriodo);

  validarSobreposicao(periodosValidados);

  const salvos = [];

  for (const periodo of periodosValidados) {
    const registro = {
      inicio: periodo.inicio,
      fim: periodo.fim,
      duracaoMinutos: periodo.duracaoMinutos,
      dataReferencia: periodo.dataReferencia,
      createdAt: serverTimestamp(),
    };

    const referencia = await addDoc(colecao, registro);

    salvos.push({
      id: referencia.id,
      ...registro,
    });
  }

  return salvos;
}

export async function excluirRegistroSono(userId, registroId) {
  if (!registroId) {
    throw new Error('Identificador do registro não informado.');
  }

  const colecao = obterColecaoSono(userId);
  const referencia = doc(colecao, registroId);

  await deleteDoc(referencia);
}
