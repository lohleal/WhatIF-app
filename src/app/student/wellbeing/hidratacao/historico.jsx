
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const BLUE = '#75BDF8';
const DARK_BLUE = '#174675';
const LIGHT_BLUE = '#F0F8FF';
const BORDER = '#D9EAFB';
const MUTED = '#71869D';
const WHITE = '#FFFFFF';

const dadosHoje = [
    { horario: '6h', ml: 100 },
    { horario: '9h', ml: 250 },
    { horario: '12h', ml: 400 },
    { horario: '15h', ml: 280 },
    { horario: '18h', ml: 220 },
    { horario: '21h', ml: 100 },
];

const dadosSemana = [
    { horario: 'Seg', ml: 1500 },
    { horario: 'Ter', ml: 2000 },
    { horario: 'Qua', ml: 1800 },
    { horario: 'Qui', ml: 2200 },
    { horario: 'Sex', ml: 1700 },
    { horario: 'Sáb', ml: 2500 },
    { horario: 'Dom', ml: 1900 },
];

const dadosMes = [
    { horario: 'Sem. 1', ml: 12500 },
    { horario: 'Sem. 2', ml: 14200 },
    { horario: 'Sem. 3', ml: 13800 },
    { horario: 'Sem. 4', ml: 15100 },
];

export default function ProgressoAgua() {
    const router = useRouter();

    const [periodo, setPeriodo] = useState('Hoje');
    const [meta, setMeta] = useState(2000);

    const dadosPeriodo =
        periodo === 'Hoje'
            ? dadosHoje
            : periodo === 'Semana'
                ? dadosSemana
                : dadosMes;

    const totalPeriodo = dadosPeriodo.reduce(
        (soma, item) => soma + item.ml,
        0
    );

    const diasDoPeriodo =
        periodo === 'Hoje' ? 1 : periodo === 'Semana' ? 7 : 30;

    const mediaDiaria = Math.round(totalPeriodo / diasDoPeriodo);

    const metaPeriodo =
        periodo === 'Hoje'
            ? meta
            : periodo === 'Semana'
                ? meta * 7
                : meta * 30;

    const porcentagem = Math.min(
        Math.round((totalPeriodo / metaPeriodo) * 100),
        100
    );

    const melhorPeriodo = dadosPeriodo.reduce(
        (maior, item) => item.ml > maior.ml ? item : maior,
        dadosPeriodo[0]
    );

    const maximoGrafico = Math.max(
        ...dadosPeriodo.map((item) => item.ml),
        1
    );

    const tituloGrafico =
        periodo === 'Hoje'
            ? 'Consumo por horário'
            : periodo === 'Semana'
                ? 'Consumo por dia'
                : 'Consumo por semana';

    const tituloMaior =
        periodo === 'Hoje'
            ? 'Horário de maior consumo'
            : periodo === 'Semana'
                ? 'Dia de maior consumo'
                : 'Semana de maior consumo';

    const tituloTotal =
        periodo === 'Hoje'
            ? 'Consumo do dia'
            : periodo === 'Semana'
                ? 'Consumo semanal'
                : 'Consumo mensal';

    function formatarLitros(ml) {
        return (ml / 1000).toLocaleString('pt-BR', {
            maximumFractionDigits: 2,
        });
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
                            color={DARK_BLUE}
                        />
                    </Pressable>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>
                            Meu progresso
                        </Text>
                        <Text style={styles.subtitle}>
                            Acompanhe sua hidratação.
                        </Text>
                    </View>

                    <View style={styles.headerIcon}>
                        <MaterialCommunityIcons
                            name="chart-box-outline"
                            size={25}
                            color={BLUE}
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
                                    periodo === item &&
                                        styles.activeTabText,
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
                                name="water"
                                size={21}
                                color={BLUE}
                            />
                        </View>

                        <View style={styles.headingText}>
                            <Text style={styles.sectionTitle}>
                                {periodo === 'Hoje'
                                    ? 'Consumo de água'
                                    : periodo === 'Semana'
                                        ? 'Sua semana'
                                        : 'Seu mês'}
                            </Text>

                            <Text style={styles.smallDescription}>
                                {periodo === 'Hoje'
                                    ? 'Resumo de hoje'
                                    : periodo === 'Semana'
                                        ? 'Resumo dos últimos 7 dias'
                                        : 'Resumo dos últimos 30 dias'}
                            </Text>
                        </View>
                    </View>

                    {periodo === 'Hoje' ? (
                        <View style={styles.summaryRow}>
                            <View style={styles.circle}>
                                <MaterialCommunityIcons
                                    name="water"
                                    size={25}
                                    color={BLUE}
                                />

                                <Text style={styles.total}>
                                    {formatarLitros(totalPeriodo)} L
                                </Text>

                                <Text style={styles.ofGoal}>
                                    de {formatarLitros(meta)} L
                                </Text>
                            </View>

                            <View style={styles.goalInfo}>
                                <View style={styles.goalIcon}>
                                    <Ionicons
                                        name="flag-outline"
                                        size={21}
                                        color={BLUE}
                                    />
                                </View>

                                <Text style={styles.goalLabel}>
                                    Meta diária
                                </Text>

                                <Text style={styles.goalValue}>
                                    {formatarLitros(meta)} L
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
                                <View style={styles.periodWaterIcon}>
                                    <MaterialCommunityIcons
                                        name="water"
                                        size={30}
                                        color={BLUE}
                                    />
                                </View>

                                <View style={styles.periodTotalText}>
                                    <Text style={styles.periodTotalLabel}>
                                        {tituloTotal}
                                    </Text>

                                    <Text style={styles.periodTotalValue}>
                                        {formatarLitros(totalPeriodo)} L
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
                                    {porcentagem}% da meta do período
                                </Text>

                                <Text style={styles.periodGoal}>
                                    Meta: {formatarLitros(metaPeriodo)} L
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
                                color={BLUE}
                            />
                        </View>

                        <Text style={styles.statLabel}>
                            Média diária
                        </Text>

                        <Text style={styles.statValue}>
                            {formatarLitros(mediaDiaria)} L
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Ionicons
                                name="trophy-outline"
                                size={22}
                                color={BLUE}
                            />
                        </View>

                        <Text style={styles.statLabel}>
                            {periodo === 'Hoje'
                                ? 'Maior consumo'
                                : periodo === 'Semana'
                                    ? 'Melhor dia'
                                    : 'Melhor semana'}
                        </Text>

                        <Text style={styles.statValue}>
                            {formatarLitros(melhorPeriodo.ml)} L
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
                                color={BLUE}
                            />
                        </View>

                        <View style={styles.headingText}>
                            <Text style={styles.sectionTitle}>
                                {tituloGrafico}
                            </Text>

                            <Text style={styles.smallDescription}>
                                {periodo === 'Hoje'
                                    ? 'Distribuição durante o dia'
                                    : periodo === 'Semana'
                                        ? 'Compare os dias da semana'
                                        : 'Compare as semanas do mês'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.peakInfo}>
                        <View style={styles.peakIconBox}>
                            <MaterialCommunityIcons
                                name="water"
                                size={25}
                                color={BLUE}
                            />
                        </View>

                        <View style={styles.peakText}>
                            <Text style={styles.peakLabel}>
                                {tituloMaior}
                            </Text>

                            <Text style={styles.peakValue}>
                                {melhorPeriodo.horario} ·{' '}
                                {melhorPeriodo.ml.toLocaleString('pt-BR')} ml
                            </Text>
                        </View>
                    </View>

                    <View style={styles.chart}>
                        {dadosPeriodo.map((item) => {
                            const destaque =
                                item.horario === melhorPeriodo.horario;

                            const altura =
                                (item.ml / maximoGrafico) * 100;

                            return (
                                <View
                                    key={item.horario}
                                    style={styles.barColumn}
                                >
                                    <Text style={styles.barValue}>
                                        {destaque
                                            ? item.ml >= 1000
                                                ? `${formatarLitros(item.ml)} L`
                                                : `${item.ml}`
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
                        {periodo === 'Hoje'
                            ? 'Valores em mililitros por horário'
                            : 'Valores em mililitros por período'}
                    </Text>
                </View>

                {/* COMPARAÇÃO */}
                <View style={styles.sectionHeadingOutside}>
                    <Text style={styles.sectionTitle}>
                        Comparação com sua meta
                    </Text>
                </View>

                <View style={styles.comparisonRow}>
                    <View style={styles.comparisonCard}>
                        <View style={styles.comparisonIconBox}>
                            <MaterialCommunityIcons
                                name="water"
                                size={23}
                                color={BLUE}
                            />
                        </View>

                        <Text style={styles.comparisonLabel}>
                            Consumo
                        </Text>

                        <Text style={styles.comparisonValue}>
                            {formatarLitros(totalPeriodo)} L
                        </Text>

                        <Text style={styles.comparisonPercent}>
                            {porcentagem}% da meta
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
                                color={BLUE}
                            />
                        </View>

                        <Text style={styles.comparisonLabel}>
                            Meta do período
                        </Text>

                        <Text style={styles.comparisonValue}>
                            {formatarLitros(metaPeriodo)} L
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

                {/* AJUSTAR META */}
                <View style={styles.goalButtons}>
                    <View style={styles.goalTitleRow}>
                        <View style={styles.headingIcon}>
                            <Ionicons
                                name="options-outline"
                                size={21}
                                color={BLUE}
                            />
                        </View>

                        <Text style={styles.goalButtonsTitle}>
                            Ajustar meta diária
                        </Text>
                    </View>

                    <Text style={styles.goalDescription}>
                        Escolha sua meta diária de consumo de água.
                    </Text>

                    <View style={styles.goalOptions}>
                        {[1000, 1500, 2000, 2500, 3000].map((valor) => (
                            <Pressable
                                key={valor}
                                onPress={() => setMeta(valor)}
                                style={[
                                    styles.goalButton,
                                    meta === valor &&
                                        styles.goalButtonActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.goalButtonText,
                                        meta === valor &&
                                            styles.goalButtonTextActive,
                                    ]}
                                >
                                    {formatarLitros(valor)} L
                                </Text>
                            </Pressable>
                        ))}
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
        backgroundColor: LIGHT_BLUE,
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
        color: DARK_BLUE,
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
        backgroundColor: LIGHT_BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    tabs: {
        flexDirection: 'row',
        backgroundColor: LIGHT_BLUE,
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
        backgroundColor: BLUE,
    },

    tabText: {
        color: DARK_BLUE,
        fontWeight: '600',
        fontSize: 14,
    },

    activeTabText: {
        color: WHITE,
        fontWeight: '800',
    },

    card: {
        backgroundColor: LIGHT_BLUE,
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
        backgroundColor: '#DFF0FF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    headingText: {
        flex: 1,
    },

    sectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: DARK_BLUE,
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
        borderColor: BLUE,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    total: {
        fontSize: 25,
        fontWeight: '800',
        color: DARK_BLUE,
        marginTop: 3,
    },

    ofGoal: {
        fontSize: 12,
        color: MUTED,
        marginTop: 2,
    },

    goalInfo: {
        flex: 1,
        backgroundColor: '#E2F2FF',
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
        color: DARK_BLUE,
        fontSize: 23,
        fontWeight: '800',
        marginTop: 3,
    },

    track: {
        height: 9,
        borderRadius: 10,
        backgroundColor: '#D5E8F9',
        overflow: 'hidden',
        marginTop: 10,
    },

    trackFill: {
        height: '100%',
        backgroundColor: BLUE,
        borderRadius: 10,
    },

    percent: {
        color: DARK_BLUE,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 7,
    },

    periodTotalBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        backgroundColor: '#E2F2FF',
        borderRadius: 17,
        padding: 15,
    },

    periodWaterIcon: {
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
        color: DARK_BLUE,
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
        backgroundColor: LIGHT_BLUE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 18,
        padding: 13,
    },

    statIcon: {
        width: 39,
        height: 39,
        borderRadius: 13,
        backgroundColor: '#DFF0FF',
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
        color: DARK_BLUE,
        marginTop: 4,
    },

    statDetail: {
        fontSize: 12,
        color: BLUE,
        fontWeight: '700',
        marginTop: 3,
    },

    peakInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        backgroundColor: '#E2F2FF',
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
        color: DARK_BLUE,
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
        color: DARK_BLUE,
        fontWeight: '700',
        textAlign: 'center',
    },

    barTrack: {
        width: '55%',
        minWidth: 8,
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: '#E4F1FC',
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        overflow: 'hidden',
    },

    bar: {
        width: '100%',
        backgroundColor: '#A8D8FF',
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        minHeight: 4,
    },

    barActive: {
        backgroundColor: BLUE,
    },

    barLabel: {
        color: DARK_BLUE,
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
        backgroundColor: LIGHT_BLUE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 18,
    },

    comparisonIconBox: {
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: '#DFF0FF',
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
        color: DARK_BLUE,
        fontWeight: '800',
        marginTop: 4,
    },

    comparisonPercent: {
        fontSize: 12,
        color: DARK_BLUE,
        marginTop: 4,
        fontWeight: '600',
    },

    goalButtons: {
        padding: 16,
        borderRadius: 19,
        backgroundColor: LIGHT_BLUE,
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
        color: DARK_BLUE,
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
        backgroundColor: BLUE,
        borderColor: BLUE,
    },

    goalButtonText: {
        color: DARK_BLUE,
        fontSize: 13,
        fontWeight: '700',
    },

    goalButtonTextActive: {
        color: WHITE,
    },
});
