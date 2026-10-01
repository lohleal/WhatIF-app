import { useMemo, useState } from 'react';

const INITIAL_INDICATORS = [
    {
        id: 'agua',
        title: 'Água',
        value: '0/8 copos',
        icon: '💧',
        backgroundColor: '#F6F6F6',
        completed: false,
    },
    {
        id: 'sono',
        title: 'Sono',
        value: '7h 30min',
        icon: '🌙',
        backgroundColor: '#E2F0C9',
        completed: true,
    },
    {
        id: 'treinar',
        title: 'Treinar',
        value: '45 min',
        icon: '🏋️',
        backgroundColor: '#D8EAFE',
        completed: true,
    },
    {
        id: 'estudar',
        title: 'Estudar',
        value: '2h',
        icon: '📖',
        backgroundColor: '#E2F0C9',
        completed: true,
    },
    {
        id: 'alimentacao',
        title: 'Alimentação saudável',
        value: '0/3 refeições',
        icon: '🍎',
        backgroundColor: '#F6F6F6',
        completed: false,
    },
    {
        id: 'meditar',
        title: 'Meditar',
        value: '10 min',
        icon: '🧘',
        backgroundColor: '#D8EAFE',
        completed: true,
    },
    {
        id: 'organizar',
        title: 'Organizar',
        value: '0/1 tarefa',
        icon: '📝',
        backgroundColor: '#F6F6F6',
        completed: false,
    },
    {
        id: 'conectar',
        title: 'Conectar',
        value: '0 conversa',
        icon: '👥',
        backgroundColor: '#F6F6F6',
        completed: false,
    },
    {
        id: 'gratidao',
        title: 'Gratidão',
        value: '1/1 registro',
        icon: '♡',
        backgroundColor: '#FFF0EE',
        completed: true,
    },
    {
        id: 'respirar',
        title: 'Respirar',
        value: '5/5 min',
        icon: '🌬️',
        backgroundColor: '#D8EAFE',
        completed: true,
    },
    {
        id: 'caminhar',
        title: 'Caminhar',
        value: '0/30 min',
        icon: '🚶',
        backgroundColor: '#F6F6F6',
        completed: false,
    },
    {
        id: 'pausa-digital',
        title: 'Pausa digital',
        value: '30/30 min',
        icon: '📱',
        backgroundColor: '#F6F6F6',
        completed: true,
    },
];

export default function useIndicatorsViewModel() {
    const [indicators, setIndicators] =
        useState(INITIAL_INDICATORS);

    const completedCount = useMemo(() => {
        return indicators.filter(
            (indicator) => indicator.completed
        ).length;
    }, [indicators]);

    const progress = indicators.length
        ? completedCount / indicators.length
        : 0;

    function addIndicator(indicator) {
        setIndicators((currentIndicators) => {
            const alreadyExists =
                currentIndicators.some(
                    (item) => item.id === indicator.id
                );

            if (alreadyExists) {
                return currentIndicators;
            }

            return [
                ...currentIndicators,
                indicator,
            ];
        });
    }

    return {
        indicators,
        completedCount,
        progress,
        addIndicator,
    };
}