
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

// CORES
const PURPLE = '#B37BC9';
const DARK_PURPLE = '#704486';
const LIGHT_PURPLE = '#FAF3FD';
const BORDER = '#EADCF0';
const MUTED = '#91849A';
const WHITE = '#FFFFFF';

// DADOS FICTÍCIOS
const dadosHoje = [
    { horario: 'Última noite', horas: 7.5 },
];

const dadosSemana = [
    { horario: 'Seg', horas: 7.5 },
    { horario: 'Ter', horas: 6.5 },
    { horario: 'Qua', horas: 8 },
    { horario: 'Qui', horas: 7 },
    { horario: 'Sex', horas: 8.5 },
    { horario: 'Sáb', horas: 9 },
    { horario: 'Dom', horas: 7.5 },
];

const dadosMes = [
    { horario: 'Sem. 1', horas: 7.2 },
    { horario: 'Sem. 2', horas: 7.8 },
    { horario: 'Sem. 3', horas: 6.9 },
    { horario: 'Sem. 4', horas: 8.1 },
];

export default function HistoricoSono() {
    const router = useRouter();

    const [periodo, setPeriodo] = useState('Hoje');
    const [meta, setMeta] = useState(8);

    const dadosPeriodo =
        periodo === 'Hoje'
            ? dadosHoje
            : periodo === 'Semana'
                ? dadosSemana
                : dadosMes;

    const totalPeriodo = dadosPeriodo.reduce(
        (soma, item) => soma + item.horas,
        0
    );

    const diasDoPeriodo =
        periodo === 'Hoje' ? 1 : periodo === 'Semana' ? 7 : 28;

    const mediaDiaria = totalPeriodo / diasDoPeriodo;

    const metaPeriodo =
        periodo === 'Hoje'
            ? meta
            : periodo === 'Semana'
                ? meta * 7
                : meta * 28;

    const porcentagem = Math.min(
        Math.round((totalPeriodo / metaPeriodo) * 100),
        100
    );

    const melhorPeriodo = dadosPeriodo.reduce(
        (maior, item) =>
            item.horas > maior.horas ? item : maior,
        dadosPeriodo[0]
    );

    const maximoGrafico = Math.max(
        ...dadosPeriodo.map((item) => item.horas),
        1
    );

    const tituloGrafico =
        periodo === 'Hoje'
            ? 'Duração da última noite'
            : periodo === 'Semana'
                ? 'Horas dormidas por dia'
                : 'Média de sono por semana';

    const tituloMaior =
        periodo === 'Hoje'
            ? 'Duração do último sono'
            : periodo === 'Semana'
                ? 'Melhor noite'
                : 'Semana com maior duração';

    const tituloTotal =
        periodo === 'Hoje'
            ? 'Sono da última noite'
            : periodo === 'Semana'
                ? 'Sono acumulado na semana'
                : 'Sono acumulado no mês';

    function formatarHoras(valor) {
        const horas = Math.floor(valor);
        const minutos = Math.round((valor - horas) * 60);

        return `${horas}h${minutos > 0 ? ` ${minutos}min` : ''}`;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* CABEÇALHO */}
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}
                        accessibilityLabel="Voltar"
                    >
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color={DARK_PURPLE}
                        />
                    </Pressable>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>
                            Meu progresso
                        </Text>
                    </View>

                    <View style={styles.headerIcon}>
                        <MaterialCommunityIcons
                            name="moon-waning-crescent"
                            size={25}
                            color={PURPLE}
                        />
                    </View>
                </View>

                {/* SELEÇÃO DE PERÍODO */}
                <View style={styles.tabs}>
                    {['Hoje', 'Semana', 'Mês'].map((item) => (
                        <Pressable
                            key={item}
                            onPress={() => setPeriodo(item)}
                            style={[
                                styles.tab,
                                periodo === item && styles.activeTab,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    periodo === item && styles.activeTabText,
                                ]}
                            >
                                {item}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* RESUMO DO PERÍODO */}
                <View style={styles.card}>
                    <View style={styles.sectionHeading}>
                        <View style={styles.headingIcon}>
                            <MaterialCommunityIcons
                                name="sleep"
                                size={21}
                                color={PURPLE}
                            />
                        </View>

                        <View style={styles.headingText}>
                            <Text style={styles.sectionTitle}>
                                {periodo === 'Hoje'
                                    ? 'Seu descanso'
                                    : periodo === 'Semana'
                                        ? 'Sua semana'
                                        : 'Seu mês'}
                            </Text>

                            <Text style={styles.smallDescription}>
                                {periodo === 'Hoje'
                                    ? 'Resumo da última noite'
                                    : periodo === 'Semana'
                                        ? 'Resumo dos últimos 7 dias'
                                        : 'Resumo das últimas 4 semanas'}
                            </Text>
                        </View>
                    </View>

                    {periodo === 'Hoje' ? (
                        <View style={styles.summaryRow}>
                            <View style={styles.circle}>
                                <MaterialCommunityIcons
                                    name="moon-waning-crescent"
                                    size={25}
                                    color={PURPLE}
                                />

                                <Text style={styles.total}>
                                    {formatarHoras(totalPeriodo)}
                                </Text>

                                <Text style={styles.ofGoal}>
                                    de {meta}h
                                </Text>
                            </View>

                            <View style={styles.goalInfo}>
                                <View style={styles.goalIcon}>
                                    <Ionicons
                                        name="flag-outline"
                                        size={21}
                                        color={PURPLE}
                                    />
                                </View>

                                <Text style={styles.goalLabel}>
                                    Objetivo de sono
                                </Text>

                                <Text style={styles.goalValue}>
                                    {meta}h
                                </Text>

                                <View style={styles.track}>
                                    <View
                                        style={[
                                            styles.trackFill,
                                            { width: `${porcentagem}%` },
                                        ]}
                                    />
                                </View>

                                <Text style={styles.percent}>
                                    {porcentagem}% concluído
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.periodTotalBox}>
                                <View style={styles.periodSleepIcon}>
                                    <MaterialCommunityIcons
                                        name="sleep"
                                        size={30}
                                        color={PURPLE}
                                    />
                                </View>

                                <View style={styles.periodTotalText}>
                                    <Text style={styles.periodTotalLabel}>
                                        {tituloTotal}
                                    </Text>

                                    <Text style={styles.periodTotalValue}>
                                        {formatarHoras(totalPeriodo)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.track}>
                                <View
                                    style={[
                                        styles.trackFill,
                                        { width: `${porcentagem}%` },
                                    ]}
                                />
                            </View>

                            <View style={styles.periodProgressRow}>
                                <Text style={styles.percent}>
                                    {porcentagem}% do objetivo
                                </Text>

                                <Text style={styles.periodGoal}>
                                    Objetivo: {formatarHoras(metaPeriodo)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* ESTATÍSTICAS */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Ionicons
                                name="analytics-outline"
                                size={22}
                                color={PURPLE}
                            />
                        </View>

                        <Text style={styles.statLabel}>
                            Média diária
                        </Text>

                        <Text style={styles.statValue}>
                            {formatarHoras(mediaDiaria)}
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Ionicons
                                name="trophy-outline"
                                size={22}
                                color={PURPLE}
                            />
                        </View>

                        <Text style={styles.statLabel}>
                            {periodo === 'Hoje'
                                ? 'Última noite'
                                : periodo === 'Semana'
                                    ? 'Melhor noite'
                                    : 'Melhor semana'}
                        </Text>

                        <Text style={styles.statValue}>
                            {formatarHoras(melhorPeriodo.horas)}
                        </Text>

                        <Text style={styles.statDetail}>
                            {melhorPeriodo.horario}
                        </Text>
                    </View>
                </View>

                {/* GRÁFICO */}
                <View style={styles.card}>
                    <View style={styles.sectionHeading}>
                        <View style={styles.headingIcon}>
                            <Ionicons
                                name="stats-chart-outline"
                                size={20}
                                color={PURPLE}
                            />
                        </View>

                        <View style={styles.headingText}>
                            <Text style={styles.sectionTitle}>
                                {tituloGrafico}
                            </Text>

                            <Text style={styles.smallDescription}>
                                {periodo === 'Hoje'
                                    ? 'Duração do último registro'
                                    : periodo === 'Semana'
                                        ? 'Compare suas noites'
                                        : 'Compare as semanas do mês'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.peakInfo}>
                        <View style={styles.peakIconBox}>
                            <MaterialCommunityIcons
                                name="moon-full"
                                size={25}
                                color={PURPLE}
                            />
                        </View>

                        <View style={styles.peakText}>
                            <Text style={styles.peakLabel}>
                                {tituloMaior}
                            </Text>

                            <Text style={styles.peakValue}>
                                {melhorPeriodo.horario} ·{' '}
                                {formatarHoras(melhorPeriodo.horas)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.chart}>
                        {dadosPeriodo.map((item) => {
                            const destaque =
                                item.horario === melhorPeriodo.horario;

                            const altura =
                                (item.horas / maximoGrafico) * 100;

                            return (
                                <View
                                    key={item.horario}
                                    style={styles.barColumn}
                                >
                                    <Text style={styles.barValue}>
                                        {destaque
                                            ? formatarHoras(item.horas)
                                            : ''}
                                    </Text>

                                    <View style={styles.barTrack}>
                                        <View
                                            style={[
                                                styles.bar,
                                                { height: `${altura}%` },
                                                destaque && styles.barActive,
                                            ]}
                                        />
                                    </View>

                                    <Text
                                        style={styles.barLabel}
                                        numberOfLines={1}
                                    >
                                        {item.horario}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    <Text style={styles.chartCaption}>
                        Duração do sono em horas
                    </Text>
                </View>

                {/* COMPARAÇÃO */}
                <View style={styles.sectionHeadingOutside}>
                    <Text style={styles.sectionTitle}>
                        Comparação com seu objetivo
                    </Text>
                </View>

                <View style={styles.comparisonRow}>
                    <View style={styles.comparisonCard}>
                        <View style={styles.comparisonIconBox}>
                            <MaterialCommunityIcons
                                name="sleep"
                                size={23}
                                color={PURPLE}
                            />
                        </View>

                        <Text style={styles.comparisonLabel}>
                            Horas dormidas
                        </Text>

                        <Text style={styles.comparisonValue}>
                            {formatarHoras(totalPeriodo)}
                        </Text>

                        <Text style={styles.comparisonPercent}>
                            {porcentagem}% do objetivo
                        </Text>

                        <View style={styles.track}>
                            <View
                                style={[
                                    styles.trackFill,
                                    { width: `${porcentagem}%` },
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.comparisonCard}>
                        <View style={styles.comparisonIconBox}>
                            <Ionicons
                                name="flag-outline"
                                size={23}
                                color={PURPLE}
                            />
                        </View>

                        <Text style={styles.comparisonLabel}>
                            Objetivo do período
                        </Text>

                        <Text style={styles.comparisonValue}>
                            {formatarHoras(metaPeriodo)}
                        </Text>

                        <Text style={styles.comparisonPercent}>
                            100%
                        </Text>

                        <View style={styles.track}>
                            <View
                                style={[
                                    styles.trackFill,
                                    { width: '100%' },
                                ]}
                            />
                        </View>
                    </View>
                </View>

                
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: WHITE,
    },

    content: {
        paddingHorizontal: 22,
        paddingTop: 12,
        paddingBottom: 30,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: LIGHT_PURPLE,
        borderWidth: 1,
        borderColor: BORDER,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    headerText: {
        flex: 1,
    },

    title: {
        fontSize: 26,
        fontWeight: '800',
        color: DARK_PURPLE,
        letterSpacing: -0.5,
    },

    subtitle: {
        fontSize: 13,
        color: MUTED,
        marginTop: 4,
    },

    headerIcon: {
        width: 43,
        height: 43,
        borderRadius: 15,
        backgroundColor: LIGHT_PURPLE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    tabs: {
        flexDirection: 'row',
        backgroundColor: LIGHT_PURPLE,
        borderRadius: 18,
        padding: 4,
        marginBottom: 19,
        borderWidth: 1,
        borderColor: BORDER,
    },

    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 14,
    },

    activeTab: {
        backgroundColor: PURPLE,
    },

    tabText: {
        color: DARK_PURPLE,
        fontWeight: '600',
        fontSize: 14,
    },

    activeTabText: {
        color: WHITE,
        fontWeight: '800',
    },

    card: {
        backgroundColor: LIGHT_PURPLE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 22,
        padding: 17,
        marginBottom: 19,
    },

    sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 17,
    },

    headingIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#F0E2F6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    headingText: {
        flex: 1,
    },

    sectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: DARK_PURPLE,
        letterSpacing: -0.2,
    },

    smallDescription: {
        fontSize: 12,
        color: MUTED,
        marginTop: 3,
    },

    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
    },

    circle: {
        width: 135,
        height: 135,
        flexShrink: 0,
        borderRadius: 70,
        borderWidth: 8,
        borderColor: PURPLE,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    total: {
        fontSize: 25,
        fontWeight: '800',
        color: DARK_PURPLE,
        marginTop: 3,
    },

    ofGoal: {
        fontSize: 12,
        color: MUTED,
        marginTop: 2,
    },

    goalInfo: {
        flex: 1,
        backgroundColor: '#F0E2F6',
        borderRadius: 17,
        padding: 12,
    },

    goalIcon: {
        width: 33,
        height: 33,
        borderRadius: 11,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    goalLabel: {
        color: MUTED,
        fontSize: 12,
        marginTop: 7,
    },

    goalValue: {
        color: DARK_PURPLE,
        fontSize: 23,
        fontWeight: '800',
        marginTop: 3,
    },

    track: {
        height: 9,
        borderRadius: 10,
        backgroundColor: '#E9D9EF',
        overflow: 'hidden',
        marginTop: 10,
    },

    trackFill: {
        height: '100%',
        backgroundColor: PURPLE,
        borderRadius: 10,
    },

    percent: {
        color: DARK_PURPLE,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 7,
    },

    periodTotalBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        backgroundColor: '#F0E2F6',
        borderRadius: 17,
        padding: 15,
    },

    periodSleepIcon: {
        width: 54,
        height: 54,
        borderRadius: 17,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    periodTotalText: {
        flex: 1,
    },

    periodTotalLabel: {
        fontSize: 13,
        color: MUTED,
    },

    periodTotalValue: {
        fontSize: 30,
        fontWeight: '800',
        color: DARK_PURPLE,
        marginTop: 4,
    },

    periodProgressRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 5,
        marginTop: 3,
    },

    periodGoal: {
        fontSize: 11,
        color: MUTED,
        marginTop: 7,
    },

    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 19,
    },

    statCard: {
        flex: 1,
        minWidth: 0,
        backgroundColor: LIGHT_PURPLE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 18,
        padding: 13,
    },

    statIcon: {
        width: 39,
        height: 39,
        borderRadius: 13,
        backgroundColor: '#F0E2F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 9,
    },

    statLabel: {
        fontSize: 12,
        color: MUTED,
    },

    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: DARK_PURPLE,
        marginTop: 4,
    },

    statDetail: {
        fontSize: 12,
        color: PURPLE,
        fontWeight: '700',
        marginTop: 3,
    },

    peakInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        backgroundColor: '#F0E2F6',
        borderRadius: 15,
        padding: 12,
        marginBottom: 17,
    },

    peakIconBox: {
        width: 43,
        height: 43,
        borderRadius: 13,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    peakText: {
        flex: 1,
    },

    peakLabel: {
        color: MUTED,
        fontSize: 12,
    },

    peakValue: {
        color: DARK_PURPLE,
        fontSize: 15,
        fontWeight: '800',
        marginTop: 4,
    },

    chart: {
        height: 175,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        paddingTop: 20,
    },

    barColumn: {
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
    },

    barValue: {
        height: 19,
        fontSize: 10,
        color: DARK_PURPLE,
        fontWeight: '700',
        textAlign: 'center',
    },

    barTrack: {
        width: '55%',
        minWidth: 8,
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: '#EDE2F2',
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        overflow: 'hidden',
    },

    bar: {
        width: '100%',
        backgroundColor: '#D9B9E5',
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        minHeight: 4,
    },

    barActive: {
        backgroundColor: PURPLE,
    },

    barLabel: {
        color: DARK_PURPLE,
        fontSize: 11,
        fontWeight: '600',
        marginVertical: 8,
    },

    chartCaption: {
        color: MUTED,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 14,
    },

    sectionHeadingOutside: {
        marginTop: 1,
        marginBottom: 15,
    },

    comparisonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },

    comparisonCard: {
        flex: 1,
        minWidth: 0,
        padding: 13,
        backgroundColor: LIGHT_PURPLE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 18,
    },

    comparisonIconBox: {
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: '#F0E2F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 9,
    },

    comparisonLabel: {
        fontSize: 13,
        color: MUTED,
    },

    comparisonValue: {
        fontSize: 23,
        color: DARK_PURPLE,
        fontWeight: '800',
        marginTop: 4,
    },

    comparisonPercent: {
        fontSize: 12,
        color: DARK_PURPLE,
        marginTop: 4,
        fontWeight: '600',
    },

    goalButtons: {
        padding: 16,
        borderRadius: 19,
        backgroundColor: LIGHT_PURPLE,
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: 12,
    },

    goalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    goalButtonsTitle: {
        flex: 1,
        color: DARK_PURPLE,
        fontSize: 17,
        fontWeight: '800',
    },

    goalDescription: {
        color: MUTED,
        fontSize: 13,
        lineHeight: 19,
        marginTop: 9,
        marginBottom: 15,
    },

    goalOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    goalButton: {
        flexGrow: 1,
        paddingVertical: 11,
        paddingHorizontal: 13,
        borderRadius: 13,
        backgroundColor: WHITE,
        borderWidth: 1,
        borderColor: BORDER,
        alignItems: 'center',
    },

    goalButtonActive: {
        backgroundColor: PURPLE,
        borderColor: PURPLE,
    },

    goalButtonText: {
        color: DARK_PURPLE,
        fontSize: 13,
        fontWeight: '700',
    },

    goalButtonTextActive: {
        color: WHITE,
    },
});
