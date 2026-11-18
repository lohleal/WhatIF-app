import {
    collection,
    getDocs,
    query,
    where,
} from 'firebase/firestore';

import { db } from '../../../services/firebase/firebaseConfig';

export async function buscarGruposAtivos() {
    const gruposQuery = query(
        collection(db, 'groups'),
        where('active', '==', true)
    );

    const snapshot = await getDocs(gruposQuery);

    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
    }));
}
