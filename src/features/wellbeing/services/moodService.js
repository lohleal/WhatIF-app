
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';

import { auth, db } from '../../../services/firebase/firebaseConfig';

// Retorna a coleção de humor do usuário autenticado.
function obterColecaoHumor(userId) {
    if (!userId) {
        throw new Error('Usuário não informado.');
    }

    if (!auth.currentUser) {
        throw new Error('Usuário não autenticado.');
    }

    if (auth.currentUser.uid !== userId) {
        throw new Error('Usuário não autorizado.');
    }

    return collection(db, 'users', userId, 'moodRecords');
}

// Busca os registros de humor.
export async function buscarRegistrosHumor(userId) {
    const colecao = obterColecaoHumor(userId);

    const consulta = query(
        colecao,
        orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(consulta);

    return snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
    }));
}

// Salva um novo registro de humor.
export async function salvarRegistroHumor(userId, registro) {
    const colecao = obterColecaoHumor(userId);

    const moods = Array.isArray(registro?.moods)
        ? registro.moods
        : registro?.mood
            ? [registro.mood]
            : [];

    if (moods.length === 0) {
        throw new Error('Selecione pelo menos um humor.');
    }

    const novoRegistro = {
        moods,
        note: registro.note || '',
        timestamp: registro.timestamp || Date.now(),
        date: registro.date || '',
        dateKey: registro.dateKey || '',
        time: registro.time || '',
        createdAt: serverTimestamp(),
    };

    const referencia = await addDoc(colecao, novoRegistro);

    return {
        id: referencia.id,
        ...novoRegistro,
    };
}

// Importa registros antigos do armazenamento local.
export async function importarRegistroHumor(userId, registro) {
    if (!registro?.id) {
        throw new Error('Registro antigo sem identificador.');
    }

    const moods = Array.isArray(registro.moods)
        ? registro.moods
        : registro.mood
            ? [registro.mood]
            : [];

    if (moods.length === 0) {
        throw new Error('Registro antigo sem informação de humor.');
    }

    const registroRef = doc(
        obterColecaoHumor(userId),
        registro.id
    );

    await setDoc(registroRef, {
        moods,
        note: registro.note || '',
        timestamp: registro.timestamp || Date.now(),
        date: registro.date || '',
        dateKey: registro.dateKey || '',
        time: registro.time || '',
        createdAt: serverTimestamp(),
    }, { merge: true });

    return registro.id;
}

// Exclui um registro de humor.
export async function excluirRegistroHumor(userId, registroId) {
    if (!registroId) {
        throw new Error('Identificador do registro não informado.');
    }

    const registroRef = doc(
        obterColecaoHumor(userId),
        registroId
    );

    await deleteDoc(registroRef);
}
