
import React, { useState } from 'react';
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

const COLORS = {
    primary: '#F09F53',
    text: '#26352A',
    secondary: '#8A8175',
    background: '#FFFAE9',
    white: '#FFFFFF',
    border: '#EED99E',
};

const MOODS = [
    { label: 'Muito mal', icon: 'emoticon-sad-outline', color: '#FFF0C2' },
    { label: 'Mal', icon: 'emoticon-confused-outline', color: '#FFF4D6' },
    { label: 'Mais ou menos', icon: 'emoticon-neutral-outline', color: '#FFEFC0' },
    { label: 'Bem', icon: 'emoticon-happy-outline', color: '#FFEDB8' },
    { label: 'Muito bem', icon: 'emoticon-excited-outline', color: '#FFE6A6' },

    { label: 'Calma', icon: 'meditation', color: '#FFF5D9' },
    { label: 'Feliz', icon: 'heart', color: '#FFEAB3' },
    { label: 'Energética', icon: 'lightning-bolt', color: '#FFEFC0' },
    { label: 'Alegre', icon: 'emoticon-happy', color: '#FFEDB8' },
    { label: 'Mudança de humor', icon: 'drama-masks', color: '#FFF4D6' },
    { label: 'Irritada', icon: 'emoticon-angry-outline', color: '#F8DFA0' },
    { label: 'Triste', icon: 'emoticon-cry-outline', color: '#FFF0C2' },
    { label: 'Ansioso(a)', icon: 'weather-windy', color: '#FFF5D9' },
    { label: 'Desanimado(a)', icon: 'cloud-outline', color: '#FFF0C2' },
    { label: 'Culpado(a)', icon: 'alert-circle-outline', color: '#FFF4D6' },
    { label: 'Pouca energia', icon: 'battery-low', color: '#FFEFC0' },
    { label: 'Confusão', icon: 'head-question-outline', color: '#FFEDB8' },
    { label: 'Muito autocrítico(a)', icon: 'account-alert-outline', color: '#FFF0C2' },
];


export default function Humor() {
    const [selectedMood, setSelectedMood] = useState(null);
    const [note, setNote] = useState('');
    const [history, setHistory] = useState([]);
    const [dataFiltro, setDataFiltro] = useState('');
    const [calendarioAberto, setCalendarioAberto] = useState(false);

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

    const historicoFiltrado = dataFiltro
        ? history.filter((entry) => entry.dateKey === dataFiltro)
        : history;

    function saveMood() {
        if (!selectedMood) {
            Alert.alert(
                'Como você está?',
                'Selecione uma opção de humor antes de registrar.'
            );
            return;
        }

        const now = new Date();

        const newEntry = {
            id: `${now.getTime()}`,
            mood: selectedMood,
            note: note.trim(),
            date: now.toLocaleDateString('pt-BR'),
            dateKey: dataLocalISO(now),
            time: now.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        setHistory((previous) => [newEntry, ...previous]);
        setNote('');
        setSelectedMood(null);

        Alert.alert('Registro realizado', 'Seu humor foi registrado nesta sessão.');
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.eyebrow}>SEU BEM-ESTAR</Text>
                        <Text style={styles.title}>Como você está?</Text>
                        <Text style={styles.subtitle}>
                            Reserve um momento para perceber como você se sente.
                        </Text>
                    </View>
                </View>

                <View style={styles.mainCard}>

                    <View style={styles.moodList}>
                        {MOODS.map((mood) => {
                            const selected = selectedMood === mood.label;

                            return (
                                <Pressable
                                    key={mood.label}
                                    accessibilityRole="button"
                                    accessibilityLabel={mood.label}
                                    accessibilityState={{ selected }}
                                    onPress={() => setSelectedMood(mood.label)}
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

                                    <View style={styles.radio}>
                                        {selected && (
                                            <View style={styles.radioInner} />
                                        )}
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

                </View>

                <View style={styles.historyHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>
                            Histórico de humor
                        </Text>
                        <Text style={styles.helper}>
                            Seus registros desta sessão
                        </Text>
                    </View>

                    <View style={styles.calendarActions}>
                        {Platform.OS === 'web' ? (
                            <View style={styles.webDateContainer}>
                                <MaterialCommunityIcons
                                    name="calendar-month-outline"
                                    size={20}
                                    color={COLORS.primary}
                                />
                                {React.createElement('input', {
                                    type: 'date',
                                    value: dataFiltro,
                                    onChange: (event) => setDataFiltro(event.target.value),
                                    'aria-label': 'Filtrar histórico por data',
                                    style: {
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        color: COLORS.text,
                                        fontSize: '12px',
                                        width: '112px',
                                    },
                                })}
                            </View>
                        ) : (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Selecionar data para filtrar o histórico"
                                onPress={() => setCalendarioAberto(true)}
                                style={styles.calendarButton}
                            >
                                <MaterialCommunityIcons
                                    name="calendar-month-outline"
                                    size={23}
                                    color={COLORS.primary}
                                />
                            </Pressable>
                        )}
                        {!!dataFiltro && (
                            <Pressable onPress={() => setDataFiltro('')}>
                                <Text style={styles.clearDateText}>Limpar</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {Platform.OS !== 'web' && calendarioAberto && (
                    <DateTimePicker
                        value={converterDataParaDate(dataFiltro)}
                        mode="date"
                        display="default"
                        onChange={alterarDataCalendario}
                        locale="pt-BR"
                    />
                )}

                {history.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <View style={styles.emptyIcon}>
                            <MaterialCommunityIcons
                                name="notebook-heart-outline"
                                size={30}
                                color={COLORS.primary}
                            />
                        </View>
                        <Text style={styles.emptyTitle}>
                            Seu histórico começa aqui
                        </Text>
                        <Text style={styles.emptyText}>
                            Depois de registrar seu humor, você poderá
                            visualizar os registros nesta área.
                        </Text>
                    </View>
                ) : historicoFiltrado.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <View style={styles.emptyIcon}>
                            <MaterialCommunityIcons
                                name="calendar-remove-outline"
                                size={30}
                                color={COLORS.primary}
                            />
                        </View>
                        <Text style={styles.emptyTitle}>Nenhum registro nesta data</Text>
                        <Text style={styles.emptyText}>
                            Escolha outra data ou limpe o filtro para ver todos os registros.
                        </Text>
                    </View>
                ) : (
                    historicoFiltrado.map((entry) => {
                        const mood = MOODS.find(
                            (item) => item.label === entry.mood
                        );

                        return (
                            <View key={entry.id} style={styles.historyCard}>
                                <View
                                    style={[
                                        styles.historyEmoji,
                                        { backgroundColor: mood.color },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={mood.icon}
                                        size={24}
                                        color={COLORS.primary}
                                    />
                                </View>

                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyMood}>
                                        {entry.mood}
                                    </Text>
                                    <Text style={styles.historyDate}>
                                        {entry.date} às {entry.time}
                                    </Text>
                                    {entry.note ? (
                                        <Text style={styles.historyNote}>
                                            {entry.note}
                                        </Text>
                                    ) : null}
                                </View>
                            </View>
                        );
                    })
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
    radio: {
        width: 21,
        height: 21,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: '#B6C1B3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
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
