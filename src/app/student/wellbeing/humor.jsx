
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    Alert,
    Pressable,
    ScrollView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../features/auth/context/AuthContext';
import {
    buscarRegistrosHumor,
    salvarRegistroHumor,
    excluirRegistroHumor,
    importarRegistroHumor,
} from '../../../features/wellbeing/services/moodService';

const COLORS = {
    primary: '#F09F53',
    text: '#26352A',
    secondary: '#8A8175',
    background: '#FFFAE9',
    white: '#FFFFFF',
    border: '#EED99E',
};

const STORAGE_KEY = '@whatif/humor-registros';
const DOIS_DIAS_MS = 2 * 24 * 60 * 60 * 1000;

const MOODS = [
    { label: 'Bem', icon: 'emoticon-happy-outline', color: '#FFEDB8' },
    { label: 'Muito bem', icon: 'emoticon-excited-outline', color: '#FFE6A6' },
    { label: 'Muito mal', icon: 'emoticon-sad-outline', color: '#FFF0C2' },
    { label: 'Mal', icon: 'emoticon-confused-outline', color: '#FFF4D6' },
    
    { label: 'Calmo(a)', icon: 'meditation', color: '#FFF5D9' },
    { label: 'Feliz', icon: 'heart', color: '#FFEAB3' },
    { label: 'Energético(a)', icon: 'lightning-bolt', color: '#FFEFC0' },
    { label: 'Alegre', icon: 'emoticon-happy', color: '#FFEDB8' },
    { label: 'Mudança de humor', icon: 'drama-masks', color: '#FFF4D6' },
    { label: 'Apático(a)', icon: 'emoticon-neutral-outline', color: '#FFEFC0' },
    { label: 'Irritado(a)', icon: 'emoticon-angry-outline', color: '#F8DFA0' },
    { label: 'Triste', icon: 'emoticon-cry-outline', color: '#FFF0C2' },
    { label: 'Ansioso(a)', icon: 'weather-windy', color: '#FFF5D9' },
    { label: 'Desanimado(a)', icon: 'cloud-outline', color: '#FFF0C2' },
    { label: 'Culpado(a)', icon: 'alert-circle-outline', color: '#FFF4D6' },
    { label: 'Pouca energia', icon: 'battery-low', color: '#FFEFC0' },
    { label: 'Confuso(a)', icon: 'head-question-outline', color: '#FFEDB8' },
    { label: 'Muito autocrítico(a)', icon: 'account-alert-outline', color: '#FFF0C2' },
];


export default function Humor() {
    const router = useRouter();
    const { usuario, carregando } = useAuth();
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [note, setNote] = useState('');
    const [history, setHistory] = useState([]);
    const [dataFiltro, setDataFiltro] = useState('');
    const [calendarioAberto, setCalendarioAberto] = useState(false);
    const [historicoAberto, setHistoricoAberto] = useState(false);
    const [dadosCarregados, setDadosCarregados] = useState(false);

useEffect(() => {
    let ativo = true;

    // Aguarda o Firebase recuperar a sessão do usuário.
    if (carregando) return;

    async function carregarRegistros() {
        try {
            if (!usuario) {
                if (ativo) setHistory([]);
                return;
            }

            // Recupera os registros antigos do armazenamento local.
            const registrosLocais = await AsyncStorage.getItem(STORAGE_KEY);

            if (registrosLocais) {
                const listaLocal = JSON.parse(registrosLocais);

                if (Array.isArray(listaLocal)) {
                    for (const registro of listaLocal) {
                        await importarRegistroHumor(usuario.uid, registro);
                    }
                }

                // Só remove os dados locais depois da migração.
                await AsyncStorage.removeItem(STORAGE_KEY);
            }

            // Busca os registros no Firestore.
            const registros = await buscarRegistrosHumor(usuario.uid);

            if (ativo) {
                setHistory(registros);
            }

        } catch (error) {
            console.error('Erro ao carregar histórico de humor:', error);

            if (ativo) {
                Alert.alert(
                    'Erro',
                    'Não foi possível carregar seus registros de humor. Verifique sua conexão e tente novamente.'
                );
            }
        } finally {
            if (ativo) {
                setDadosCarregados(true);
            }
        }
    }

    carregarRegistros();

    return () => {
        ativo = false;
    };

}, [carregando, usuario?.uid]);

    // Atualiza a separação entre registros recentes e arquivados enquanto a tela está aberta.
    const [, atualizarRelogio] = useState(Date.now());
    useEffect(() => {
        const intervalo = setInterval(() => atualizarRelogio(Date.now()), 60 * 1000);
        return () => clearInterval(intervalo);
    }, []);

    function dataLocalISO(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }

    function converterDataParaDate(valor) {
        if (!valor) return new Date();
        const [ano, mes, dia] = valor.split('-').map(Number);
        return new Date(ano, mes - 1, dia, 12);
    }

    function alterarDataCalendario(event, dataSelecionada) {
        if (event.type === 'set' && dataSelecionada) {
            setDataFiltro(dataLocalISO(dataSelecionada));
        }
        setCalendarioAberto(false);
    }

    const limiteArquivamento = Date.now() - DOIS_DIAS_MS;
    const registrosRecentes = history.filter((entry) => (entry.timestamp || 0) >= limiteArquivamento);
    const registrosArquivados = history.filter((entry) => (entry.timestamp || 0) < limiteArquivamento);
    const historicoFiltrado = (dataFiltro
        ? registrosArquivados.filter((entry) => entry.dateKey === dataFiltro)
        : registrosArquivados
    ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const registrosRecentesOrdenados = registrosRecentes
        .slice()
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    function alternarHumor(label) {
        setSelectedMoods((atuais) =>
            atuais.includes(label) ? atuais.filter((item) => item !== label) : [...atuais, label]
        );
    }
async function excluirRegistro(entry) {
    const confirmarExclusao = async () => {
        try {
            if (carregando || !usuario) {
                Alert.alert('Atenção', 'Você precisa estar conectado para excluir este registro.');
                return;
            }

            await excluirRegistroHumor(usuario.uid, entry.id);
            setHistory((atuais) => atuais.filter((item) => item.id !== entry.id));
        } catch (error) {
            console.error('Erro ao excluir registro:', error);
            Alert.alert('Erro', 'Não foi possível excluir o registro. Tente novamente.');
        }
    };

    if (Platform.OS === 'web') {
        const confirmou = window.confirm(
            'Esse registro de humor será removido permanentemente. Deseja continuar?'
        );
        if (confirmou) await confirmarExclusao();
        return;
    }

    Alert.alert(
        'Excluir registro?',
        'Esse registro de humor será removido permanentemente.',
        [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: confirmarExclusao },
        ]
    );
}


    async function saveMood() {
        if (selectedMoods.length === 0) {
            Alert.alert(
                'Como você está?',
                'Selecione pelo menos uma opção de humor antes de registrar.'
            );
            return;
        }

        const now = new Date();

        const newEntry = {
            id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
            moods: selectedMoods,
            timestamp: now.getTime(),
            note: note.trim(),
            date: now.toLocaleDateString('pt-BR'),
            dateKey: dataLocalISO(now),
            time: now.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        try {
            if (carregando || !usuario) {
                Alert.alert('Atenção', 'Você precisa estar conectado para registrar seu humor.');
                return;
            }

            const registroSalvo = await salvarRegistroHumor(usuario.uid, newEntry);
            setHistory((previous) => [registroSalvo, ...previous]);
            setNote('');
            setSelectedMoods([]);

            Alert.alert('Registro realizado', 'Seu registro foi salvo. Depois de dois dias, ele ficará disponível no histórico.');
        } catch (error) {
            console.error('Erro ao salvar registro de humor:', error);
            Alert.alert('Erro', 'Não foi possível salvar seu humor. Verifique sua conexão e tente novamente.');
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {!historicoAberto && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Voltar para Bem-estar"
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={20}
                            color={COLORS.primary}
                        />
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </Pressable>
                )}

                {historicoAberto && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Voltar para registros recentes"
                        onPress={() => {
                            setHistoricoAberto(false);
                            setDataFiltro('');
                        }}
                        style={styles.backButton}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={20}
                            color={COLORS.primary}
                        />
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </Pressable>
                )}

                {!historicoAberto && (
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.title}>Como você está?</Text>
                            <Text style={styles.subtitle}>
                                Reserve um momento para perceber como você se sente.
                            </Text>
                        </View>
                    </View>
                )}
                {!historicoAberto && <View style={styles.mainCard}>

                    <View style={styles.moodList}>
                        {MOODS.map((mood) => {
                            const selected = selectedMoods.includes(mood.label);

                            return (
                                <Pressable
                                    key={mood.label}
                                    accessibilityRole="button"
                                    accessibilityLabel={mood.label}
                                    accessibilityState={{ selected }}
                                    onPress={() => alternarHumor(mood.label)}
                                    style={[
                                        styles.moodOption,
                                        selected && styles.moodSelected,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.emojiCircle,
                                            { backgroundColor: mood.color },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name={mood.icon}
                                            size={20}
                                            color={COLORS.primary}
                                        />
                                    </View>

                                    <Text
                                        style={[
                                            styles.moodLabel,
                                            selected && styles.selectedLabel,
                                        ]}
                                    >
                                        {mood.label}
                                    </Text>

                                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                                        {selected && <MaterialCommunityIcons name="check" size={14} color={COLORS.white} />}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Text style={styles.inputLabel}>
                        Quer contar um pouco mais?
                    </Text>

                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder="Escreva uma observação (opcional)"
                        placeholderTextColor="#929B91"
                        multiline
                        maxLength={500}
                        textAlignVertical="top"
                        style={styles.textInput}
                    />

                    <Pressable
                        accessibilityRole="button"
                        onPress={saveMood}
                        style={({ pressed }) => [
                            styles.saveButton,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="check-circle-outline"
                            size={21}
                            color={COLORS.white}
                        />
                        <Text style={styles.saveButtonText}>
                            Registrar meu humor
                        </Text>
                    </Pressable>

                </View>}

                {!historicoAberto ? (
                    <View>
                        <View style={styles.historyHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sectionTitle}>Registros recentes</Text>
                                <Text style={styles.helper}>Os registros permanecem aqui durante os dois primeiros dias.</Text>
                            </View>
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => { setHistoricoAberto(true); setDataFiltro(''); }}
                                style={styles.openHistoryButton}
                            >
                                <MaterialCommunityIcons name="archive-outline" size={19} color={COLORS.primary} />
                                <Text style={styles.openHistoryText}>Histórico</Text>
                            </Pressable>
                        </View>
                        {registrosRecentesOrdenados.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <View style={styles.emptyIcon}><MaterialCommunityIcons name="notebook-heart-outline" size={30} color={COLORS.primary} /></View>
                                <Text style={styles.emptyTitle}>Nenhum registro recente</Text>
                                <Text style={styles.emptyText}>Depois de registrar seu humor, seus registros aparecerão nesta área por dois dias.</Text>
                            </View>
                        ) : registrosRecentesOrdenados.map((entry) => (
                            <View key={entry.id} style={styles.historyCard}>
                                <View style={styles.historyInfo}>
                                    <View style={styles.moodTags}>
                                        {(entry.moods || (entry.mood ? [entry.mood] : [])).map((label) => {
                                            const mood = MOODS.find((item) => item.label === label);
                                            return (
                                                <View key={label} style={styles.moodTagWithIcon}>
                                                    <MaterialCommunityIcons name={mood?.icon || 'emoticon-outline'} size={16} color={COLORS.primary} />
                                                    <Text style={styles.moodTagText}>{label}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                    <Text style={styles.historyDate}>{entry.date} às {entry.time}</Text>
                                    {!!entry.note && <Text style={styles.historyNote}>{entry.note}</Text>}
                                </View>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Excluir registro de humor"
                                    onPress={() => excluirRegistro(entry)}
                                    style={styles.deleteButton}
                                    hitSlop={8}
                                >
                                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#C56D55" />
                                </Pressable>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View>
                        <View style={styles.historyHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sectionTitle}>Histórico de humor</Text>
                                <Text style={styles.helper}>Todos os registros com mais de dois dias ficam arquivados aqui.</Text>
                            </View>
                            <View style={styles.calendarActions}>
                                {Platform.OS === 'web' ? (
                                    <View style={styles.webDateContainer}>
                                        <MaterialCommunityIcons name="calendar-month-outline" size={20} color={COLORS.primary} />
                                        {React.createElement('input', {
                                            type: 'date', value: dataFiltro,
                                            onChange: (event) => setDataFiltro(event.target.value),
                                            'aria-label': 'Filtrar histórico por data',
                                            style: { border: 'none', outline: 'none', background: 'transparent', color: COLORS.text, fontSize: '12px', width: '112px' },
                                        })}
                                    </View>
                                ) : (
                                    <Pressable accessibilityRole="button" accessibilityLabel="Selecionar data para filtrar o histórico" onPress={() => setCalendarioAberto(true)} style={styles.calendarButton}>
                                        <MaterialCommunityIcons name="calendar-month-outline" size={23} color={COLORS.primary} />
                                    </Pressable>
                                )}
                                {!!dataFiltro && <Pressable onPress={() => setDataFiltro('')}><Text style={styles.clearDateText}>Limpar</Text></Pressable>}
                            </View>
                        </View>
                        {Platform.OS !== 'web' && calendarioAberto && (
                            <DateTimePicker value={converterDataParaDate(dataFiltro)} mode="date" display="default" onChange={alterarDataCalendario} locale="pt-BR" maximumDate={new Date()} />
                        )}
                        {historicoFiltrado.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <View style={styles.emptyIcon}><MaterialCommunityIcons name="archive-outline" size={30} color={COLORS.primary} /></View>
                                <Text style={styles.emptyTitle}>{dataFiltro ? 'Nenhum registro nesta data' : 'Seu histórico está vazio'}</Text>
                                <Text style={styles.emptyText}>{dataFiltro ? 'Escolha outra data ou limpe o filtro para visualizar os registros.' : 'Os registros serão arquivados automaticamente aqui após dois dias.'}</Text>
                            </View>
                        ) : historicoFiltrado.map((entry, index) => {
                            const data = converterDataParaDate(entry.dateKey);
                            const mesAno = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                            const anterior = historicoFiltrado[index - 1];
                            const mesAnterior = anterior ? converterDataParaDate(anterior.dateKey).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : null;
                            return (
                                <React.Fragment key={entry.id}>
                                    {mesAno !== mesAnterior && <Text style={styles.monthHeading}>{mesAno}</Text>}
                                    <View style={styles.historyCard}>
                                        <View style={styles.historyInfo}>
                                            <View style={styles.moodTags}>
                                                {(entry.moods || (entry.mood ? [entry.mood] : [])).map((label) => {
                                                    const mood = MOODS.find((item) => item.label === label);
                                                    return (
                                                        <View key={label} style={styles.moodTagWithIcon}>
                                                            <MaterialCommunityIcons name={mood?.icon || 'emoticon-outline'} size={16} color={COLORS.primary} />
                                                            <Text style={styles.moodTagText}>{label}</Text>
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                            <Text style={styles.historyDate}>{entry.date} às {entry.time}</Text>
                                            {!!entry.note && <Text style={styles.historyNote}>{entry.note}</Text>}
                                        </View>
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Excluir registro de humor"
                                            onPress={() => excluirRegistro(entry)}
                                            style={styles.deleteButton}
                                            hitSlop={8}
                                        >
                                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#C56D55" />
                                        </Pressable>
                                    </View>
                                </React.Fragment>
                            );
                        })}
                    </View>
                )}

                <View style={styles.footer}>
                    <MaterialCommunityIcons
                        name="sprout-outline"
                        size={22}
                        color={COLORS.primary}
                    />
                    <Text style={styles.footerText}>
                        Todos os sentimentos merecem atenção.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 35,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 7,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 14,
        borderRadius: 10,
        backgroundColor: '#FFF0C2',
    },
    backButtonText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    headerText: {
        flex: 1,
        paddingRight: 10,
    },
    eyebrow: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.4,
        marginBottom: 7,
    },
    title: {
        color: COLORS.text,
        fontSize: 27,
        fontWeight: '800',
    },
    subtitle: {
        color: COLORS.secondary,
        fontSize: 14,
        lineHeight: 21,
        marginTop: 7,
    },
    headerIcon: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: '#FFF5D9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 19,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 28,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '700',
    },
    helper: {
        color: COLORS.secondary,
        fontSize: 13,
        lineHeight: 19,
        marginTop: 5,
    },
    moodList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 10,
        marginTop: 20,
        marginBottom: 23,
    },
    moodOption: {
        width: '48%',
        minHeight: 62,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    moodSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#FFF4D6',
    },
    emojiCircle: {
        width: 32,
        height: 32,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    emoji: {
        fontSize: 20,
    },
    moodLabel: {
        flex: 1,
        flexShrink: 1,
        color: COLORS.text,
        fontSize: 11,
        fontWeight: '600',
    },
    selectedLabel: {
        color: COLORS.primary,
        fontWeight: '800',
    },
    inputLabel: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },
    textInput: {
        minHeight: 95,
        maxHeight: 150,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: '#FFFCF3',
        padding: 13,
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 17,
    },
    saveButton: {
        minHeight: 52,
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '700',
    },
    privacyNote: {
        textAlign: 'center',
        color: COLORS.secondary,
        fontSize: 11,
        marginTop: 13,
    },
    calendarActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    calendarButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#FFF0C2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    webDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 8,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#FFF0C2',
    },
    clearDateText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    checkbox: { width: 21, height: 21, borderRadius: 6, borderWidth: 1.5, borderColor: '#B6C1B3', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
    checkboxSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    openHistoryButton: {
        flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 9,
        borderRadius: 12, backgroundColor: '#FFF0C2',
    },
    openHistoryText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
    moodTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    moodTagWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6, color: COLORS.text, backgroundColor: '#FFF4D6', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6 },
    moodTagText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
    monthHeading: { color: COLORS.primary, fontSize: 15, fontWeight: '800', textTransform: 'capitalize', marginTop: 12, marginBottom: 10 },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    emptyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 23,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyIcon: {
        width: 56,
        height: 56,
        borderRadius: 19,
        backgroundColor: '#FFF5D9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },
    emptyText: {
        color: COLORS.secondary,
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 7,
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.white,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 14,
        marginBottom: 10,
    },
    historyEmoji: {
        width: 46,
        height: 46,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    historyInfo: {
        flex: 1,
    },
    deleteButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#FFF1EC',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    historyMood: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '700',
    },
    historyDate: {
        color: COLORS.secondary,
        fontSize: 12,
        marginTop: 4,
    },
    historyNote: {
        color: COLORS.text,
        fontSize: 13,
        lineHeight: 19,
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 26,
    },
    footerText: {
        color: COLORS.secondary,
        fontSize: 12,
    },
});
