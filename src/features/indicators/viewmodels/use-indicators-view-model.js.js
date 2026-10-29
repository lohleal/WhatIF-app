
import { useEffect, useMemo, useState } from 'react';
import {
    collection,
    onSnapshot,
    query,
    where,
} from 'firebase/firestore';

import { auth, db } from '../../../services/firebase/firebaseConfig';

// Estilos visuais dos indicadores
const INDICATOR_STYLES = [
    {
        iconName: 'water-outline',
        iconColor: '#5A8EAD',
        backgroundColor: '#DCEFF5',
    },
    {
        iconName: 'moon-waning-crescent',
        iconColor: '#5A8E43',
        backgroundColor: '#DDECC5',
    },
    {
        iconName: 'dumbbell',
        iconColor: '#69A7FF',
        backgroundColor: '#DCEBFF',
    },
    {
        iconName: 'book-open-outline',
        iconColor: '#9571B4',
        backgroundColor: '#F0E5F8',
    },
    {
        iconName: 'heart-outline',
        iconColor: '#FF6C6C',
        backgroundColor: '#FFF0EF',
    },
];

// Escolhe um estilo de acordo com o tipo ou nome do indicador
function getIndicatorStyle(indicator, index) {
    const text = `${indicator.type ?? ''} ${indicator.name ?? ''}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    if (text.includes('agua') || text.includes('hidrat')) {
        return INDICATOR_STYLES[0];
    }

    if (text.includes('sono') || text.includes('dorm')) {
        return INDICATOR_STYLES[1];
    }

    if (
        text.includes('treino') ||
        text.includes('treinar') ||
        text.includes('exercicio') ||
        text.includes('atividade fisica')
    ) {
        return INDICATOR_STYLES[2];
    }

    if (
        text.includes('estudo') ||
        text.includes('estudar') ||
        text.includes('leitura') ||
        text.includes('livro')
    ) {
        return INDICATOR_STYLES[3];
    }

    if (
        text.includes('humor') ||
        text.includes('saude') ||
        text.includes('bem-estar')
    ) {
        return INDICATOR_STYLES[4];
    }

    // Estilo padrão para indicadores sem correspondência
    return INDICATOR_STYLES[index % INDICATOR_STYLES.length];
}

function formatIndicatorValue(indicator) {
    const type = (indicator.type ?? '').toLowerCase();

    if (type === 'conclusao') {
        return indicator.completed ? 'Concluído' : 'Não concluído';
    }

    const target = indicator.target;
    const unit = indicator.unit?.trim();

    if (target !== undefined && target !== null && target !== '') {
        return unit ? `${target} ${unit}` : String(target);
    }

    return indicator.description ?? '';
}

export default function useIndicatorsViewModel() {
    const [indicators, setIndicators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribe;

        const unsubscribeAuth = auth.onAuthStateChanged
            ? auth.onAuthStateChanged((usuario) => {
                  if (unsubscribe) {
                      unsubscribe();
                      unsubscribe = undefined;
                  }

                  if (!usuario) {
                      setIndicators([]);
                      setError('Nenhum usuário está autenticado.');
                      setLoading(false);
                      return;
                  }

                  setLoading(true);
                  setError(null);

                  const consulta = query(
                      collection(db, 'indicators'),
                      where('userId', '==', usuario.uid)
                  );

                  unsubscribe = onSnapshot(
                      consulta,
                      (snapshot) => {
                          const dados = snapshot.docs.map(
                              (documento, index) => {
                                  const indicador = documento.data();
                                  const visual = getIndicatorStyle(
                                      indicador,
                                      index
                                  );

                                  return {
                                      ...indicador,
                                      id: documento.id,
                                      title:
                                          indicador.name ??
                                          'Indicador sem nome',
                                      completed:
                                          indicador.completed ?? false,
                                      value: formatIndicatorValue(indicador),
                                      ...visual,
                                  };
                              }
                          );

                          setIndicators(dados);
                          setLoading(false);
                          setError(null);
                      },
                      (erro) => {
                          console.error(
                              'Erro ao carregar indicadores:',
                              erro
                          );
                          setError('Não foi possível carregar os indicadores.');
                          setLoading(false);
                      }
                  );
              })
            : null;

        // Compatibilidade com configurações que não usam o listener de autenticação
        if (!unsubscribeAuth) {
            const usuario = auth.currentUser;

            if (!usuario) {
                setIndicators([]);
                setError('Nenhum usuário está autenticado.');
                setLoading(false);
            } else {
                const consulta = query(
                    collection(db, 'indicators'),
                    where('userId', '==', usuario.uid)
                );

                unsubscribe = onSnapshot(
                    consulta,
                    (snapshot) => {
                        const dados = snapshot.docs.map(
                            (documento, index) => {
                                const indicador = documento.data();

                                return {
                                    ...indicador,
                                    id: documento.id,
                                    title:
                                        indicador.name ??
                                        'Indicador sem nome',
                                    completed:
                                        indicador.completed ?? false,
                                    value: formatIndicatorValue(indicador),
                                    ...getIndicatorStyle(indicador, index),
                                };
                            }
                        );

                        setIndicators(dados);
                        setLoading(false);
                        setError(null);
                    },
                    (erro) => {
                        console.error(
                            'Erro ao carregar indicadores:',
                            erro
                        );
                        setError('Não foi possível carregar os indicadores.');
                        setLoading(false);
                    }
                );
            }
        }

        return () => {
            if (unsubscribe) unsubscribe();
            if (unsubscribeAuth) unsubscribeAuth();
        };
    }, []);

    const completedCount = useMemo(
        () =>
            indicators.filter((indicator) => indicator.completed).length,
        [indicators]
    );

    const progress =
        indicators.length > 0
            ? completedCount / indicators.length
            : 0;

    return {
        indicators,
        completedCount,
        progress,
        loading,
        error,
    };
}
