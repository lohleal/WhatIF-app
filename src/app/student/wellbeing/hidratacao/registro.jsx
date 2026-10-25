
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const BLUE = '#75BDF8';
const DARK_BLUE = '#174675';
const LIGHT_BLUE = '#F0F8FF';
const BORDER = '#D9EAFB';
const MUTED = '#71869D';
const WHITE = '#FFFFFF';

const recipientes = [
    { id: '100', nome: 'Pequeno', volume: 100 },
    { id: '150', nome: 'Médio', volume: 150 },
    { id: '200', nome: 'Copo', volume: 200 },
    { id: '250', nome: 'Grande', volume: 250 },
];

export default function AdicionarRegistroAgua() {
    const router = useRouter();

    const [quantidade, setQuantidade] = useState('200');
    const [recipienteSelecionado, setRecipienteSelecionado] =
        useState(null);

    const [registros, setRegistros] = useState([
        { id: '1', horario: '09:30', ml: 250 },
        { id: '2', horario: '08:00', ml: 200 },
    ]);

    const total = registros.reduce(
        (soma, registro) => soma + registro.ml,
        0
    );

    function ajustarQuantidade(valor) {
        const atual = Number(quantidade) || 0;

        setQuantidade(String(Math.max(0, atual + valor)));
        setRecipienteSelecionado(null);
    }

    function selecionarRecipiente(recipiente) {
        setRecipienteSelecionado(recipiente.id);
        setQuantidade(String(recipiente.volume));
    }

    function registrarAgua() {
        const ml = Number(quantidade);

        if (!Number.isFinite(ml) || ml <= 0) {
            Alert.alert(
                'Quantidade inválida',
                'Informe uma quantidade de água maior que zero.'
            );
            return;
        }

        const horario = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });

        setRegistros((atuais) => [
            {
                id: String(Date.now()),
                horario,
                ml,
            },
            ...atuais,
        ]);

        setQuantidade('200');
        setRecipienteSelecionado(null);
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screen}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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
                                Registro diário
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

                    {/* RESUMO DO CONSUMO */}
                    <View style={styles.totalCard}>
                        <Text style={styles.cardEyebrow}>
                            CONSUMO DE HOJE
                        </Text>

                        <Text style={styles.totalNumber}>
                            {total.toLocaleString('pt-BR')}
                            <Text style={styles.totalUnit}> ml</Text>
                        </Text>

                        <Text style={styles.totalDescription}>
                            Água registrada hoje
                        </Text>

                        <View style={styles.waterIllustration}>
                            <MaterialCommunityIcons
                                name="cup-water"
                                size={54}
                                color={WHITE}
                            />
                        </View>

                        <View style={styles.progressTrack}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(
                                            (total / 2000) * 100,
                                            100
                                        )}%`,
                                    },
                                ]}
                            />
                        </View>

                        <View style={styles.progressLabels}>
                            <Text style={styles.progressLabel}>
                                Seu consumo diário
                            </Text>
                            <Text style={styles.progressGoal}>
                                Meta: 2.000 ml
                            </Text>
                        </View>
                    </View>

                    {/* QUANTIDADE */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Quanto você bebeu?
                        </Text>

                        <Text style={styles.sectionSubtitle}>
                            Informe a quantidade de água.
                        </Text>

                        <View style={styles.quantityCard}>
                            <Pressable
                                style={styles.adjustButton}
                                onPress={() => ajustarQuantidade(-50)}
                                accessibilityLabel="Diminuir 50 ml"
                            >
                                <Ionicons
                                    name="remove"
                                    size={22}
                                    color={BLUE}
                                />
                            </Pressable>

                            <View style={styles.quantityValue}>
                                <TextInput
                                    value={quantidade}
                                    onChangeText={(valor) => {
                                        setQuantidade(
                                            valor.replace(/[^0-9]/g, '')
                                        );
                                        setRecipienteSelecionado(null);
                                    }}
                                    keyboardType="numeric"
                                    maxLength={5}
                                    selectTextOnFocus
                                    style={styles.quantityInput}
                                    accessibilityLabel="Quantidade em mililitros"
                                />
                                <Text style={styles.mlLabel}>
                                    mililitros
                                </Text>
                            </View>

                            <Pressable
                                style={styles.adjustButton}
                                onPress={() => ajustarQuantidade(50)}
                                accessibilityLabel="Adicionar 50 ml"
                            >
                                <Ionicons
                                    name="add"
                                    size={22}
                                    color={BLUE}
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* RECIPIENTES */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Qual recipiente você usou?
                        </Text>

                        <Text style={styles.sectionSubtitle}>
                            Selecione uma opção rápida.
                        </Text>

                        <View style={styles.containerOptions}>
                            {recipientes.map((item) => {
                                const selecionado =
                                    recipienteSelecionado === item.id;

                                return (
                                    <Pressable
                                        key={item.id}
                                        onPress={() =>
                                            selecionarRecipiente(item)
                                        }
                                        style={[
                                            styles.containerCard,
                                            selecionado &&
                                                styles.containerCardActive,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.containerIcon,
                                                selecionado &&
                                                    styles.containerIconActive,
                                            ]}
                                        >
                                            <MaterialCommunityIcons
                                                name="cup-water"
                                                size={30}
                                                color={BLUE}
                                            />
                                        </View>

                                        <Text
                                            style={[
                                                styles.containerName,
                                                selecionado &&
                                                    styles.selectedText,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {item.nome}
                                        </Text>

                                        <Text
                                            style={[
                                                styles.containerVolume,
                                                selecionado &&
                                                    styles.selectedText,
                                            ]}
                                        >
                                            {item.volume} ml
                                        </Text>

                                        {selecionado && (
                                            <View style={styles.checkIcon}>
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={17}
                                                    color={BLUE}
                                                />
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* REGISTRAR */}
                    <Pressable
                        style={styles.registerButton}
                        onPress={registrarAgua}
                    >
                        <Ionicons
                            name="water-outline"
                            size={21}
                            color={WHITE}
                        />

                        <Text style={styles.registerButtonText}>
                            Registrar consumo
                        </Text>

                        <Ionicons
                            name="arrow-forward"
                            size={19}
                            color={WHITE}
                        />
                    </Pressable>

                    {/* HISTÓRICO */}
                    <View style={styles.historySection}>
                        <View style={styles.historyHeader}>
                            <Text style={styles.sectionTitle}>
                                Registros de hoje
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
                                    name="water-outline"
                                    size={30}
                                    color={MUTED}
                                />
                                <Text style={styles.emptyText}>
                                    Seus registros aparecerão aqui.
                                </Text>
                            </View>
                        ) : (
                            registros.map((registro) => (
                                <View
                                    key={registro.id}
                                    style={styles.historyItem}
                                >
                                    <View style={styles.historyWaterIcon}>
                                        <MaterialCommunityIcons
                                            name="cup-water"
                                            size={24}
                                            color={BLUE}
                                        />
                                    </View>

                                    <View style={styles.historyInfo}>
                                        <Text style={styles.historyName}>
                                            Consumo de água
                                        </Text>
                                        <Text style={styles.historyTime}>
                                            Hoje, às {registro.horario}
                                        </Text>
                                    </View>

                                    <Text style={styles.historyAmount}>
                                        +{registro.ml} ml
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
        backgroundColor: '#F8FBFF',
    },

    content: {
        paddingHorizontal: 22,
        paddingTop: 12,
        paddingBottom: 24,
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
        fontSize: 23,
        fontWeight: '800',
        color: DARK_BLUE,
        letterSpacing: -0.5,
    },


    headerIcon: {
        width: 41,
        height: 41,
        borderRadius: 14,
        backgroundColor: LIGHT_BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    totalCard: {
        backgroundColor: BLUE,
        borderRadius: 23,
        padding: 20,
        marginBottom: 26,
        overflow: 'hidden',
    },

    cardEyebrow: {
        color: WHITE,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 1.2,
    },

    totalNumber: {
        color: WHITE,
        fontSize: 38,
        fontWeight: '800',
        marginTop: 6,
        letterSpacing: -1,
    },

    totalUnit: {
        fontSize: 25,
        fontWeight: '600',
    },

    totalDescription: {
        color: WHITE,
        fontSize: 15,
        marginTop: 3,
    },

    waterIllustration: {
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
        marginTop: 9,
    },

    progressLabel: {
        color: WHITE,
        fontSize: 15,
    },

    progressGoal: {
        color: WHITE,
        fontSize: 15,
    },

    section: {
        marginBottom: 23,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: DARK_BLUE,
        letterSpacing: -0.2,
    },

    sectionSubtitle: {
        fontSize: 15,
        color: MUTED,
        marginTop: 5,
        marginBottom: 12,
    },

    quantityCard: {
        minHeight: 83,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: LIGHT_BLUE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 13,
    },

    adjustButton: {
        width: 37,
        height: 37,
        borderRadius: 12,
        backgroundColor: '#DDEFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    quantityValue: {
        alignItems: 'center',
        flex: 1,
    },

    quantityInput: {
        color: DARK_BLUE,
        fontSize: 29,
        fontWeight: '800',
        textAlign: 'center',
        minWidth: 85,
        paddingVertical: 0,
    },

    mlLabel: {
        color: MUTED,
        fontSize: 12,
        marginTop: 0,
    },

    containerOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
    },

    containerCard: {
        flex: 1,
        minWidth: 0,
        minHeight: 112,
        backgroundColor: LIGHT_BLUE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 2,
        position: 'relative',
    },

    containerCardActive: {
        backgroundColor: '#E1F1FF',
        borderColor: BLUE,
        borderWidth: 1.5,
    },

    containerIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#DFF0FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 7,
    },

    containerIconActive: {
        backgroundColor: '#CDE7FF',
    },

    containerName: {
        color: DARK_BLUE,
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },

    containerVolume: {
        color: MUTED,
        fontSize: 12,
        marginTop: 4,
    },

    selectedText: {
        color: DARK_BLUE,
    },

    checkIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
    },

    registerButton: {
        backgroundColor: BLUE,
        minHeight: 52,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 16,
        marginBottom: 25,
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 8,
        elevation: 3,
    },

    registerButtonText: {
        color: WHITE,
        fontSize: 16,
        
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
        backgroundColor: LIGHT_BLUE,
        minWidth: 24,
        height: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },

    historyBadgeText: {
        color: DARK_BLUE,
        fontSize: 15,
        fontWeight: '800',
    },

    historyItem: {
        backgroundColor: LIGHT_BLUE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 15,
        padding: 11,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    historyWaterIcon: {
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: '#DFF0FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    historyInfo: {
        flex: 1,
    },

    historyName: {
        color: DARK_BLUE,
        fontSize: 16,
        fontWeight: '700',
    },

    historyTime: {
        color: MUTED,
        fontSize: 13,
        marginTop: 4,
    },

    historyAmount: {
        color: DARK_BLUE,
        fontSize: 14,
        fontWeight: '800',
    },

    emptyHistory: {
        alignItems: 'center',
        paddingVertical: 22,
        backgroundColor: LIGHT_BLUE,
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
