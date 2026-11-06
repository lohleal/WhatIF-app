
import {
    addDoc,
    collection,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore';

import { auth, db } from '../../../services/firebase/firebaseConfig';

// Criar indicador
export async function criarIndicador(dados) {
    console.log('[Indicador] Serviço iniciado');

    try {
        const usuario = auth.currentUser;

        if (!usuario) {
            throw new Error(
                'Você precisa estar logado para criar um indicador.'
            );
        }

        const novoIndicador = {
            userId: usuario.uid,

            name: dados.name.trim(),
            description: (dados.description || '').trim(),
            type: dados.type,

            target: dados.type === 'conclusao'
                ? null
                : Number(dados.target),

            unit: dados.type === 'conclusao'
                ? ''
                : (dados.unit || '').trim(),

            frequency: dados.frequency,

            selectedDays: dados.frequency === 'Todos os dias'
                ? []
                : dados.selectedDays,

            reminderEnabled: dados.reminderEnabled,

            reminderTime: dados.reminderEnabled
                ? dados.reminderTime
                : null,

            // Personalização escolhida pelo estudante
            iconName: dados.iconName || 'water-outline',
            iconColor: dados.iconColor || '#5A8EAD',
            backgroundColor: dados.backgroundColor || '#DCEFF5',

            currentValue: 0,
            completed: false,

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        console.log('[Indicador] Dados enviados:', novoIndicador);

        const referencia = await addDoc(
            collection(db, 'indicators'),
            novoIndicador
        );

        console.log('[Indicador] Salvo com ID:', referencia.id);

        return referencia.id;

    } catch (error) {
        console.error('[Indicador] Erro:', error);
        throw error;
    }
}

// Editar indicador
export async function atualizarIndicador(id, dados) {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error('Você precisa estar logado.');
    }

    await updateDoc(doc(db, 'indicators', id), {
        name: dados.name.trim(),
        description: (dados.description || '').trim(),

        target: dados.type === 'conclusao'
            ? null
            : Number(dados.target),

        unit: dados.type === 'conclusao'
            ? ''
            : (dados.unit || '').trim(),

        updatedAt: serverTimestamp(),
    });
}

// Marcar indicador como concluído
export async function concluirIndicador(id, target) {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error('Você precisa estar logado.');
    }

    await updateDoc(doc(db, 'indicators', id), {
        completed: true,
        currentValue: target ?? 1,
        updatedAt: serverTimestamp(),
    });
}

// Excluir indicador
export async function excluirIndicador(id) {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error('Você precisa estar logado.');
    }

    await deleteDoc(doc(db, 'indicators', id));
}
