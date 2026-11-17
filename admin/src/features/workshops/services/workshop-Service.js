
import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '../../../services/firebase/firebaseConfig';

// Referências das coleções
const workshopsRef = collection(db, 'workshopCatalog');
const categoriesRef = collection(db, 'workshopCategories');

// OFICINAS

// Busca oficinas não arquivadas
export async function getWorkshops() {
  const q = query(workshopsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((document) => ({
      id: document.id,
      ...document.data(),
    }))
    .filter((workshop) => workshop.active !== false);
}

// Cadastra uma nova oficina
export async function createWorkshop(workshopData) {
  const docRef = await addDoc(workshopsRef, {
    ...workshopData,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// Atualiza uma oficina existente
export async function updateWorkshop(id, workshopData) {
  const workshopRef = doc(db, 'workshopCatalog', id);

  await updateDoc(workshopRef, {
    ...workshopData,
    updatedAt: serverTimestamp(),
  });
}

// Arquiva uma oficina, sem apagar do banco
export async function archiveWorkshop(id) {
  const workshopRef = doc(db, 'workshopCatalog', id);

  await updateDoc(workshopRef, {
    active: false,
    archivedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Mantém compatibilidade com chamadas antigas.
// IMPORTANTE: não exclui permanentemente.
export async function deleteWorkshop(id) {
  return archiveWorkshop(id);
}

// Recupera uma oficina arquivada
export async function restoreWorkshop(id) {
  const workshopRef = doc(db, 'workshopCatalog', id);

  await updateDoc(workshopRef, {
    active: true,
    archivedAt: deleteField(),
    updatedAt: serverTimestamp(),
  });
}

// CATEGORIAS

// Busca categorias não arquivadas
export async function getCategories() {
  const q = query(categoriesRef, orderBy('name'));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((document) => ({
      id: document.id,
      ...document.data(),
    }))
    .filter((category) => category.active !== false);
}

// Cadastra uma nova categoria
export async function createCategory(name) {
  const docRef = await addDoc(categoriesRef, {
    name,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// Atualiza o nome da categoria e das oficinas vinculadas
export async function updateCategory(id, name) {
  const categoryRef = doc(db, 'workshopCategories', id);
  const categorySnapshot = await getDoc(categoryRef);

  if (!categorySnapshot.exists()) {
    throw new Error('Categoria não encontrada.');
  }

  const oldName = categorySnapshot.data().name;

  const linkedQuery = query(
    workshopsRef,
    where('category', '==', oldName)
  );

  const linkedSnapshot = await getDocs(linkedQuery);

  // Atualiza o nome da categoria
  await updateDoc(categoryRef, {
    name,
    updatedAt: serverTimestamp(),
  });

  // Atualiza as oficinas vinculadas em lotes
  const documents = linkedSnapshot.docs;

  for (let i = 0; i < documents.length; i += 450) {
    const batch = writeBatch(db);
    const chunk = documents.slice(i, i + 450);

    chunk.forEach((document) => {
      batch.update(document.ref, {
        category: name,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }
}

// Arquiva uma categoria e deixa suas oficinas sem categoria
export async function archiveCategory(id) {
  const categoryRef = doc(db, 'workshopCategories', id);
  const categorySnapshot = await getDoc(categoryRef);

  if (!categorySnapshot.exists()) {
    throw new Error('Categoria não encontrada.');
  }

  const categoryName = categorySnapshot.data().name;

  const linkedQuery = query(
    workshopsRef,
    where('category', '==', categoryName)
  );

  const linkedSnapshot = await getDocs(linkedQuery);

  // Arquiva a categoria
  await updateDoc(categoryRef, {
    active: false,
    archivedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Remove apenas o vínculo das oficinas com a categoria
  // Os documentos das oficinas continuam preservados
  const documents = linkedSnapshot.docs;

  for (let i = 0; i < documents.length; i += 450) {
    const batch = writeBatch(db);
    const chunk = documents.slice(i, i + 450);

    chunk.forEach((document) => {
      batch.update(document.ref, {
        category: '',
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }
}

// Mantém compatibilidade com chamadas antigas.
// IMPORTANTE: não exclui permanentemente.
export async function deleteCategory(id) {
  return archiveCategory(id);
}

// Recupera uma categoria arquivada
export async function restoreCategory(id) {
  const categoryRef = doc(db, 'workshopCategories', id);

  await updateDoc(categoryRef, {
    active: true,
    archivedAt: deleteField(),
    updatedAt: serverTimestamp(),
  });
}
