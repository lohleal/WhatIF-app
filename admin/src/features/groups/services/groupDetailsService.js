
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../../../services/firebase/firebaseConfig';

function getDateKey(record) {
  if (record.dateKey) return record.dateKey;

  const date = record.createdAt?.toDate?.();
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatTotal(total, unit) {
  if (unit?.toLowerCase() === 'ml') {
    return {
      total: total / 1000,
      unit: 'L',
    };
  }

  return {
    total,
    unit: unit || 'registros',
  };
}

export async function getGroupDetails(groupId, selectedMonth) {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnapshot = await getDoc(groupRef);

  if (!groupSnapshot.exists()) {
    throw new Error('Grupo não encontrado.');
  }

  const usersQuery = query(
    collection(db, 'users'),
    where('grupoId', '==', groupId)
  );

  const usersSnapshot = await getDocs(usersQuery);

  const students = usersSnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));

  const indicatorsByStudent = await Promise.all(
    students.map(async (student) => {
      const indicatorsQuery = query(
        collection(db, 'indicators'),
        where('userId', '==', student.id)
      );

      const indicatorsSnapshot = await getDocs(indicatorsQuery);

      return indicatorsSnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
        studentId: student.id,
      }));
    })
  );

  const indicators = indicatorsByStudent.flat();

  const indicatorsWithProgress = await Promise.all(
    indicators.map(async (indicator) => {
      const progressRef = collection(
        db,
        'indicators',
        indicator.id,
        'progress'
      );

      const progressSnapshot = await getDocs(progressRef);

      const student = students.find(
        (item) => item.id === indicator.studentId
      );

      const joinedAt = student?.joinedAt?.toMillis?.();

      const records = progressSnapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .filter((record) => {
          const recordDate = record.createdAt?.toMillis?.();

          if (joinedAt == null || recordDate == null) {
            return true;
          }

          return recordDate >= joinedAt;
        });

      const monthlyRecords = records.filter((record) => {
        const dateKey = getDateKey(record);
        return dateKey?.startsWith(selectedMonth);
      });

      const total = monthlyRecords.reduce(
        (sum, record) => sum + Number(record.amount || 0),
        0
      );

      const unit = indicator.unit || '';

      const formatted = formatTotal(total, unit);

      return {
        ...indicator,
        records,
        monthlyRecords,
        monthlyTotal: formatted.total,
        monthlyUnit: formatted.unit,
      };
    })
  );

  const activeIndicators = indicatorsWithProgress.filter(
    (indicator) => indicator.active !== false
  );

  const indicatorSummary = Object.values(
    activeIndicators.reduce((summary, indicator) => {
      const key = `${indicator.name || 'Sem nome'}-${indicator.monthlyUnit}`;

      if (!summary[key]) {
        summary[key] = {
          name: indicator.name || 'Sem nome',
          unit: indicator.monthlyUnit,
          total: 0,
          records: 0,
        };
      }

      summary[key].total += indicator.monthlyTotal;
      summary[key].records += indicator.monthlyRecords.length;

      return summary;
    }, {})
  ).sort((a, b) => b.total - a.total);

  return {
    group: {
      id: groupSnapshot.id,
      ...groupSnapshot.data(),
    },
    students,
    indicators: activeIndicators,
    indicatorSummary,
  };
}
