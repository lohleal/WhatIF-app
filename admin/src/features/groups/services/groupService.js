
import {
  addDoc,
  collection,
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

const groupsCollection = collection(db, 'groups');

// CADASTRAR UM NOVO GRUPO
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

// BUSCAR GRUPOS CADASTRADOS
export async function getGroups() {
  const snapshot = await getDocs(groupsCollection);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

// BUSCAR SOMENTE GRUPOS ATIVOS
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

// BUSCAR UM GRUPO PELO ID
export async function getGroupById(id) {
  const groupRef = doc(db, 'groups', id);
  const snapshot = await getDoc(groupRef);

  if (!snapshot.exists()) {
    throw new Error('Grupo não encontrado.');
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// ATUALIZAR UM GRUPO
export async function updateGroup(id, groupData) {
  const groupRef = doc(db, 'groups', id);

  await updateDoc(groupRef, {
    name: groupData.name.trim(),
    description: groupData.description.trim(),
    schedule: groupData.schedule,
    updatedAt: serverTimestamp(),
  });
}

// BUSCAR SOLICITAÇÕES PENDENTES
export async function getPendingGroupRequests() {
  const requestsCollection = collection(db, 'groupRequests');

  const pendingQuery = query(
    requestsCollection,
    where('status', '==', 'pending'),
    orderBy('requestedAt', 'desc')
  );

  const snapshot = await getDocs(pendingQuery);

  const requests = await Promise.all(
    snapshot.docs.map(async (requestDocument) => {
      const request = requestDocument.data();

      const userRef = doc(db, 'users', request.userId);
      const groupRef = doc(db, 'groups', request.groupId);

      const [userSnapshot, groupSnapshot] = await Promise.all([
        getDoc(userRef),
        getDoc(groupRef),
      ]);

      const student = userSnapshot.exists()
        ? userSnapshot.data()
        : {};

      const group = groupSnapshot.exists()
        ? groupSnapshot.data()
        : {};

      return {
        id: requestDocument.id,
        ...request,
        studentName: [
          student.nome,
          student.sobrenome,
        ].filter(Boolean).join(' ') || 'Aluno não identificado',
        studentEmail: student.email || '',
        groupName: group.name || 'Grupo não encontrado',
      };
    })
  );

  return requests;
}

// APROVAR SOLICITAÇÃO E VINCULAR ALUNO AO GRUPO
export async function approveGroupRequest(requestId, userId, groupId) {
  if (!requestId || !userId || !groupId) {
    throw new Error('Dados da solicitação incompletos.');
  }

  const requestRef = doc(db, 'groupRequests', requestId);
  const userRef = doc(db, 'users', userId);
  const groupRef = doc(db, 'groups', groupId);

  const [requestSnapshot, userSnapshot, groupSnapshot] =
    await Promise.all([
      getDoc(requestRef),
      getDoc(userRef),
      getDoc(groupRef),
    ]);

  if (!requestSnapshot.exists()) {
    throw new Error('Solicitação não encontrada.');
  }

  if (requestSnapshot.data().status !== 'pending') {
    throw new Error('Esta solicitação já foi respondida.');
  }

  if (
    requestSnapshot.data().userId !== userId ||
    requestSnapshot.data().groupId !== groupId
  ) {
    throw new Error('Os dados da solicitação não correspondem.');
  }

  if (!userSnapshot.exists()) {
    throw new Error('Aluno não encontrado.');
  }

  if (userSnapshot.data().grupoId !== null) {
    throw new Error('Este aluno já pertence a um grupo.');
  }

  if (!groupSnapshot.exists() || groupSnapshot.data().active !== true) {
    throw new Error('Este grupo não está disponível.');
  }

  const batch = writeBatch(db);

  batch.update(userRef, {
    grupoId: groupId,
    joinedAt: serverTimestamp(),
    groupRequestId: requestId,
  });

  batch.update(requestRef, {
    status: 'approved',
    respondedAt: serverTimestamp(),
  });

  await batch.commit();
}

// RECUSAR SOLICITAÇÃO
export async function rejectGroupRequest(requestId) {
  if (!requestId) {
    throw new Error('ID da solicitação não informado.');
  }

  const requestRef = doc(db, 'groupRequests', requestId);
  const requestSnapshot = await getDoc(requestRef);

  if (!requestSnapshot.exists()) {
    throw new Error('Solicitação não encontrada.');
  }

  if (requestSnapshot.data().status !== 'pending') {
    throw new Error('Esta solicitação já foi respondida.');
  }

  await updateDoc(requestRef, {
    status: 'rejected',
    respondedAt: serverTimestamp(),
  });
}


// DESATIVAR OU REATIVAR UM GRUPO
export async function updateGroupStatus(id, active) {
  if (!id || typeof active !== 'boolean') {
    throw new Error('Dados para atualização do grupo inválidos.');
  }

  const groupRef = doc(db, 'groups', id);

  await updateDoc(groupRef, {
    active,
    updatedAt: serverTimestamp(),
  });
}

