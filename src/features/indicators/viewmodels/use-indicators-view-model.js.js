import { useMemo, useState } from 'react';

const INITIAL_INDICATORS = [
    {
        id: 'agua',
        title: 'Água',
        value: '0/8 copos',
        iconName: 'water-outline',
        iconColor: '#8A8A8A',
        backgroundColor: '#F3F3F3',
        completed: false,
    },
    {
        id: 'sono',
        title: 'Sono',
        value: '7h 30min',
        iconName: 'moon-waning-crescent',
        iconColor: '#5A8E43',
        backgroundColor: '#DDECC5',
        completed: true,
    },
    {
        id: 'treinar',
        title: 'Treinar',
        value: '45 min',
        iconName: 'dumbbell',
        iconColor: '#69A7FF',
        backgroundColor: '#DCEBFF',
        completed: true,
    },
    {
        id: 'estudar',
        title: 'Estudar',
        value: '2h',
        iconName: 'book-open-outline',
        iconColor: '#5A8E43',
        backgroundColor: '#DDECC5',
        completed: true,
    },
    {
        id: 'alimentacao',
        title: 'Alimentação saudável',
        value: '0/3 refeições',
        iconName: 'food-apple-outline',
        iconColor: '#8A8A8A',
        backgroundColor: '#F3F3F3',
        completed: false,
    },
    {
        id: 'meditar',
        title: 'Meditar',
        value: '10 min',
        iconName: 'meditation',
        iconColor: '#69A7FF',
        backgroundColor: '#DCEBFF',
        completed: true,
    },
    {
        id: 'organizar',
        title: 'Organizar',
        value: '0/1 tarefa',
        iconName: 'notebook-outline',
        iconColor: '#8A8A8A',
        backgroundColor: '#F3F3F3',
        completed: false,
    },
    {
        id: 'conectar',
        title: 'Conectar',
        value: '0 conversa',
        iconName: 'account-group-outline',
        iconColor: '#8A8A8A',
        backgroundColor: '#F3F3F3',
        completed: false,
    },
    {
        id: 'gratidao',
        title: 'Gratidão',
        value: '1/1 registro',
        iconName: 'heart-outline',
        iconColor: '#FF6C6C',
        backgroundColor: '#FFF0EF',
        completed: true,
    },
    {
        id: 'respirar',
        title: 'Respirar',
        value: '5/5 min',
        iconName: 'weather-windy',
        iconColor: '#5E90D8',
        backgroundColor: '#DCEBFF',
        completed: true,
    },
    {
        id: 'caminhar',
        title: 'Caminhar',
        value: '0/30 min',
        iconName: 'walk',
        iconColor: '#8A8A8A',
        backgroundColor: '#F3F3F3',
        completed: false,
    },
    {
        id: 'pausa-digital',
        title: 'Pausa digital',
        value: '30/30 min',
        iconName: 'cellphone',
        iconColor: '#8A8A8A',
        backgroundColor: '#F3F3F3',
        completed: false,
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

            return [...currentIndicators, indicator];
        });
    }

    return {
        indicators,
        completedCount,
        progress,
        addIndicator,
    };
}