
import {
    addDoc,
    collection,
    serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../../../services/firebase/firebaseConfig';


export async function criarIndicador(dados) {
  console.log('[Indicador] Serviço iniciado');

  try {
    const usuario = auth.currentUser;

    console.log(
      '[Indicador] Usuário autenticado:',
      usuario ? usuario.uid : 'Nenhum usuário'
    );

    if (!usuario) {
      throw new Error(
        'Você precisa estar logado para criar um indicador.'
      );
    }

    const novoIndicador = {
      userId: usuario.uid,
      name: dados.name.trim(),
      description: dados.description.trim(),
      type: dados.type,

      target:
        dados.type === 'conclusao'
          ? null
          : Number(dados.target),

      unit:
        dados.type === 'conclusao'
          ? ''
          : dados.unit.trim(),

      frequency: dados.frequency,

      selectedDays:
        dados.frequency === 'Todos os dias'
          ? []
          : dados.selectedDays,

      reminderEnabled: dados.reminderEnabled,

      reminderTime: dados.reminderEnabled
        ? dados.reminderTime
        : null,

      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('[Indicador] Dados preparados:', novoIndicador);
    console.log('[Indicador] Enviando para o Firestore...');

    const referencia = await addDoc(
      collection(db, 'indicators'),
      novoIndicador
    );

    console.log(
      '[Indicador] Salvo com sucesso. ID:',
      referencia.id
    );

    return referencia.id;
  } catch (error) {
    console.error(
      '[Indicador] Erro no serviço:',
      error.code || '',
      error.message
    );

    throw error;
  }
}

