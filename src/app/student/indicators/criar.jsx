
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';

const COLORS = {
    primary: '#4D8968',
    text: '#34443A',
    secondaryText: '#788078',
    white: '#FFFFFF',
    border: '#E5EAE4',
    greenLight: '#EFF6ED',
    blueLight: '#EDF7FA',
    purpleLight: '#F5EFFA',
    pinkLight: '#FFF0F0',
    peachLight: '#FFF4EB',
};

const TYPES = [
    {
        id: 'quantidade',
        title: 'Quantidade',
        description: 'Ex.: páginas, copos ou ml',
        icon: 'counter',
        color: '#5A9EAD',
        background: COLORS.blueLight,
    },
    {
        id: 'duracao',
        title: 'Duração',
        description: 'Ex.: minutos de estudo',
        icon: 'clock-outline',
        color: '#9571B4',
        background: COLORS.purpleLight,
    },
    {
        id: 'frequencia',
        title: 'Frequência',
        description: 'Ex.: vezes por dia',
        icon: 'repeat',
        color: '#D28A61',
        background: COLORS.peachLight,
    },
    {
        id: 'conclusao',
        title: 'Conclusão',
        description: 'Ex.: concluir uma tarefa',
        icon: 'check-circle-outline',
        color: '#63916D',
        background: COLORS.greenLight,
    },
];

const DAYS = [
    { label: 'D', name: 'Domingo' },
    { label: 'S', name: 'Segunda' },
    { label: 'T', name: 'Terça' },
    { label: 'Q', name: 'Quarta' },
    { label: 'Q', name: 'Quinta' },
    { label: 'S', name: 'Sexta' },
    { label: 'S', name: 'Sábado' },
];

export default function CriarIndicador() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('quantidade');
    const [target, setTarget] = useState('');
    const [unit, setUnit] = useState('');
    const [frequency, setFrequency] = useState('Todos os dias');
    const [selectedDays, setSelectedDays] = useState([]);
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [reminderTime, setReminderTime] = useState('19:00');

    const selectedType = TYPES.find(item => item.id === type);

    function toggleDay(day) {
        setSelectedDays(previous =>
            previous.includes(day)
                ? previous.filter(item => item !== day)
                : [...previous, day]
        );
    }

    function handleCreate() {
        if (!name.trim()) {
            Alert.alert(
                'Dê um nome ao indicador',
                'Digite o nome do indicador antes de continuar.'
            );
            return;
        }

        if (type !== 'conclusao' && (!target.trim() || Number(target) <= 0)) {
            Alert.alert(
                'Defina seu objetivo',
                'Informe uma quantidade ou duração maior que zero.'
            );
            return;
        }

        if (frequency === 'Dias específicos' && selectedDays.length === 0) {
            Alert.alert(
                'Selecione os dias',
                'Escolha pelo menos um dia da semana.'
            );
            return;
        }

        Alert.alert(
            'Interface pronta!',
            'O formulário está funcionando. A gravação do indicador será conectada na etapa de desenvolvimento dos dados.'
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.content}
            >
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.backButton}
                        accessibilityLabel="Voltar"
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={COLORS.primary}
                        />
                    </Pressable>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>Novo indicador</Text>
                    </View>
                </View>

                {/* Nome e descrição */}
                <View style={[styles.section, styles.greenSection]}>
                    <SectionTitle
                        icon="pencil-outline"
                        title="Sobre seu indicador"
                        color={COLORS.primary}
                    />

                    <Text style={styles.label}>Nome do indicador *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex.: Ler um capítulo"
                        placeholderTextColor="#A0AAA1"
                        value={name}
                        onChangeText={setName}
                        maxLength={60}
                    />

                    <Text style={styles.label}>
                        Descrição (opcional)
                    </Text>
                    <TextInput
                        style={[styles.input, styles.descriptionInput]}
                        placeholder="Descreva o que você deseja acompanhar..."
                        placeholderTextColor="#A0AAA1"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        maxLength={180}
                    />
                </View>

                {/* Tipo de acompanhamento */}
                <View style={[styles.section, styles.blueSection]}>
                    <SectionTitle
                        icon="chart-box-outline"
                        title="Tipo de acompanhamento"
                        color="#568E9C"
                    />

                    <Text style={styles.helper}>
                        Como você quer medir seu progresso?
                    </Text>

                    <View style={styles.typeGrid}>
                        {TYPES.map(item => {
                            const active = type === item.id;

                            return (
                                <Pressable
                                    key={item.id}
                                    onPress={() => setType(item.id)}
                                    style={[
                                        styles.typeCard,
                                        { backgroundColor: item.background },
                                        active && styles.typeCardActive,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.typeIcon,
                                            { backgroundColor: '#FFFFFF' },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name={item.icon}
                                            size={24}
                                            color={item.color}
                                        />
                                    </View>

                                    <View style={styles.typeTextContainer}>
                                        <Text style={styles.typeTitle}>
                                            {item.title}
                                        </Text>
                                        <Text style={styles.typeDescription}>
                                            {item.description}
                                        </Text>
                                    </View>

                                    <MaterialCommunityIcons
                                        name={
                                            active
                                                ? 'check-circle'
                                                : 'circle-outline'
                                        }
                                        size={20}
                                        color={active ? COLORS.primary : '#B9C1B9'}
                                    />
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Meta */}
                <View style={[styles.section, styles.purpleSection]}>
                    <SectionTitle
                        icon="flag-outline"
                        title="Defina seu objetivo"
                        color="#9571B4"
                    />

                    {type === 'conclusao' ? (
                        <Text style={styles.helper}>
                            Você registrará se concluiu ou não a atividade.
                        </Text>
                    ) : (
                        <>
                            <Text style={styles.helper}>
                                Qual resultado você deseja alcançar por dia?
                            </Text>

                            <View style={styles.targetRow}>
                                <View style={styles.targetField}>
                                    <Text style={styles.label}>Objetivo diário</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ex.: 30"
                                        placeholderTextColor="#A0AAA1"
                                        value={target}
                                        onChangeText={setTarget}
                                        keyboardType="decimal-pad"
                                    />
                                </View>

                                <View style={styles.unitField}>
                                    <Text style={styles.label}>Unidade</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={
                                            type === 'duracao'
                                                ? 'Minutos'
                                                : type === 'frequencia'
                                                    ? 'Vezes'
                                                    : 'Ex.: páginas'
                                        }
                                        placeholderTextColor="#A0AAA1"
                                        value={unit}
                                        onChangeText={setUnit}
                                        maxLength={20}
                                    />
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Frequência */}
                <View style={[styles.section, styles.peachSection]}>
                    <SectionTitle
                        icon="calendar-month-outline"
                        title="Frequência"
                        color="#C5855D"
                    />

                    <Text style={styles.helper}>
                        Em quais dias você deseja acompanhar esse indicador?
                    </Text>

                    <View style={styles.frequencyOptions}>
                        {['Todos os dias', 'Dias específicos'].map(option => {
                            const active = frequency === option;

                            return (
                                <Pressable
                                    key={option}
                                    onPress={() => setFrequency(option)}
                                    style={[
                                        styles.frequencyButton,
                                        active && styles.frequencyButtonActive,
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={
                                            active
                                                ? 'radiobox-marked'
                                                : 'radiobox-blank'
                                        }
                                        size={20}
                                        color={
                                            active
                                                ? COLORS.primary
                                                : COLORS.secondaryText
                                        }
                                    />

                                    <Text
                                        style={[
                                            styles.frequencyText,
                                            active && styles.frequencyTextActive,
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {frequency === 'Dias específicos' && (
                        <View style={styles.daysContainer}>
                            {DAYS.map((day, index) => {
                                const active = selectedDays.includes(day.name);

                                return (
                                    <Pressable
                                        key={`${day.name}-${index}`}
                                        onPress={() => toggleDay(day.name)}
                                        style={[
                                            styles.dayButton,
                                            active && styles.dayButtonActive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.dayLabel,
                                                active && styles.dayLabelActive,
                                            ]}
                                        >
                                            {day.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Lembrete */}
                <View style={[styles.section, styles.reminderSection]}>
                    <View style={styles.reminderHeader}>
                        <View style={styles.reminderHeading}>
                            <View style={styles.reminderIcon}>
                                <MaterialCommunityIcons
                                    name="bell-outline"
                                    size={24}
                                    color="#9571B4"
                                />
                            </View>

                            <View style={styles.reminderTextContainer}>
                                <Text style={styles.sectionTitle}>
                                    Lembrete diário
                                </Text>
                                <Text style={styles.helper}>
                                    Receba um lembrete para não esquecer.
                                </Text>
                            </View>
                        </View>

                        <Switch
                            value={reminderEnabled}
                            onValueChange={setReminderEnabled}
                            trackColor={{
                                false: '#D9DED8',
                                true: '#A8C9AD',
                            }}
                            thumbColor={
                                reminderEnabled ? COLORS.primary : '#F5F5F5'
                            }
                        />
                    </View>

                    {reminderEnabled && (
                        <View style={styles.timeContainer}>
                            <MaterialCommunityIcons
                                name="clock-outline"
                                size={21}
                                color="#9571B4"
                            />

                            <Text style={styles.timeLabel}>Horário</Text>

                            <TextInput
                                style={styles.timeInput}
                                value={reminderTime}
                                onChangeText={setReminderTime}
                                placeholder="19:00"
                                placeholderTextColor="#A0AAA1"
                                keyboardType="numbers-and-punctuation"
                                maxLength={5}
                            />
                        </View>
                    )}
                </View>

                {/* Botão de criação */}
                <Pressable
                    onPress={handleCreate}
                    style={({ pressed }) => [
                        styles.createButton,
                        pressed && styles.createButtonPressed,
                    ]}
                >
                    <MaterialCommunityIcons
                        name="plus-circle-outline"
                        size={23}
                        color="#FFFFFF"
                    />

                    <Text style={styles.createButtonText}>
                        Criar indicador
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function SectionTitle({ icon, title, color }) {
    return (
        <View style={styles.sectionHeading}>
            <MaterialCommunityIcons
                name={icon}
                size={23}
                color={color}
            />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },

    content: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 42 : 24,
        paddingBottom: 35,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
        gap: 12,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 15,
        backgroundColor: COLORS.greenLight,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerText: {
        flex: 1,
    },

    title: {
        fontSize: 25,
        fontWeight: '800',
        color: COLORS.primary,
    },

    subtitle: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 19,
        color: COLORS.secondaryText,
    },

    section: {
        borderRadius: 22,
        padding: 17,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },

    greenSection: {
        backgroundColor: COLORS.greenLight,
    },

    blueSection: {
        backgroundColor: COLORS.blueLight,
    },

    purpleSection: {
        backgroundColor: COLORS.purpleLight,
    },

    peachSection: {
        backgroundColor: COLORS.peachLight,
    },

    reminderSection: {
        backgroundColor: '#F4F0FA',
    },

    sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        marginBottom: 14,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
    },

    label: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 7,
        marginTop: 10,
    },

    helper: {
        fontSize: 13,
        lineHeight: 19,
        color: COLORS.secondaryText,
        marginBottom: 10,
    },

    input: {
        minHeight: 47,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 13,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 13,
        paddingVertical: 11,
        fontSize: 14,
        color: COLORS.text,
    },

    descriptionInput: {
        minHeight: 76,
        textAlignVertical: 'top',
    },

    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    typeCard: {
        width: '48%',
        flexGrow: 1,
        minHeight: 112,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'transparent',
        justifyContent: 'space-between',
        gap: 8,
    },

    typeCardActive: {
        borderColor: COLORS.primary,
    },

    typeIcon: {
        width: 35,
        height: 35,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    typeTextContainer: {
        flex: 1,
    },

    typeTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },

    typeDescription: {
        marginTop: 4,
        fontSize: 10,
        lineHeight: 14,
        color: COLORS.secondaryText,
    },

    targetRow: {
        flexDirection: 'row',
        gap: 10,
    },

    targetField: {
        flex: 1,
    },

    unitField: {
        flex: 1,
    },

    frequencyOptions: {
        gap: 9,
    },

    frequencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        padding: 12,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#E7DFD6',
        backgroundColor: '#FFFFFFA8',
    },

    frequencyButtonActive: {
        borderColor: COLORS.primary,
        backgroundColor: '#FFFFFF',
    },

    frequencyText: {
        fontSize: 13,
        color: COLORS.secondaryText,
    },

    frequencyTextActive: {
        fontWeight: '700',
        color: COLORS.primary,
    },

    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        gap: 5,
    },

    dayButton: {
        width: 35,
        height: 35,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    dayButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    dayLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.secondaryText,
    },

    dayLabelActive: {
        color: '#FFFFFF',
    },

    reminderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },

    reminderHeading: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    reminderIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    reminderTextContainer: {
        flex: 1,
    },

    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#E5DDEC',
        gap: 10,
    },

    timeLabel: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },

    timeInput: {
        minWidth: 85,
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '700',
    },

    createButton: {
        minHeight: 55,
        borderRadius: 17,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 3,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    createButtonPressed: {
        opacity: 0.85,
    },

    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    footerText: {
        marginTop: 15,
        textAlign: 'center',
        fontSize: 12,
        fontStyle: 'italic',
        color: COLORS.secondaryText,
    },
});
