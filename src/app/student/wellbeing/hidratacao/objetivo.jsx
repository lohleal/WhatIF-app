
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../../../services/firebase/firebaseConfig';

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';

const BLUE = '#75BDF8';
const DARK_BLUE = '#174675';
const LIGHT_BLUE = '#F0F8FF';
const BORDER = '#D9EAFB';
const MUTED = '#71869D';
const WHITE = '#FFFFFF';

const objetivos = [1000, 1500, 2000, 2500, 3000];

export default function ObjetivoHidratacao() {
    const router = useRouter();

    const [objetivoTexto, setObjetivoTexto] = useState('2');
    const [notificacao, setNotificacao] = useState(true);

    const [horarioSelecionado, setHorarioSelecionado] = useState(
        new Date(2026, 0, 1, 9, 0)
    );

    const [mostrarSeletorHorario, setMostrarSeletorHorario] =
        useState(false);

    useEffect(() => {
        async function carregarObjetivo() {
            const usuario = auth.currentUser;

            if (!usuario) return;

            try {
                const objetivoRef = doc(
                    db,
                    'users',
                    usuario.uid,
                    'waterObjectives',
                    'objective'
                );

                const documento = await getDoc(objetivoRef);

                if (documento.exists()) {
                    const configuracoes = documento.data();

                    if (
                        Number.isFinite(configuracoes.dailyGoalMl) &&
                        configuracoes.dailyGoalMl > 0
                    ) {
                        setObjetivoTexto(
                            (configuracoes.dailyGoalMl / 1000).toLocaleString(
                                'pt-BR',
                                { maximumFractionDigits: 2 }
                            )
                        );
                    }

                    if (
                        typeof configuracoes.notificationsEnabled === 'boolean'
                    ) {
                        setNotificacao(configuracoes.notificationsEnabled);
                    }

                    if (configuracoes.reminderTime) {
                        const [horas, minutos] =
                            configuracoes.reminderTime.split(':').map(Number);

                        const horario = new Date();
                        horario.setHours(horas, minutos, 0, 0);

                        setHorarioSelecionado(horario);
                    }
                }
            } catch (erro) {
                console.error('Erro ao carregar objetivo:', erro);

                Alert.alert(
                    'Erro',
                    'Não foi possível carregar suas configurações de hidratação.'
                );
            }
        }

        carregarObjetivo();
    }, []);

    const objetivo = Number(objetivoTexto.replace(',', '.')) * 1000;

    function formatarLitros(valor) {
        return (valor / 1000).toLocaleString('pt-BR', {
            maximumFractionDigits: 2,
        });
    }

    function alterarObjetivo(valor) {
        const limpo = valor.replace(/[^0-9,]/g, '');
        const partes = limpo.split(',');

        const valorFinal =
            partes.length > 1
                ? partes[0] + ',' + partes.slice(1).join('')
                : limpo;

        setObjetivoTexto(valorFinal);
    }

    function atualizarHorario(event, dataEscolhida) {
        setMostrarSeletorHorario(false);

        if (event?.type === 'set' && dataEscolhida) {
            setHorarioSelecionado(dataEscolhida);
        }
    }

    async function salvarConfiguracoes() {
        if (
            !objetivoTexto ||
            !Number.isFinite(objetivo) ||
            objetivo <= 0
        ) {
            Alert.alert(
                'Objetivo inválido',
                'Digite um objetivo diário maior que zero.'
            );
            return;
        }

        const usuario = auth.currentUser;

        if (!usuario) {
            Alert.alert(
                'Atenção',
                'Você precisa estar conectado para salvar suas configurações.'
            );
            return;
        }

        try {
            const objetivoRef = doc(
                db,
                'users',
                usuario.uid,
                'waterObjectives',
                'objective'
            );

            const horarioFormatado = horarioSelecionado.toLocaleTimeString(
                'pt-BR',
                {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                }
            );

            await setDoc(
                objetivoRef,
                {
                    dailyGoalMl: Math.round(objetivo),
                    notificationsEnabled: notificacao,
                    reminderTime: horarioFormatado,
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            router.back();

        } catch (erro) {
            console.error('Erro ao salvar objetivo:', erro);

            Alert.alert(
                'Erro',
                'Não foi possível salvar suas configurações. Tente novamente.'
            );
        }
    }

    const horarioFormatado = horarioSelecionado.toLocaleTimeString(
        'pt-BR',
        {
            hour: '2-digit',
            minute: '2-digit',
        }
    );

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
                    >
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color={DARK_BLUE}
                        />
                    </Pressable>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>Meu objetivo</Text>
                        <Text style={styles.subtitle}>
                            Personalize sua hidratação
                        </Text>
                    </View>

                    <View style={styles.headerIcon}>
                        <MaterialCommunityIcons
                            name="water"
                            size={25}
                            color={BLUE}
                        />
                    </View>
                </View>

                {/* OBJETIVO DIÁRIO */}
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
                                Objetivo diário
                            </Text>
                            <Text style={styles.smallDescription}>
                                Quanto de água deseja consumir por dia?
                            </Text>
                        </View>
                    </View>

                    <View style={styles.selectedGoal}>

                        <View style={styles.goalInputRow}>
                            <TextInput
                                value={objetivoTexto}
                                onChangeText={alterarObjetivo}
                                keyboardType="decimal-pad"
                                style={styles.selectedGoalInput}
                                selectTextOnFocus
                                maxLength={5}
                                textAlign="center"
                            />
                            <Text style={styles.goalUnit}>L</Text>
                        </View>

                        <Text style={styles.selectedGoalLabel}>
                            Seu objetivo diário
                        </Text>
                    </View>

                    <View style={styles.goalOptions}>
                        {objetivos.map((valor) => {
                            const valorTexto = (
                                valor / 1000
                            ).toLocaleString('pt-BR');

                            const selecionado =
                                objetivoTexto === valorTexto;

                            return (
                                <Pressable
                                    key={valor}
                                    onPress={() =>
                                        setObjetivoTexto(valorTexto)
                                    }
                                    style={[
                                        styles.goalButton,
                                        selecionado &&
                                        styles.goalButtonActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.goalButtonText,
                                            selecionado &&
                                            styles.goalButtonTextActive,
                                        ]}
                                    >
                                        {formatarLitros(valor)} L
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* NOTIFICAÇÕES */}
                <View style={styles.card}>
                    <View style={styles.sectionHeading}>
                        <View style={styles.headingIcon}>
                            <Ionicons
                                name="notifications-outline"
                                size={21}
                                color={BLUE}
                            />
                        </View>

                        <View style={styles.headingText}>
                            <Text style={styles.sectionTitle}>
                                Lembretes
                            </Text>
                            <Text style={styles.smallDescription}>
                                Receba lembretes para beber água
                            </Text>
                        </View>
                    </View>

                    <View style={styles.notificationRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.notificationTitle}>
                                Ativar notificações
                            </Text>

                            <Text style={styles.notificationDescription}>
                                {notificacao
                                    ? 'Lembretes ativados'
                                    : 'Lembretes desativados'}
                            </Text>
                        </View>

                        <Switch
                            value={notificacao}
                            onValueChange={setNotificacao}
                            trackColor={{
                                false: '#DCE6EF',
                                true: '#A8D8FF',
                            }}
                            thumbColor={
                                notificacao ? BLUE : '#FFFFFF'
                            }
                        />
                    </View>
                </View>

                {/* HORÁRIO DO LEMBRETE */}
                <View
                    style={[
                        styles.card,
                        !notificacao && styles.disabledCard,
                    ]}
                >
                    <View style={styles.sectionHeading}>
                        <View style={styles.headingIcon}>
                            <Ionicons
                                name="time-outline"
                                size={21}
                                color={BLUE}
                            />
                        </View>

                        <View style={styles.headingText}>
                            <Text style={styles.sectionTitle}>
                                Horário do lembrete
                            </Text>
                            <Text style={styles.smallDescription}>
                                Escolha quando deseja ser lembrado
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        style={styles.timeButton}
                        disabled={!notificacao}
                        onPress={() =>
                            setMostrarSeletorHorario(true)
                        }
                    >
                        <Ionicons
                            name="alarm-outline"
                            size={24}
                            color={BLUE}
                        />

                        <Text style={styles.timeLabel}>
                            Horário escolhido
                        </Text>

                        <Text style={styles.timeValue}>
                            {horarioFormatado}
                        </Text>

                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color={MUTED}
                        />
                    </Pressable>

                    {mostrarSeletorHorario && (
                        <DateTimePicker
                            value={horarioSelecionado}
                            mode="time"
                            display="default"
                            onChange={atualizarHorario}
                        />
                    )}
                </View>

                {/* BOTÃO SALVAR */}
                <Pressable
                    style={styles.saveButton}
                    onPress={salvarConfiguracoes}
                >
                    <Ionicons
                        name="checkmark-circle-outline"
                        size={21}
                        color={WHITE}
                    />

                    <Text style={styles.saveButtonText}>
                        Salvar configurações
                    </Text>
                </Pressable>
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
        fontSize: 17,
        fontWeight: '800',
        color: DARK_BLUE,
    },

    smallDescription: {
        fontSize: 12,
        color: MUTED,
        marginTop: 3,
    },

    selectedGoal: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E2F2FF',
        borderRadius: 18,
        paddingVertical: 20,
        marginTop: 18,
        marginBottom: 16,
    },

    goalInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },

    selectedGoalInput: {
        fontSize: 32,
        fontWeight: '800',
        color: DARK_BLUE,
        minWidth: 45,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: WHITE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 10,
    },

    goalUnit: {
        fontSize: 25,
        fontWeight: '800',
        color: DARK_BLUE,
    },

    selectedGoalLabel: {
        fontSize: 12,
        color: MUTED,
        marginTop: 3,
    },

    goalOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    goalButton: {
        flexGrow: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
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

    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E2F2FF',
        borderRadius: 15,
        padding: 13,
        marginTop: 17,
        gap: 10,
    },

    notificationTitle: {
        color: DARK_BLUE,
        fontSize: 14,
        fontWeight: '800',
    },

    notificationDescription: {
        color: MUTED,
        fontSize: 12,
        marginTop: 3,
    },

    disabledCard: {
        opacity: 0.5,
    },

    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E2F2FF',
        borderRadius: 15,
        padding: 15,
        marginTop: 18,
        gap: 10,
    },

    timeLabel: {
        color: DARK_BLUE,
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },

    timeValue: {
        color: DARK_BLUE,
        fontSize: 15,
        fontWeight: '800',
    },

    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        backgroundColor: BLUE,
        paddingVertical: 16,
        borderRadius: 17,
        marginTop: 2,
    },

    saveButtonText: {
        color: WHITE,
        fontSize: 15,
        fontWeight: '800',
    },
});
