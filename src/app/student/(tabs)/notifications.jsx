
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from '../../../constants/colors.js';
import { auth } from '../../../services/firebase/firebaseConfig';

function chaveNotificacoesOcultadas() {
    const uid = auth.currentUser?.uid;
    return `@whatif/notificacoes_ocultadas/${uid || 'sem_usuario'}`;
}

function formatarHorario(trigger) {
    if (!trigger) return 'Horário não disponível';

    const hora = trigger.hour;
    const minuto = trigger.minute;

    if (hora !== undefined && minuto !== undefined) {
        return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
    }

    return 'Horário programado';
}

function formatarFrequencia(trigger) {
    if (!trigger) return 'Lembrete programado';

    if (trigger.weekday) {
        const dias = [
            '',
            'Domingo',
            'Segunda-feira',
            'Terça-feira',
            'Quarta-feira',
            'Quinta-feira',
            'Sexta-feira',
            'Sábado',
        ];

        return dias[trigger.weekday] || 'Dias específicos';
    }

    if (trigger.hour !== undefined) {
        return 'Todos os dias';
    }

    return 'Lembrete programado';
}

export default function NotificationsScreen() {
    const router = useRouter();

    const [notificacoes, setNotificacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);

    const carregarNotificacoes = useCallback(async () => {
        try {
            setCarregando(true);
            setErro(false);

            const [agendadas, dadosOcultados] = await Promise.all([
                Notifications.getAllScheduledNotificationsAsync(),
                AsyncStorage.getItem(chaveNotificacoesOcultadas()),
            ]);

            const ocultadas = dadosOcultados
                ? JSON.parse(dadosOcultados)
                : [];

            const lembretes = agendadas
                .filter(
                    (item) =>
                        item.content?.data?.tipo === 'lembrete_indicador' &&
                        !ocultadas.includes(item.identifier)
                )
                .map((item) => ({
                    id: item.identifier,
                    titulo: item.content?.title || 'Lembrete',
                    mensagem:
                        item.content?.body || 'Você tem um lembrete.',
                    horario: formatarHorario(item.trigger),
                    frequencia: formatarFrequencia(item.trigger),
                }));

            setNotificacoes(lembretes);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
            setErro(true);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarNotificacoes();
    }, [carregarNotificacoes]);

    async function concluirNotificacao(id) {
        try {
            const chave = chaveNotificacoesOcultadas();
            const dadosSalvos = await AsyncStorage.getItem(chave);

            const ocultadas = dadosSalvos
                ? JSON.parse(dadosSalvos)
                : [];

            if (!ocultadas.includes(id)) {
                ocultadas.push(id);
                await AsyncStorage.setItem(
                    chave,
                    JSON.stringify(ocultadas)
                );
            }

            setNotificacoes((anteriores) =>
                anteriores.filter((item) => item.id !== id)
            );
        } catch (error) {
            console.error('Erro ao ocultar notificação:', error);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable
                        onPress={() =>
                            router.replace('/student/indicadores')
                        }
                        style={styles.backButton}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={25}
                            color={COLORS.primary}
                        />
                    </Pressable>

                    <Text style={styles.headerTitle}>
                        Notificações
                    </Text>

                    <Pressable
                        onPress={carregarNotificacoes}
                        style={styles.refreshButton}
                    >
                        <MaterialCommunityIcons
                            name="refresh"
                            size={23}
                            color={COLORS.primary}
                        />
                    </Pressable>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >


                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Seus lembretes
                        </Text>

                        <View style={styles.counter}>
                            <Text style={styles.counterText}>
                                {notificacoes.length}
                            </Text>
                        </View>
                    </View>

                    {carregando ? (
                        <View style={styles.stateContainer}>
                            <ActivityIndicator
                                size="large"
                                color={COLORS.primary}
                            />

                            <Text style={styles.stateText}>
                                Carregando lembretes...
                            </Text>
                        </View>
                    ) : erro ? (
                        <View style={styles.stateContainer}>
                            <MaterialCommunityIcons
                                name="alert-circle-outline"
                                size={42}
                                color="#C47B63"
                            />

                            <Text style={styles.emptyTitle}>
                                Não foi possível carregar
                            </Text>

                            <Text style={styles.stateText}>
                                Tente atualizar a página.
                            </Text>

                            <Pressable
                                style={styles.retryButton}
                                onPress={carregarNotificacoes}
                            >
                                <Text style={styles.retryText}>
                                    Tentar novamente
                                </Text>
                            </Pressable>
                        </View>
                    ) : notificacoes.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons
                                name="bell-sleep-outline"
                                size={52}
                                color="#A6B59B"
                            />

                            <Text style={styles.emptyTitle}>
                                Nenhum lembrete por aqui!
                            </Text>

                            <Text style={styles.emptyText}>
                                Seus lembretes aparecerão aqui
                                quando estiverem disponíveis.
                            </Text>
                        </View>
                    ) : (
                        notificacoes.map((item) => (
                            <View
                                key={item.id}
                                style={styles.notificationCard}
                            >
                                <View style={styles.notificationIcon}>
                                    <MaterialCommunityIcons
                                        name="clock-outline"
                                        size={24}
                                        color={COLORS.primary}
                                    />
                                </View>

                                <View style={styles.notificationInfo}>
                                    <Text style={styles.notificationTitle}>
                                        {item.titulo}
                                    </Text>

                                    <Text style={styles.notificationMessage}>
                                        {item.mensagem}
                                    </Text>

                                    <View style={styles.detailsRow}>
                                        <MaterialCommunityIcons
                                            name="clock-time-four-outline"
                                            size={15}
                                            color="#71806B"
                                        />

                                        <Text style={styles.detailText}>
                                            {item.horario}
                                        </Text>

                                        <Text style={styles.detailSeparator}>
                                            •
                                        </Text>

                                        <Text style={styles.detailText}>
                                            {item.frequencia}
                                        </Text>
                                    </View>
                                </View>

                                <Pressable
                                    style={styles.checkButton}
                                    onPress={() =>
                                        concluirNotificacao(item.id)
                                    }
                                    hitSlop={10}
                                >
                                    <MaterialCommunityIcons
                                        name="check-circle-outline"
                                        size={27}
                                        color={COLORS.primary}
                                    />
                                </Pressable>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F9F4',
    },

    container: {
        flex: 1,
    },

    header: {
        minHeight: 62,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8EDE4',
    },

    backButton: {
        width: 42,
        height: 42,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 19,
        fontWeight: '700',
        color: COLORS.text,
    },

    refreshButton: {
        width: 42,
        height: 42,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },

    content: {
        paddingHorizontal: 20,
        paddingTop: 25,
        paddingBottom: 40,
    },

    intro: {
        alignItems: 'center',
        marginBottom: 32,
    },

    introIcon: {
        width: 65,
        height: 65,
        borderRadius: 22,
        backgroundColor: '#E8F0E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },

    title: {
        fontSize: 23,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 9,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
    },

    counter: {
        minWidth: 25,
        height: 25,
        borderRadius: 13,
        backgroundColor: '#E5EDDF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 7,
    },

    counterText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },

    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 17,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8EDE4',
    },

    notificationIcon: {
        width: 43,
        height: 43,
        borderRadius: 14,
        backgroundColor: '#EAF1E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    notificationInfo: {
        flex: 1,
    },

    notificationTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 5,
    },

    notificationMessage: {
        fontSize: 13,
        color: '#687365',
        lineHeight: 19,
        marginBottom: 10,
    },

    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 5,
    },

    detailText: {
        fontSize: 12,
        color: '#71806B',
    },

    detailSeparator: {
        color: '#A6B59B',
        marginHorizontal: 2,
    },

    checkButton: {
        padding: 5,
        marginLeft: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },

    stateContainer: {
        alignItems: 'center',
        paddingVertical: 45,
        gap: 12,
    },

    stateText: {
        fontSize: 14,
        color: '#7A8575',
        textAlign: 'center',
    },

    emptyContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8EDE4',
        marginTop: 5,
    },

    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 15,
        marginBottom: 7,
        textAlign: 'center',
    },

    emptyText: {
        fontSize: 13,
        color: '#7A8575',
        textAlign: 'center',
        lineHeight: 20,
    },

    retryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        paddingHorizontal: 22,
        paddingVertical: 10,
        marginTop: 8,
    },

    retryText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
});
