
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
} from 'firebase/firestore';

import { db } from '../../../services/firebase/firebaseConfig';

// Retorna a coleção de tarefas do usuário autenticado.
function tarefasCollection(uid) {
    if (!uid) {
        throw new Error('UID do estudante não informado.');
    }

    return collection(db, 'users', uid, 'kanbanTasks');
}

// Escuta as tarefas em tempo real.
export function ouvirTarefas(uid, aoReceber, aoFalhar) {
    const referencia = tarefasCollection(uid);

    return onSnapshot(
        referencia,
        (snapshot) => {
            const tarefas = snapshot.docs.map((documento) => ({
                id: documento.id,
                ...documento.data(),
            }));

            tarefas.sort(
                (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
            );

            aoReceber(tarefas);
        },
        aoFalhar
    );
}

// Cria uma nova tarefa.
export async function criarTarefa(uid, dados) {
    const referencia = tarefasCollection(uid);
    const resultado = await addDoc(referencia, dados);

    return resultado.id;
}

// Atualiza uma tarefa existente.
export async function atualizarTarefa(uid, taskId, dados) {
    const referencia = doc(
        db,
        'users',
        uid,
        'kanbanTasks',
        taskId
    );

    await updateDoc(referencia, dados);
}

// Exclui uma tarefa.
export async function excluirTarefa(uid, taskId) {
    const referencia = doc(
        db,
        'users',
        uid,
        'kanbanTasks',
        taskId
    );

    await deleteDoc(referencia);
}
