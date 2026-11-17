
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where,
} from 'firebase/firestore';

import { db } from '../../../services/firebase/firebaseConfig';

const meetingsCollection = collection(db, 'groupMeetings');

// Buscar personalizações dos encontros de um mês
export async function getGroupMeetingsForMonth(year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

  const lastDay = new Date(year, month, 0).getDate();

  const endDate =
    `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const meetingsQuery = query(
    meetingsCollection,
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  const snapshot = await getDocs(meetingsQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

// Salvar ou atualizar uma personalização de encontro
export async function saveGroupMeeting(meetingData) {
  const {
    groupId,
    scheduleId,
    groupName,
    date,
    startTime,
    endTime,
    workshopId = null,
    workshopName = '',
  } = meetingData;

  if (!groupId || scheduleId === undefined || scheduleId === null || !date) {
    throw new Error('Dados de identificação do encontro incompletos.');
  }

  const meetingId = [
    groupId,
    scheduleId,
    date,
  ].map(encodeURIComponent).join('__');

  const meetingRef = doc(db, 'groupMeetings', meetingId);

  const existingMeeting = await getDoc(meetingRef);

  await setDoc(meetingRef, {
    groupId,
    scheduleId,
    groupName,
    date,
    startTime,
    endTime,
    workshopId,
    workshopName,
    createdAt: existingMeeting.exists()
      ? existingMeeting.data().createdAt
      : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return meetingId;
}
