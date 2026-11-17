
import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
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

// Escolher estilo de acordo com o tipo ou nome
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

    return INDICATOR_STYLES[index % INDICATOR_STYLES.length];
}

// Formatar a meta do indicador
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
        let unsubscribeIndicators;
        const unsubscribeProgress = new Map();

        const unsubscribeAuth = onAuthStateChanged(auth, (usuario) => {
            // Encerrar escutas anteriores
            if (unsubscribeIndicators) {
                unsubscribeIndicators();
                unsubscribeIndicators = undefined;
            }

            unsubscribeProgress.forEach((unsubscribe) => unsubscribe());
            unsubscribeProgress.clear();

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

            unsubscribeIndicators = onSnapshot(
                consulta,
                (snapshot) => {
                    // Considerar apenas indicadores não arquivados
                    const documentosAtivos = snapshot.docs.filter(
                        (documento) => documento.data().active !== false
                    );

                    const idsAtivos = new Set(
                        documentosAtivos.map((documento) => documento.id)
                    );

                    // Encerrar escutas de indicadores removidos ou arquivados
                    unsubscribeProgress.forEach((unsubscribe, id) => {
                        if (!idsAtivos.has(id)) {
                            unsubscribe();
                            unsubscribeProgress.delete(id);
                        }
                    });

                    const dados = documentosAtivos.map(
                        (documento, index) => {
                            const indicador = documento.data();
                            const visual = getIndicatorStyle(
                                indicador,
                                index
                            );

                            const currentValue = Number(
                                indicador.currentValue ?? 0
                            );

                            const completed = indicador.type === 'conclusao'
                                ? Boolean(indicador.completed)
                                : indicador.target != null &&
                                  currentValue >= Number(indicador.target);

                            return {
                                ...indicador,
                                id: documento.id,

                                title: indicador.name ?? 'Indicador sem nome',
                                description: indicador.description ?? '',

                                target: indicador.target ?? null,
                                currentValue,
                                unit: indicador.unit ?? '',

                                frequency: indicador.frequency ?? '',
                                selectedDays: indicador.selectedDays ?? [],

                                completed,

                                value: formatIndicatorValue({
                                    ...indicador,
                                    completed,
                                }),

                                progressLabel:
                                    indicador.type === 'conclusao'
                                        ? (completed ? 'Concluído' : 'Não concluído')
                                        : `${currentValue} / ${indicador.target ?? 0} ${indicador.unit ?? ''}`.trim(),

                                iconName:
                                    indicador.iconName ?? visual.iconName,

                                iconColor:
                                    indicador.iconColor ?? visual.iconColor,

                                backgroundColor:
                                    indicador.backgroundColor ??
                                    visual.backgroundColor,
                            };
                        }
                    );

                    setIndicators(dados);
                    setLoading(false);
                    setError(null);

                    // Criar uma escuta para o histórico de cada indicador
                    documentosAtivos.forEach((documento) => {
                        const id = documento.id;

                        // Evitar criar escutas duplicadas
                        if (unsubscribeProgress.has(id)) {
                            return;
                        }

                        const referenciaHistorico = collection(
                            db,
                            'indicators',
                            id,
                            'progress'
                        );

                        const unsubscribe = onSnapshot(
                            referenciaHistorico,
                            (historicoSnapshot) => {
                                const indicadorAtual = documento.data();

                                const registros = historicoSnapshot.docs.map(
                                    (registro) => registro.data()
                                );

                                const possuiHistorico = registros.length > 0;

                                // Somar todos os registros de progresso
                                // Se for um indicador antigo sem histórico,
                                // manter temporariamente os valores anteriores.
                                const currentValue = possuiHistorico
                                    ? registros.reduce(
                                        (total, registro) =>
                                            total + Number(registro.amount || 0),
                                        0
                                    )
                                    : Number(indicadorAtual.currentValue ?? 0);

                                const completed =
                                    indicadorAtual.type === 'conclusao'
                                        ? possuiHistorico
                                            ? currentValue >= 1
                                            : Boolean(indicadorAtual.completed)
                                        : indicadorAtual.target != null &&
                                          currentValue >= Number(indicadorAtual.target);

                                setIndicators((anteriores) =>
                                    anteriores.map((item) => {
                                        if (item.id !== id) {
                                            return item;
                                        }

                                        return {
                                            ...item,
                                            currentValue,
                                            completed,

                                            value: formatIndicatorValue({
                                                ...indicadorAtual,
                                                completed,
                                            }),

                                            progressLabel:
                                                indicadorAtual.type === 'conclusao'
                                                    ? (completed
                                                        ? 'Concluído'
                                                        : 'Não concluído')
                                                    : `${currentValue} / ${indicadorAtual.target ?? 0} ${indicadorAtual.unit ?? ''}`.trim(),
                                        };
                                    })
                                );
                            },
                            (erro) => {
                                console.error(
                                    `Erro ao acompanhar progresso do indicador ${id}:`,
                                    erro
                                );
                            }
                        );

                        unsubscribeProgress.set(id, unsubscribe);
                    });
                },
                (erro) => {
                    console.error('Erro ao carregar indicadores:', erro);

                    setError('Não foi possível carregar os indicadores.');
                    setLoading(false);
                }
            );
        });

        return () => {
            if (unsubscribeIndicators) {
                unsubscribeIndicators();
            }

            unsubscribeProgress.forEach((unsubscribe) => unsubscribe());
            unsubscribeAuth();
        };
    }, []);

    // Quantidade de indicadores concluídos
    const completedCount = useMemo(
        () => indicators.filter((indicator) => indicator.completed).length,
        [indicators]
    );

    // Progresso geral dos indicadores
    const progress = indicators.length > 0
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
