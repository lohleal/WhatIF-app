
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const PURPLE = '#B37BC9';
const DARK_PURPLE = '#704486';
const LIGHT_PURPLE = '#FAF5FC';
const BORDER = '#E9D9F2';
const MUTED = '#95869D';
const WHITE = '#FFFFFF';

const OBJETIVO_HORAS = 8;

function formatarDuracao(minutos) {
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;

    return `${horas}h ${String(resto).padStart(2, '0')}min`;
}

function formatarHorario(data) {
    return data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatarData(data) {
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
    });
}

export default function RegistroSono() {
    const router = useRouter();

    const agora = new Date();

    const ontem = new Date(agora);
    ontem.setDate(ontem.getDate() - 1);
    ontem.setHours(23, 0, 0, 0);

    const acordarInicial = new Date(agora);
    acordarInicial.setHours(6, 30, 0, 0);

    const [horarioDormir, setHorarioDormir] = useState(ontem);
    const [horarioAcordar, setHorarioAcordar] = useState(acordarInicial);

    const [seletorVisivel, setSeletorVisivel] = useState(null);

    const [registros, setRegistros] = useState([]);

    // Calcula automaticamente o dia em que a pessoa acordou.
    const fimSono = (() => {
        const data = new Date(horarioAcordar);

        if (data <= horarioDormir) {
            data.setDate(data.getDate() + 1);
        }

        return data;
    })();

    const duracaoMinutos = Math.max(
        0,
        Math.round((fimSono - horarioDormir) / 60000)
    );

    const duracaoValida =
        duracaoMinutos > 0 && duracaoMinutos <= 1440;

    const progresso = Math.min(
        (duracaoMinutos / (OBJETIVO_HORAS * 60)) * 100,
        100
    );

    function atualizarHorario(event, dataEscolhida) {
        setSeletorVisivel(null);

        if (event?.type !== 'set' || !dataEscolhida) {
            return;
        }

        if (seletorVisivel === 'dormir') {
            const novaData = new Date(horarioDormir);
            novaData.setHours(
                dataEscolhida.getHours(),
                dataEscolhida.getMinutes(),
                0,
                0
            );

            setHorarioDormir(novaData);
        }

        if (seletorVisivel === 'acordar') {
            const novaData = new Date(horarioAcordar);
            novaData.setHours(
                dataEscolhida.getHours(),
                dataEscolhida.getMinutes(),
                0,
                0
            );

            setHorarioAcordar(novaData);
        }
    }

    // Apenas demonstra o registro no front-end.
    function registrarSono() {
        if (!duracaoValida) {
            Alert.alert(
                'Horários inválidos',
                'Confira os horários informados. A duração precisa ser de até 24 horas.'
            );
            return;
        }

        const novoRegistro = {
            id: String(Date.now()),
            inicio: new Date(horarioDormir),
            fim: new Date(fimSono),
            duracao: duracaoMinutos,
        };

        setRegistros((atuais) => [
            novoRegistro,
            ...atuais,
        ]);


        const novaDataDormir = new Date(fimSono);
        novaDataDormir.setDate(novaDataDormir.getDate() - 1);
        novaDataDormir.setHours(23, 0, 0, 0);

        const novaDataAcordar = new Date(fimSono);
        novaDataAcordar.setHours(6, 30, 0, 0);

        setHorarioDormir(novaDataDormir);
        setHorarioAcordar(novaDataAcordar);
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screen}>
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
                                Registro diário
                            </Text>
                        </View>

                        <View style={styles.headerIcon}>
                            <MaterialCommunityIcons
                                name="sleep"
                                size={25}
                                color={PURPLE}
                            />
                        </View>
                    </View>

                    {/* RESUMO DO SONO */}
                    <View style={styles.purpleSection}>
                        <Text style={styles.cardEyebrow}>
                            DURAÇÃO DO SONO
                        </Text>

                        <Text style={styles.totalNumber}>
                            {Math.floor(duracaoMinutos / 60)}
                            <Text style={styles.totalUnit}>h </Text>
                            {String(duracaoMinutos % 60).padStart(2, '0')}
                            <Text style={styles.totalUnit}>min</Text>
                        </Text>

                        <View style={styles.sleepIllustration}>
                            <MaterialCommunityIcons
                                name="moon-waning-crescent"
                                size={54}
                                color={WHITE}
                            />
                        </View>

                        <View style={styles.progressTrack}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${progresso}%` },
                                ]}
                            />
                        </View>

                        <View style={styles.progressLabels}>
                            <Text style={styles.progressLabel}>
                                Tempo de descanso
                            </Text>

                            <Text style={styles.progressGoal}>
                                Objetivo: {OBJETIVO_HORAS}h
                            </Text>
                        </View>

                        <Svg
                            width="120%"
                            height="48"
                            viewBox="0 0 400 55"
                            preserveAspectRatio="none"
                            style={styles.wave}
                        >
                            <Path
                                d="M0 20 C35 5 55 5 85 20 C115 35 140 45 175 25 C210 5 230 5 260 25 C295 45 320 45 350 25 C375 10 390 10 400 20 L400 55 L0 55 Z"
                                fill="#FFFCFF"
                            />
                        </Svg>
                    </View>

                    {/* HORÁRIOS */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeading}>
                            <View style={styles.headingIcon}>
                                <MaterialCommunityIcons
                                    name="clock-time-four-outline"
                                    size={22}
                                    color={PURPLE}
                                />
                            </View>

                            <View style={styles.headingText}>
                                <Text style={styles.sectionTitle}>
                                    Horários de sono
                                </Text>

                                <Text style={styles.sectionSubtitle}>
                                    Informe quando dormiu e acordou
                                </Text>
                            </View>
                        </View>

                        {/* HORÁRIO DE DORMIR */}
                        <Pressable
                            style={styles.timeCard}
                            onPress={() => setSeletorVisivel('dormir')}
                        >
                            <View style={styles.timeIcon}>
                                <MaterialCommunityIcons
                                    name="weather-night"
                                    size={25}
                                    color={PURPLE}
                                />
                            </View>

                            <View style={styles.timeInfo}>
                                <Text style={styles.timeTitle}>
                                    Fui dormir
                                </Text>

                                <Text style={styles.timeDescription}>
                                    {formatarData(horarioDormir)}
                                </Text>
                            </View>

                            <Text style={styles.timeValue}>
                                {formatarHorario(horarioDormir)}
                            </Text>

                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={MUTED}
                            />
                        </Pressable>

                        {/* HORÁRIO DE ACORDAR */}
                        <Pressable
                            style={styles.timeCard}
                            onPress={() => setSeletorVisivel('acordar')}
                        >
                            <View style={styles.timeIcon}>
                                <MaterialCommunityIcons
                                    name="weather-sunny"
                                    size={25}
                                    color={PURPLE}
                                />
                            </View>

                            <View style={styles.timeInfo}>
                                <Text style={styles.timeTitle}>
                                    Acordei
                                </Text>

                                <Text style={styles.timeDescription}>
                                    {formatarData(fimSono)}
                                </Text>
                            </View>

                            <Text style={styles.timeValue}>
                                {formatarHorario(horarioAcordar)}
                            </Text>

                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={MUTED}
                            />
                        </Pressable>

                        {seletorVisivel && (
                            <DateTimePicker
                                value={
                                    seletorVisivel === 'dormir'
                                        ? horarioDormir
                                        : horarioAcordar
                                }
                                mode="time"
                                display="default"
                                onChange={atualizarHorario}
                            />
                        )}
                    </View>

                    <View style={styles.sectionDivider} />

                    {/* DURAÇÃO */}
                    <View style={styles.durationCard}>
                        <View style={styles.durationIcon}>
                            <MaterialCommunityIcons
                                name="bed-clock"
                                size={26}
                                color={PURPLE}
                            />
                        </View>

                        <View style={styles.durationInfo}>
                            <Text style={styles.durationTitle}>
                                Tempo total de descanso
                            </Text>

                            <Text style={styles.durationSubtitle}>
                                Calculado automaticamente
                            </Text>
                        </View>

                        <Text style={styles.durationValue}>
                            {formatarDuracao(duracaoMinutos)}
                        </Text>
                    </View>

                    {/* BOTÃO REGISTRAR */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.registerButton,
                            pressed && styles.registerButtonPressed,
                        ]}
                        onPress={registrarSono}
                    >
                        <MaterialCommunityIcons
                            name="moon-waning-crescent"
                            size={22}
                            color={WHITE}
                        />

                        <Text style={styles.registerButtonText}>
                            Registrar sono
                        </Text>

                        <Ionicons
                            name="arrow-forward"
                            size={19}
                            color={WHITE}
                        />
                    </Pressable>

                    {/* HISTÓRICO DEMONSTRATIVO */}
                    <View style={styles.historySection}>
                        <View style={styles.historyHeader}>
                            <Text style={styles.sectionTitle}>
                                Registros recentes
                            </Text>

                            <View style={styles.historyBadge}>
                                <Text style={styles.historyBadgeText}>
                                    {registros.length}
                                </Text>
                            </View>
                        </View>

                        {registros.length === 0 ? (
                            <View style={styles.emptyHistory}>
                                <MaterialCommunityIcons
                                    name="sleep"
                                    size={32}
                                    color={MUTED}
                                />

                                <Text style={styles.emptyText}>
                                    Seus registros de sono aparecerão aqui
                                </Text>
                            </View>
                        ) : (
                            registros.slice(0, 7).map((registro) => (
                                <View
                                    key={registro.id}
                                    style={styles.historyItem}
                                >
                                    <View style={styles.historyIcon}>
                                        <MaterialCommunityIcons
                                            name="moon-waning-crescent"
                                            size={24}
                                            color={PURPLE}
                                        />
                                    </View>

                                    <View style={styles.historyInfo}>
                                        <Text style={styles.historyName}>
                                            Noite de sono
                                        </Text>

                                        <Text style={styles.historyTime}>
                                            {formatarHorario(registro.inicio)}
                                            {' às '}
                                            {formatarHorario(registro.fim)}
                                        </Text>
                                    </View>

                                    <Text style={styles.historyAmount}>
                                        {formatarDuracao(registro.duracao)}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: WHITE,
    },

    screen: {
        flex: 1,
        backgroundColor: '#FFFCFF',
    },

    content: {
        paddingHorizontal: 22,
        paddingTop: 22,
        paddingBottom: 30,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 23,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 13,
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
        fontSize: 22,
        fontWeight: '800',
        color: DARK_PURPLE,
        letterSpacing: -0.5,
    },

    headerIcon: {
        width: 41,
        height: 41,
        borderRadius: 14,
        backgroundColor: LIGHT_PURPLE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    purpleSection: {
        backgroundColor: PURPLE,
        marginHorizontal: -22,
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 60,
        marginBottom: 5,
        position: 'relative',
        overflow: 'hidden',
    },

    cardEyebrow: {
        color: WHITE,
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 1.2,
    },

    totalNumber: {
        color: WHITE,
        fontSize: 30,
        fontWeight: '800',
        marginTop: 6,
        letterSpacing: -1,
    },

    totalUnit: {
        fontSize: 23,
        fontWeight: '600',
    },

    sleepIllustration: {
        position: 'absolute',
        right: 19,
        top: 25,
        width: 70,
        height: 70,
        borderRadius: 23,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-8deg' }],
    },

    progressTrack: {
        height: 7,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.35)',
        marginTop: 20,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        borderRadius: 10,
        backgroundColor: WHITE,
    },

    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },

    progressLabel: {
        color: WHITE,
        fontSize: 14,
    },

    progressGoal: {
        color: WHITE,
        fontSize: 14,
    },

    wave: {
        position: 'absolute',
        bottom: -1,
        left: 0,
    },

    section: {
        marginTop: 17,
        marginBottom: 8,
    },

    sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 15,
    },

    headingIcon: {
        width: 46,
        height: 46,
        borderRadius: 15,
        backgroundColor: '#F1E4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    headingText: {
        flex: 1,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: DARK_PURPLE,
        letterSpacing: -0.2,
    },

    sectionSubtitle: {
        fontSize: 14,
        color: MUTED,
        marginTop: 4,
        lineHeight: 19,
    },

    timeCard: {
        minHeight: 76,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: LIGHT_PURPLE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 17,
        marginBottom: 10,
        gap: 10,
    },

    timeIcon: {
        width: 43,
        height: 43,
        borderRadius: 14,
        backgroundColor: '#F1E4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    timeInfo: {
        flex: 1,
    },

    timeTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: DARK_PURPLE,
    },

    timeDescription: {
        fontSize: 12,
        color: MUTED,
        marginTop: 4,
    },

    timeValue: {
        fontSize: 18,
        fontWeight: '800',
        color: DARK_PURPLE,
    },

    sectionDivider: {
        height: 1,
        backgroundColor: BORDER,
        marginTop: 13,
        marginBottom: 15,
    },

    durationCard: {
        minHeight: 76,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: LIGHT_PURPLE,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 10,
    },

    durationIcon: {
        width: 43,
        height: 43,
        borderRadius: 14,
        backgroundColor: '#F1E4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    durationInfo: {
        flex: 1,
    },

    durationTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: DARK_PURPLE,
    },

    durationSubtitle: {
        fontSize: 12,
        color: MUTED,
        marginTop: 4,
    },

    durationValue: {
        fontSize: 15,
        fontWeight: '800',
        color: DARK_PURPLE,
    },

    registerButton: {
        backgroundColor: PURPLE,
        minHeight: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 25,
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 8,
        elevation: 3,
    },

    registerButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.99 }],
    },

    registerButtonText: {
        color: WHITE,
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },

    historySection: {
        marginBottom: 8,
    },

    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        marginBottom: 13,
    },

    historyBadge: {
        backgroundColor: LIGHT_PURPLE,
        minWidth: 24,
        height: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },

    historyBadgeText: {
        color: DARK_PURPLE,
        fontSize: 15,
        fontWeight: '800',
    },

    historyItem: {
        backgroundColor: LIGHT_PURPLE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 15,
        padding: 11,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: '#F1E4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    historyInfo: {
        flex: 1,
    },

    historyName: {
        color: DARK_PURPLE,
        fontSize: 15,
        fontWeight: '700',
    },

    historyTime: {
        color: MUTED,
        fontSize: 12,
        marginTop: 4,
    },

    historyAmount: {
        color: DARK_PURPLE,
        fontSize: 14,
        fontWeight: '800',
    },

    emptyHistory: {
        alignItems: 'center',
        paddingVertical: 22,
        backgroundColor: LIGHT_PURPLE,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: BORDER,
    },

    emptyText: {
        color: MUTED,
        fontSize: 12,
        marginTop: 7,
    },
});
