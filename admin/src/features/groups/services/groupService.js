
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { db } from '../../../services/firebase/firebaseConfig';

const groupsCollection = collection(db, 'groups');

// Cadastrar um novo grupo
export async function createGroup(groupData) {
  const group = {
    name: groupData.name.trim(),
    description: groupData.description.trim(),
    schedule: groupData.schedule,
    active: true,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(groupsCollection, group);

  return {
    id: docRef.id,
    ...group,
  };
}

// Buscar grupos cadastrados
export async function getGroups() {
  const snapshot = await getDocs(groupsCollection);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

// Buscar somente grupos ativos
export async function getActiveGroups() {
  const activeGroupsQuery = query(
    groupsCollection,
    where('active', '==', true)
  );

  const snapshot = await getDocs(activeGroupsQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}
