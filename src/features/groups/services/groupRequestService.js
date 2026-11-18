
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    where,
} from 'firebase/firestore';

import { auth, db } from '../../../services/firebase/firebaseConfig';

export async function solicitarEntradaGrupo(groupId) {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error('Usuário não autenticado.');
    }

    if (!groupId) {
        throw new Error('Selecione um grupo.');
    }

    const grupoRef = doc(db, 'groups', groupId);
    const grupoSnapshot = await getDoc(grupoRef);

    if (!grupoSnapshot.exists() || grupoSnapshot.data().active !== true) {
        throw new Error('Este grupo não está disponível.');
    }

    const solicitacoesRef = collection(db, 'groupRequests');

    const solicitacaoExistente = query(
        solicitacoesRef,
        where('userId', '==', usuario.uid),
        where('groupId', '==', groupId),
        where('status', '==', 'pending')
    );

    const snapshot = await getDocs(solicitacaoExistente);

    if (!snapshot.empty) {
        throw new Error(
            'Você já possui uma solicitação pendente para este grupo.'
        );
    }

    const solicitacaoRef = await addDoc(solicitacoesRef, {
        userId: usuario.uid,
        groupId,
        status: 'pending',
        requestedAt: serverTimestamp(),
    });

    return solicitacaoRef.id;
}
