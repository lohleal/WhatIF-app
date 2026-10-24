
import { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
    primary: '#2F8F46',
    text: '#26352A',
    secondary: '#758075',
    background: '#F8FAF5',
    white: '#FFFFFF',
    border: '#E8EDE3',
};

const MOODS = [
    { label: 'Muito mal', emoji: '😞', color: '#FCE8E6' },
    { label: 'Mal', emoji: '😕', color: '#FFF0DF' },
    { label: 'Mais ou menos', emoji: '😐', color: '#FFF5D9' },
    { label: 'Bem', emoji: '🙂', color: '#E5F3E4' },
    { label: 'Muito bem', emoji: '😄', color: '#DDF2E5' },
];

export default function Humor() {
    const [selectedMood, setSelectedMood] = useState(null);
    const [note, setNote] = useState('');
    const [history, setHistory] = useState([]);

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

                    <View style={styles.headerIcon}>
                        <MaterialCommunityIcons
                            name="heart-outline"
                            size={30}
                            color={COLORS.primary}
                        />
                    </View>
                </View>

                <View style={styles.mainCard}>
                    <Text style={styles.sectionTitle}>
                        Como está seu humor hoje?
                    </Text>

                    <Text style={styles.helper}>
                        Escolha a opção que mais combina com você.
                    </Text>

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
                                        <Text style={styles.emoji}>
                                            {mood.emoji}
                                        </Text>
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

                    <Text style={styles.privacyNote}>
                        Seu registro é um momento de autocuidado.
                    </Text>
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

                    <MaterialCommunityIcons
                        name="calendar-month-outline"
                        size={26}
                        color={COLORS.primary}
                    />
                </View>

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
                ) : (
                    history.map((entry) => {
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
                                    <Text style={styles.emoji}>
                                        {mood.emoji}
                                    </Text>
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
        backgroundColor: '#E8F3E4',
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
        gap: 10,
        marginTop: 20,
        marginBottom: 23,
    },
    moodOption: {
        minHeight: 62,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 11,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    moodSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0F7ED',
    },
    emojiCircle: {
        width: 43,
        height: 43,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    emoji: {
        fontSize: 24,
    },
    moodLabel: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
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
        backgroundColor: '#FBFCF9',
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
        backgroundColor: '#E8F3E4',
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

// import { Text, View } from 'react-native';

// export default function Humor() {
//     return (
//         <View>
//             <Text>Tela de humor</Text>
//         </View>
//     );
// }