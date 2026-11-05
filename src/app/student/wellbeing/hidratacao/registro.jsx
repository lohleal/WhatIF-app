import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { auth, db } from '../../../../services/firebase/firebaseConfig';

import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
} from 'firebase/firestore';

const BLUE = '#75BDF8';
const DARK_BLUE = '#174675';
const LIGHT_BLUE = '#F0F8FF';
const BORDER = '#D9EAFB';
const MUTED = '#71869D';
const WHITE = '#FFFFFF';

const INITIAL_QUICK_VALUES = [100, 150, 200, 250];

export default function AdicionarRegistroAgua() {
    const router = useRouter();

    const [quantidade, setQuantidade] = useState('200');
    const [atalhos, setAtalhos] = useState(INITIAL_QUICK_VALUES);
    const [atalhosEditaveis, setAtalhosEditaveis] = useState(
        INITIAL_QUICK_VALUES.map(String)
    );
    const [modalAtalhosVisible, setModalAtalhosVisible] = useState(false);
    const [horarioSelecionado, setHorarioSelecionado] = useState(new Date());
    const [mostrarSeletorHorario, setMostrarSeletorHorario] = useState(false);
    const [atalhoSelecionado, setAtalhoSelecionado] = useState(null);

    const [registros, setRegistros] = useState([]);
    const [carregandoRegistros, setCarregandoRegistros] = useState(true);

    const hoje = new Date();

    const hojeKey = [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, '0'),
        String(hoje.getDate()).padStart(2, '0'),
    ].join('-');

    const registrosDeHoje = registros.filter(
        (registro) => registro.dateKey === hojeKey
    );

    const total = registrosDeHoje.reduce(
        (soma, registro) => soma + registro.ml,
        0
    );

    const progresso = Math.min((total / 2000) * 100, 100);

    function ajustarQuantidade(valor) {
        const atual = Number(quantidade) || 0;
        setQuantidade(String(Math.max(0, atual + valor)));
        setAtalhoSelecionado(null);
    }

    function selecionarAtalho(volume) {
        setQuantidade(String(volume));
        setAtalhoSelecionado(volume);
    }

    async function salvarAtalhos() {
        const novosValores = atalhosEditaveis.map((valor) => Number(valor));

        if (
            novosValores.some(
                (valor) => !Number.isFinite(valor) || valor <= 0
            )
        ) {
            Alert.alert(
                'Valores inválidos',
                'Informe um volume maior que zero para todos os atalhos.'
            );
            return;
        }

        const usuario = auth.currentUser;

        if (!usuario) {
            Alert.alert('Atenção', 'Você precisa estar conectado.');
            return;
        }

        try {
            const usuarioRef = doc(db, 'users', usuario.uid);

            await setDoc(
                usuarioRef,
                {
                    quickShortcuts: novosValores,
                },
                { merge: true }
            );

            setAtalhos(novosValores);
            setModalAtalhosVisible(false);

            Alert.alert('Sucesso!', 'Seus atalhos foram salvos.');
        } catch (erro) {
            console.error('Erro ao salvar atalhos:', erro);
            Alert.alert('Erro', 'Não foi possível salvar seus atalhos.');
        }
    }

    async function registrarAgua() {
        const usuario = auth.currentUser;
        const ml = Number(quantidade);

        if (!usuario) {
            Alert.alert('Atenção', 'Você precisa estar conectado para registrar o consumo.');
            return;
        }

        if (!Number.isFinite(ml) || ml <= 0) {
            Alert.alert('Quantidade inválida', 'Informe uma quantidade maior que zero.');
            return;
        }

        try {
            const dataConsumo = horarioSelecionado;

            // Data local no formato AAAA-MM-DD
            const dateKey = [
                dataConsumo.getFullYear(),
                String(dataConsumo.getMonth() + 1).padStart(2, '0'),
                String(dataConsumo.getDate()).padStart(2, '0'),
            ].join('-');

            const registrosRef = collection(
                db,
                'users',
                usuario.uid,
                'waterRecords'
            );

            await addDoc(registrosRef, {
                amountMl: ml,
                consumedAt: Timestamp.fromDate(dataConsumo),
                createdAt: serverTimestamp(),
                dateKey,
                source: atalhoSelecionado !== null ? 'quick' : 'manual',
                quickShortcutMl: atalhoSelecionado,
            });

            setQuantidade('200');
            setAtalhoSelecionado(null);
            setHorarioSelecionado(new Date());

        } catch (erro) {
            console.error('Erro ao registrar consumo:', erro);
            Alert.alert('Erro', 'Não foi possível salvar seu consumo.');
        }
    }

    function atualizarHorario(event, dataEscolhida) {
        setMostrarSeletorHorario(false);

        if (event?.type === 'set' && dataEscolhida) {
            setHorarioSelecionado(dataEscolhida);
        }
    }

    //const progresso = Math.min((total / 2000) * 100, 100);

    useEffect(() => {
        const usuario = auth.currentUser;

        if (!usuario) {
            setCarregandoRegistros(false);
            return;
        }

        // Carregar atalhos personalizados do usuário
        getDoc(doc(db, 'users', usuario.uid))
            .then((documento) => {
                if (documento.exists()) {
                    const atalhosSalvos = documento.data().quickShortcuts;

                    if (
                        Array.isArray(atalhosSalvos) &&
                        atalhosSalvos.length === 4 &&
                        atalhosSalvos.every(
                            (valor) => Number.isFinite(valor) && valor > 0
                        )
                    ) {
                        setAtalhos(atalhosSalvos);
                    }
                }
            })
            .catch((erro) => {
                console.error('Erro ao carregar atalhos:', erro);
            });

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

        const unsubscribe = onSnapshot(
            consulta,
            (snapshot) => {
                const dados = snapshot.docs.map((documento) => {
                    const dado = documento.data();

                    return {
                        id: documento.id,
                        ml: dado.amountMl,
                        horario: dado.consumedAt
                            ?.toDate()
                            .toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            }) ?? '--:--',
                        dateKey: dado.dateKey,
                        source: dado.source,
                        consumedAt: dado.consumedAt,
                    };
                });

                setRegistros(dados);
                setCarregandoRegistros(false);
            },
            (erro) => {
                console.error('Erro ao carregar registros:', erro);
                Alert.alert('Erro', 'Não foi possível carregar seus registros.');
                setCarregandoRegistros(false);
            }
        );

        return unsubscribe;
    }, []);

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
                            <Text style={styles.title}>Registro diário</Text>
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
                    <View style={styles.blueSection}>
                        <Text style={styles.cardEyebrow}>CONSUMO DE HOJE</Text>

                        <Text style={styles.totalNumber}>
                            {total.toLocaleString('pt-BR')}
                            <Text style={styles.totalUnit}> ml</Text>
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
                                    { width: `${progresso}%` },
                                ]}
                            />
                        </View>

                        <View style={styles.progressLabels}>
                            <Text style={styles.progressLabel}>
                                Água registrada
                            </Text>
                            <Text style={styles.progressGoal}>
                                Objetivo: 2.000 ml
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
                                fill="#F8FBFF"
                            />
                        </Svg>
                    </View>

                    {/* REGISTRO RÁPIDO */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeading}>
                            <View style={styles.headingIcon}>
                                <Ionicons
                                    name="flash"
                                    size={20}
                                    color={BLUE}
                                />
                            </View>
                            <View style={styles.headingText}>
                                <Text style={styles.sectionTitle}>
                                    Registro rápido
                                </Text>
                                <Text style={styles.sectionSubtitle}>
                                    Registre com um toque
                                </Text>
                            </View>
                        </View>

                        <View style={styles.quickOptions}>
                            {atalhos.map((volume, index) => {
                                const selecionado = atalhoSelecionado === volume;

                                return (
                                    <Pressable
                                        key={`${index}-${volume}`}
                                        onPress={() => selecionarAtalho(volume)}
                                        style={[
                                            styles.quickCard,
                                            selecionado && styles.quickCardActive,
                                        ]}
                                    >
                                        <Ionicons
                                            name="water-outline"
                                            size={29}
                                            color={BLUE}
                                        />
                                        <Text style={styles.quickVolume}>
                                            {volume} ml
                                        </Text>
                                        {selecionado && (
                                            <View style={styles.quickCheck}>
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={16}
                                                    color={BLUE}
                                                />
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Pressable
                            style={styles.customizeButton}
                            onPress={() => {
                                setAtalhosEditaveis(atalhos.map(String));
                                setModalAtalhosVisible(true);
                            }}
                        >
                            <View style={styles.customizeIcon}>
                                <Ionicons
                                    name="pencil-outline"
                                    size={22}
                                    color={BLUE}
                                />
                            </View>
                            <View style={styles.customizeText}>
                                <Text style={styles.customizeTitle}>
                                    Personalizar acesso rápido
                                </Text>
                                <Text style={styles.customizeSubtitle}>
                                    Edite os volumes exibidos acima.
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={23}
                                color={MUTED}
                            />
                        </Pressable>
                    </View>

                    <View style={styles.sectionDivider} />

                    {/* REGISTRO MANUAL */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeading}>
                            <View style={styles.headingIcon}>
                                <Ionicons
                                    name="add"
                                    size={29}
                                    color={BLUE}
                                />
                            </View>
                            <View style={styles.headingText}>
                                <Text style={styles.sectionTitle}>
                                    Registro manual
                                </Text>
                                <Text style={styles.sectionSubtitle}>
                                    Defina a quantidade e o horário do consumo
                                </Text>
                            </View>
                        </View>

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
                                        setAtalhoSelecionado(null);
                                    }}
                                    keyboardType="numeric"
                                    maxLength={5}
                                    selectTextOnFocus
                                    style={styles.quantityInput}
                                    accessibilityLabel="Quantidade em mililitros"
                                />
                                <Text style={styles.mlLabel}>ml</Text>
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

                        <Pressable
                            style={styles.timeButton}
                            onPress={() => setMostrarSeletorHorario(true)}
                        >
                            <Ionicons
                                name="time-outline"
                                size={23}
                                color={MUTED}
                            />
                            <Text style={styles.timeLabel}>
                                Horário do consumo
                            </Text>
                            <Text style={styles.timeValue}>
                                {horarioSelecionado.toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
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

                    {/* BOTÃO REGISTRAR */}
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
                                    {registrosDeHoje.length}
                                </Text>
                            </View>
                        </View>

                        {registrosDeHoje.length === 0 ? (
                            <View style={styles.emptyHistory}>
                                <MaterialCommunityIcons
                                    name="water-outline"
                                    size={30}
                                    color={MUTED}
                                />
                                <Text style={styles.emptyText}>
                                    Seus registros aparecerão aqui
                                </Text>
                            </View>
                        ) : (
                            registrosDeHoje.map((registro) => (
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

            {/* MODAL PARA PERSONALIZAR OS ATALHOS */}
            <Modal
                visible={modalAtalhosVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalAtalhosVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleArea}>
                                <Text style={styles.modalTitle}>
                                    Personalizar acesso rápido
                                </Text>
                                <Text style={styles.modalDescription}>
                                    Defina os quatro volumes que deseja usar nos atalhos.
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => setModalAtalhosVisible(false)}
                                style={styles.modalClose}
                            >
                                <Ionicons
                                    name="close"
                                    size={23}
                                    color={DARK_BLUE}
                                />
                            </Pressable>
                        </View>

                        {atalhosEditaveis.map((valor, index) => (
                            <View style={styles.editShortcutRow} key={index}>
                                <View style={styles.editShortcutIcon}>
                                    <Ionicons
                                        name="water-outline"
                                        size={22}
                                        color={BLUE}
                                    />
                                </View>
                                <Text style={styles.editShortcutLabel}>
                                    Atalho {index + 1}
                                </Text>
                                <TextInput
                                    value={valor}
                                    onChangeText={(novoValor) => {
                                        setAtalhosEditaveis((atuais) =>
                                            atuais.map((item, i) =>
                                                i === index
                                                    ? novoValor.replace(/[^0-9]/g, '')
                                                    : item
                                            )
                                        );
                                    }}
                                    keyboardType="numeric"
                                    maxLength={5}
                                    style={styles.editShortcutInput}
                                    selectTextOnFocus
                                />
                                <Text style={styles.editShortcutUnit}>ml</Text>
                            </View>
                        ))}

                        <View style={styles.modalActions}>
                            <Pressable
                                style={styles.cancelButton}
                                onPress={() => setModalAtalhosVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Cancelar
                                </Text>
                            </Pressable>
                            <Pressable
                                style={styles.saveButton}
                                onPress={salvarAtalhos}
                            >
                                <Text style={styles.saveButtonText}>
                                    Salvar volumes
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
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
        fontSize: 22,
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
    blueSection: {
        backgroundColor: BLUE,
        marginHorizontal: -22,
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 60,
        marginBottom: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    wave: {
        position: 'absolute',
        bottom: -1,
        left: 0,
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
        marginTop: 5,
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
        marginTop: 3,
        marginBottom: 8,
    },
    sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 17,
    },
    headingIcon: {
        width: 48,
        height: 48,
        borderRadius: 15,
        backgroundColor: '#E1F1FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headingText: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: DARK_BLUE,
        letterSpacing: -0.2,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: MUTED,
        marginTop: 4,
        lineHeight: 19,
    },
    quickOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    quickCard: {
        flex: 1,
        minWidth: 0,
        minHeight: 91,
        backgroundColor: LIGHT_BLUE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        paddingVertical: 12,
        position: 'relative',
    },
    quickCardActive: {
        backgroundColor: '#E1F1FF',
        borderColor: BLUE,
        borderWidth: 1.7,
    },
    quickVolume: {
        color: DARK_BLUE,
        fontSize: 14,
        fontWeight: '800',
    },
    quickCheck: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
    customizeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EDF7FF',
        borderRadius: 17,
        padding: 13,
        marginTop: 15,
        gap: 11,
    },
    customizeIcon: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#DDEFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    customizeText: {
        flex: 1,
    },
    customizeTitle: {
        color: DARK_BLUE,
        fontSize: 14,
        fontWeight: '800',
    },
    customizeSubtitle: {
        color: MUTED,
        fontSize: 12,
        marginTop: 3,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: BORDER,
        marginTop: 20,
        marginBottom: 5,
    },
    quantityCard: {
        width: '86%',
        alignSelf: 'center',
        minHeight: 76,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: LIGHT_BLUE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        marginTop: 5,
    },
    adjustButton: {
        width: 40,
        height: 40,
        borderRadius: 13,
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
        fontSize: 27,
        fontWeight: '800',
        textAlign: 'center',
        minWidth: 75,
        paddingVertical: 0,
    },
    mlLabel: {
        color: MUTED,
        fontSize: 12,
        marginTop: -2,
    },
    timeButton: {
        minHeight: 58,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: WHITE,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        gap: 10,
        marginTop: 15,
    },
    timeLabel: {
        color: DARK_BLUE,
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    timeValue: {
        color: MUTED,
        fontSize: 13,
    },
    registerButton: {
        backgroundColor: BLUE,
        minHeight: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 16,
        marginTop: 20,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(12, 35, 58, 0.42)',
        justifyContent: 'center',
        padding: 22,
    },
    modalCard: {
        backgroundColor: WHITE,
        borderRadius: 22,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 17,
        gap: 10,
    },
    modalTitleArea: {
        flex: 1,
    },
    modalTitle: {
        color: DARK_BLUE,
        fontSize: 19,
        fontWeight: '800',
    },
    modalDescription: {
        color: MUTED,
        fontSize: 13,
        lineHeight: 19,
        marginTop: 5,
    },
    modalClose: {
        padding: 3,
    },
    editShortcutRow: {
        minHeight: 55,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: LIGHT_BLUE,
        borderRadius: 13,
        paddingHorizontal: 10,
        marginBottom: 9,
        gap: 9,
    },
    editShortcutIcon: {
        width: 34,
        height: 34,
        borderRadius: 11,
        backgroundColor: '#DDEFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editShortcutLabel: {
        color: DARK_BLUE,
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    editShortcutInput: {
        minWidth: 65,
        color: DARK_BLUE,
        fontSize: 16,
        fontWeight: '800',
        textAlign: 'right',
        paddingVertical: 5,
    },
    editShortcutUnit: {
        color: MUTED,
        fontSize: 13,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    cancelButton: {
        flex: 1,
        minHeight: 46,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: DARK_BLUE,
        fontSize: 14,
        fontWeight: '700',
    },
    saveButton: {
        flex: 1.3,
        minHeight: 46,
        borderRadius: 13,
        backgroundColor: BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: WHITE,
        fontSize: 14,
        fontWeight: '800',
    },
});
