
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { auth, db } from '../../../../services/firebase/firebaseConfig';

import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
} from 'firebase/firestore';

import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const BLUE = '#75BDF8';
const DARK_BLUE = '#174675';
const LIGHT_BLUE = '#F0F8FF';
const BORDER = '#D9EAFB';
const MUTED = '#71869D';
const WHITE = '#FFFFFF';



export default function ProgressoAgua() {
    const router = useRouter();

    const [periodo, setPeriodo] = useState('Hoje');
    const [meta, setMeta] = useState(2000);
    const [registros, setRegistros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [periodoSelecionado, setPeriodoSelecionado] = useState(null);

    useEffect(() => {
        const usuario = auth.currentUser;

        if (!usuario) {
            setCarregando(false);
            return;
        }

        // Buscar objetivo diário
        const objetivoRef = doc(
            db,
            'users',
            usuario.uid,
            'waterObjectives',
            'objective'
        );

        const unsubscribeObjetivo = onSnapshot(
            objetivoRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const dados = snapshot.data();

                    if (
                        Number.isFinite(dados.dailyGoalMl) &&
                        dados.dailyGoalMl > 0
                    ) {
                        setMeta(dados.dailyGoalMl);
                    }
                }
            },
            (erro) => console.error('Erro ao carregar objetivo:', erro)
        );

        // Buscar registros de água
        const registrosRef = collection(
            db,
            'users',
            usuario.uid,
            'waterRecords'
        );

        const consulta = query(
            registrosRef,
            orderBy('consumedAt', 'desc')
        );

        const unsubscribeRegistros = onSnapshot(
            consulta,
            (snapshot) => {
                const dados = snapshot.docs.map((documento) => {
                    const registro = documento.data();

                    return {
                        id: documento.id,
                        ml: registro.amountMl || 0,
                        data: registro.consumedAt?.toDate() || null,
                    };
                });

                setRegistros(dados);
                setCarregando(false);
            },
            (erro) => {
                console.error('Erro ao carregar registros:', erro);
                setCarregando(false);
            }
        );

        return () => {
            unsubscribeObjetivo();
            unsubscribeRegistros();
        };
    }, []);

    const agora = new Date();

    function inicioDoDia(data) {
        return new Date(
            data.getFullYear(),
            data.getMonth(),
            data.getDate()
        );
    }

    const hoje = inicioDoDia(agora);

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - 6);

    const inicioMes = new Date(hoje);
    inicioMes.setDate(hoje.getDate() - 29);

    // Filtrar registros conforme o período selecionado
    const registrosPeriodo = registros.filter((registro) => {
        if (!registro.data) return false;

        const dataRegistro = inicioDoDia(registro.data);

        if (periodo === 'Hoje') {
            return dataRegistro.getTime() === hoje.getTime();
        }

        if (periodo === 'Semana') {
            return (
                dataRegistro >= inicioSemana &&
                dataRegistro <= hoje
            );
        }

        return (
            dataRegistro >= inicioMes &&
            dataRegistro <= hoje
        );
    });

    // Dados de hoje: consumo por faixa de horário
    const dadosHoje = Array.from({ length: 6 }, (_, index) => {
        const horaInicial = index * 4;

        const ml = registrosPeriodo
            .filter((registro) => {
                const hora = registro.data.getHours();

                return hora >= horaInicial && hora < horaInicial + 4;
            })
            .reduce((soma, registro) => soma + registro.ml, 0);

        return {
            horario: `${String(horaInicial).padStart(2, '0')}h`,
            ml,
        };
    });

    // Dados da semana: consumo por dia
    const dadosSemana = Array.from({ length: 7 }, (_, index) => {
        const data = new Date(inicioSemana);
        data.setDate(inicioSemana.getDate() + index);

        const ml = registrosPeriodo
            .filter((registro) => {
                return (
                    inicioDoDia(registro.data).getTime() ===
                    data.getTime()
                );
            })
            .reduce((soma, registro) => soma + registro.ml, 0);

        const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        return {
            horario: nomesDias[data.getDay()],
            ml,
        };
    });

    // Dados do mês: consumo agrupado por semana
    const dadosMes = Array.from({ length: 5 }, (_, index) => {
        const ml = registrosPeriodo
            .filter((registro) => {
                const diferencaDias = Math.floor(
                    (inicioDoDia(registro.data) - inicioMes) /
                    (1000 * 60 * 60 * 24)
                );

                return Math.floor(diferencaDias / 7) === index;
            })
            .reduce((soma, registro) => soma + registro.ml, 0);

        return {
            horario: `Sem. ${index + 1}`,
            ml,
        };
    });

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

    const metaPeriodo = meta * diasDoPeriodo;

    const porcentagem = metaPeriodo > 0
        ? Math.min(
            Math.round((totalPeriodo / metaPeriodo) * 100),
            100
        )
        : 0;

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
                {carregando && (
                    <Text style={{ color: MUTED, textAlign: 'center', marginBottom: 12 }}>
                        Atualizando seu histórico...
                    </Text>
                )}
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
                            Acompanhe sua hidratação
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
                            onPress={() => {
                                setPeriodo(item);
                                setPeriodoSelecionado(null);
                            }}
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
                                    Objetivo diário
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
                                    {porcentagem}% do objetivo do período
                                </Text>

                                <Text style={styles.periodGoal}>
                                    Objetivo: {formatarLitros(metaPeriodo)} L
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

                            const selecionado =
                                periodoSelecionado === item.horario;

                            const altura =
                                (item.ml / maximoGrafico) * 100;

                            return (
                                <Pressable
                                    key={item.horario}
                                    style={styles.barColumn}
                                    onPress={() => {
                                        setPeriodoSelecionado(
                                            selecionado ? null : item.horario
                                        );
                                    }}
                                >
                                    <Text style={styles.barValue}>
                                        {selecionado
                                            ? `${item.ml.toLocaleString('pt-BR')} ml`
                                            : destaque
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
                                                selecionado && {
                                                    backgroundColor: DARK_BLUE,
                                                },
                                            ]}
                                        />
                                    </View>

                                    <Text
                                        style={styles.barLabel}
                                        numberOfLines={1}
                                    >
                                        {item.horario}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {periodoSelecionado && (
                        <View style={{
                            backgroundColor: '#E2F2FF',
                            padding: 12,
                            borderRadius: 12,
                            marginTop: 12,
                            alignItems: 'center',
                        }}>
                            <Text style={{
                                color: MUTED,
                                fontSize: 12,
                            }}>
                                Consumo em {periodoSelecionado}
                            </Text>

                            <Text style={{
                                color: DARK_BLUE,
                                fontSize: 20,
                                fontWeight: '800',
                                marginTop: 3,
                            }}>
                                {dadosPeriodo
                                    .find(item => item.horario === periodoSelecionado)
                                    ?.ml.toLocaleString('pt-BR')} ml
                            </Text>
                        </View>
                    )}

                    <Text style={styles.chartCaption}>
                        {periodo === 'Hoje'
                            ? 'Valores em mililitros por horário'
                            : 'Valores em mililitros por período'}
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
                                color={BLUE}
                            />
                        </View>

                        <Text style={styles.comparisonLabel}>
                            Objetivo do período
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
