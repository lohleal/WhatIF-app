
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
import { auth } from '../../../../services/firebase/firebaseConfig';

import {
    buscarObjetivoSono,
    salvarObjetivoSono,
} from '../../../../features/wellbeing/services/sleepObjectiveService';

const PURPLE = '#B37BC9';
const DARK_PURPLE = '#704486';
const LIGHT_PURPLE = '#FAF5FC';
const BORDER = '#E9D9F2';
const MUTED = '#95869D';
const WHITE = '#FFFFFF';

const objetivos = [6, 7, 8, 9, 10];


export default function ObjetivoSono() {
    const router = useRouter();

    const [objetivoTexto, setObjetivoTexto] = useState('8');
    const [notificacao, setNotificacao] = useState(true);

    const [horarioSelecionado, setHorarioSelecionado] = useState(
        new Date(2026, 0, 1, 22, 0)
    );

    const [mostrarSeletorHorario, setMostrarSeletorHorario] =
        useState(false);

    const [carregando, setCarregando] = useState(true);

    // Carregar configurações salvas no Firestore
    useEffect(() => {
        async function carregarConfiguracoes() {
            try {
                const userId = auth.currentUser?.uid;

                if (!userId) {
                    Alert.alert(
                        'Atenção',
                        'Você precisa estar autenticado para acessar suas configurações.'
                    );
                    return;
                }

                const dados = await buscarObjetivoSono(userId);

                if (dados) {
                    setObjetivoTexto(
                        String(dados.dailyGoalHours ?? 8)
                    );

                    setNotificacao(
                        dados.notificationsEnabled ?? true
                    );

                    if (dados.reminderTime) {
                        const [horas, minutos] = dados.reminderTime
                            .split(':')
                            .map(Number);

                        const horario = new Date();
                        horario.setHours(horas, minutos, 0, 0);

                        setHorarioSelecionado(horario);
                    }
                }
            } catch (error) {
                console.error(
                    'Erro ao carregar configurações:',
                    error
                );

                Alert.alert(
                    'Erro',
                    'Não foi possível carregar suas configurações de sono.'
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarConfiguracoes();
    }, []);

    const objetivo = Number(
        objetivoTexto.replace(',', '.')
    );

    function alterarObjetivo(valor) {
        const limpo = valor
            .replace(/[^0-9,\\.]/g, '')
            .replace('.', ',');

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

    // Salvar configurações no Firestore

    async function salvarConfiguracoes() {
        console.log('1. Iniciando salvamento...');

        const objetivoAtual = Number(
            objetivoTexto.replace(',', '.')
        );

        console.log('2. Objetivo:', objetivoAtual);
        console.log('3. Notificações:', notificacao);

        if (
            !objetivoTexto ||
            !Number.isFinite(objetivoAtual) ||
            objetivoAtual <= 0 ||
            objetivoAtual > 24
        ) {
            console.log('ERRO: objetivo inválido');
            return;
        }

        try {
            const userId = auth.currentUser?.uid;

            console.log('4. UID do usuário:', userId);

            if (!userId) {
                console.log('ERRO: usuário não autenticado');
                return;
            }

            const reminderTime = horarioSelecionado.toLocaleTimeString(
                'pt-BR',
                {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                }
            );

            console.log('5. Horário:', reminderTime);
            console.log('6. Enviando dados ao Firestore...');

            await salvarObjetivoSono(userId, {
                dailyGoalHours: objetivoAtual,
                notificationsEnabled: notificacao,
                reminderTime,
            });

            console.log('7. OBJETIVO SALVO COM SUCESSO!');

            router.replace('/student/wellbeing/sono');

        } catch (error) {
            console.error('ERRO AO SALVAR OBJETIVO:', error);
            console.error('Código do erro:', error.code);
            console.error('Mensagem:', error.message);
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
                        onPress={() => router.replace('/student/wellbeing/sono')}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color={DARK_PURPLE}
                        />
                    </Pressable>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>Meu objetivo</Text>
                        <Text style={styles.subtitle}>
                            Personalize seu sono
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

                {/* OBJETIVO DIÁRIO */}
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
                                Objetivo de sono
                            </Text>

                            <Text style={styles.smallDescription}>
                                Quantas horas deseja dormir por noite?
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
                                maxLength={4}
                                textAlign="center"
                            />

                            <Text style={styles.goalUnit}>h</Text>
                        </View>

                        <Text style={styles.selectedGoalLabel}>
                            Seu objetivo diário
                        </Text>
                    </View>

                    <View style={styles.goalOptions}>
                        {objetivos.map((valor) => {
                            const selecionado =
                                objetivoTexto === String(valor);

                            return (
                                <Pressable
                                    key={valor}
                                    onPress={() =>
                                        setObjetivoTexto(String(valor))
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
                                        {valor} horas
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
                                color={PURPLE}
                            />
                        </View>

                        <View style={styles.headingText}>
                            <Text style={styles.sectionTitle}>
                                Lembretes
                            </Text>

                            <Text style={styles.smallDescription}>
                                Receba lembretes para sua rotina de sono
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
                                false: '#E5DDE9',
                                true: '#D7B4E5',
                            }}
                            thumbColor={
                                notificacao ? PURPLE : WHITE
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
                                color={PURPLE}
                            />
                        </View>

                        <View style={styles.headingText}>
                            <Text style={styles.sectionTitle}>
                                Horário de dormir
                            </Text>

                            <Text style={styles.smallDescription}>
                                Escolha quando deseja receber o lembrete
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
                            color={PURPLE}
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
    },

    headingIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#F0E2F5',
        alignItems: 'center',
        justifyContent: 'center',
    },

    headingText: {
        flex: 1,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: DARK_PURPLE,
    },

    smallDescription: {
        fontSize: 12,
        color: MUTED,
        marginTop: 3,
    },

    selectedGoal: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0E2F5',
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
        color: DARK_PURPLE,
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
        color: DARK_PURPLE,
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

    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0E2F5',
        borderRadius: 15,
        padding: 13,
        marginTop: 17,
        gap: 10,
    },

    notificationTitle: {
        color: DARK_PURPLE,
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
        backgroundColor: '#F0E2F5',
        borderRadius: 15,
        padding: 15,
        marginTop: 18,
        gap: 10,
    },

    timeLabel: {
        color: DARK_PURPLE,
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },

    timeValue: {
        color: DARK_PURPLE,
        fontSize: 15,
        fontWeight: '800',
    },

    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        backgroundColor: PURPLE,
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
