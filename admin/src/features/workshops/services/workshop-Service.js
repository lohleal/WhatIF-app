
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';

import { db } from '../../../services/firebase/firebaseConfig';

// Referências das coleções
const workshopsRef = collection(db, 'workshopCatalog');
const categoriesRef = collection(db, 'workshopCategories');

// OFICINAS

export async function getWorkshops() {
  const q = query(workshopsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function createWorkshop(workshopData) {
  const docRef = await addDoc(workshopsRef, {
    ...workshopData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateWorkshop(id, workshopData) {
  const workshopRef = doc(db, 'workshopCatalog', id);

  await updateDoc(workshopRef, {
    ...workshopData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWorkshop(id) {
  const workshopRef = doc(db, 'workshopCatalog', id);
  await deleteDoc(workshopRef);
}

// CATEGORIAS

export async function getCategories() {
  const q = query(categoriesRef, orderBy('name'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function createCategory(name) {
  const docRef = await addDoc(categoriesRef, {
    name,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateCategory(id, name) {
  const categoryRef = doc(db, 'workshopCategories', id);

  await updateDoc(categoryRef, {
    name,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(id) {
  const categoryRef = doc(db, 'workshopCategories', id);
  await deleteDoc(categoryRef);
}
