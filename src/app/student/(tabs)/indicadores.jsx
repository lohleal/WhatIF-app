import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
    Alert,
    ImageBackground,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';

import {
    useLocalSearchParams,
    useRouter,
} from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../../../constants/colors.js';
import IndicatorCard from '../../../features/indicators/components/indicatorCard.jsx';
import {
    atualizarIndicador,
    concluirIndicador,
    excluirIndicador,
} from '../../../features/indicators/services/indicatorService.js';
import useIndicatorsViewModel from '../../../features/indicators/viewmodels/use-indicators-view-model.js';
import { auth, db } from '../../../services/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function Indicadores() {

    const router = useRouter();
    const { width, height } =
        useWindowDimensions();

    const { name } =
        useLocalSearchParams();

    const {
        indicators,
        completedCount,
        progress,
    } = useIndicatorsViewModel();

    /*
     * O número de peças NÃO é fixo.
     *
     * Se hoje existirem:
     * 4 indicadores → 4 peças
     * 7 indicadores → 7 peças
     * 12 indicadores → 12 peças
     */

    const columns = 4;

    const horizontalPadding = Math.max(
        10,
        Math.min(20, width * 0.05)
    );

    const puzzleWidth = width - horizontalPadding * 2;

    // O encaixe diminui junto com o quebra-cabeça
    const overlap = Math.min(15, puzzleWidth * 0.085);
    const overlapVertical = Math.min(24, puzzleWidth * 0.14);

    const cardWidth =
        (puzzleWidth + overlap * (columns - 1)) / columns;


    const progressPercentage =
        Math.round(progress * 100);

    const [studentName, setStudentName] = useState('');

    // Estado do modal de detalhes do indicador
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIndicator, setSelectedIndicator] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editTarget, setEditTarget] = useState('');
    const [editUnit, setEditUnit] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

    useEffect(() => {
        async function loadStudentName() {
            const user = auth.currentUser;

            if (!user) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                const profileName = userDoc.exists()
                    ? userDoc.data().name
                    : '';

                setStudentName(
                    profileName || user.displayName || name || 'estudante'
                );
            } catch (error) {
                console.error('Erro ao carregar nome:', error);
                setStudentName(user.displayName || name || 'estudante');
            }
        }

        loadStudentName();
    }, [name]);

    function handleIndicatorPress(indicator) {
        setSelectedIndicator(indicator);
        setEditName(indicator.name || '');
        setEditDescription(indicator.description || '');
        setEditTarget(
            indicator.target !== null && indicator.target !== undefined
                ? String(indicator.target)
                : ''
        );
        setEditUnit(indicator.unit || '');
        setIsEditing(false);
        setModalVisible(true);
    }

    function closeIndicatorModal() {
        setModalVisible(false);
        setDeleteConfirmVisible(false);
        setIsEditing(false);
        setSelectedIndicator(null);
    }

    async function handleCompleteIndicator() {
        if (!selectedIndicator) return;

        try {
            setSaving(true);
            await concluirIndicador(
                selectedIndicator.id,
                selectedIndicator.target
            );
            Alert.alert('Muito bem!', 'Indicador concluído com sucesso!');
            closeIndicatorModal();
        } catch (error) {
            console.error('Erro ao concluir indicador:', error);
            Alert.alert('Erro', 'Não foi possível concluir o indicador.');
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveEdit() {
        if (!selectedIndicator) return;

        if (!editName.trim()) {
            Alert.alert('Atenção', 'Informe o nome do indicador.');
            return;
        }

        if (
            selectedIndicator.type !== 'conclusao' &&
            (!editTarget.trim() || !Number.isFinite(Number(editTarget)) || Number(editTarget) <= 0)
        ) {
            Alert.alert('Atenção', 'Informe uma meta válida.');
            return;
        }

        try {
            setSaving(true);
            await atualizarIndicador(selectedIndicator.id, {
                name: editName,
                description: editDescription,
                type: selectedIndicator.type,
                target: editTarget,
                unit: editUnit,
            });
            Alert.alert('Sucesso', 'Indicador atualizado!');
            setIsEditing(false);
            setModalVisible(false);
            setSelectedIndicator(null);
        } catch (error) {
            console.error('Erro ao editar indicador:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o indicador.');
        } finally {
            setSaving(false);
        }
    }

    function handleDeleteIndicator() {
        if (!selectedIndicator || saving) return;
        setDeleteConfirmVisible(true);
    }

    async function confirmDeleteIndicator() {
        if (!selectedIndicator || saving) return;

        try {
            setSaving(true);
            await excluirIndicador(selectedIndicator.id);
            setDeleteConfirmVisible(false);
            closeIndicatorModal();
        } catch (error) {
            console.error('Erro ao excluir indicador:', error);
            setDeleteConfirmVisible(false);
            // O modal principal continua aberto para não perder o contexto.
        } finally {
            setSaving(false);
        }
    }

    function handleCreateIndicator() {
        router.push(
            '/student/indicators/criar'
        );
    }

    return (
        <ImageBackground
            source={require(
                '../../../../assets/images/indicators-background.png'
            )}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView
                style={styles.safeArea}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.content,
                        {
                            paddingHorizontal:
                                horizontalPadding,
                        },
                    ]}
                    showsVerticalScrollIndicator={
                        false
                    }
                >
                    {/* TOPO */}

                    <View style={styles.topRow}>
                        <View style={styles.header}>
                            <Text style={styles.greeting}>
                                Olá, {studentName || 'estudante'}!
                            </Text>
                        </View>

                        <Pressable
                            style={
                                styles.iconButton
                            }
                        >
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={24}
                                color={
                                    COLORS.primary
                                }
                            />
                        </Pressable>
                    </View>

                    {/* MENSAGEM */}

                    <View
                        style={styles.message}
                    >
                        <MaterialCommunityIcons
                            name="puzzle-outline"
                            size={27}
                            color={
                                COLORS.primary
                            }
                        />

                        <Text
                            style={
                                styles.messageText
                            }
                        >
                            Cada objetivo concluído
                            completa uma parte do
                            seu{' '}
                            <Text
                                style={
                                    styles.highlight
                                }
                            >
                                quebra-cabeça.
                            </Text>
                        </Text>
                    </View>

                    {/* QUEBRA-CABEÇA */}

                    {indicators.length > 0 ? (
                        <View
                            style={
                                styles.puzzleContainer
                            }
                        >
                            {indicators.map(
                                (
                                    indicator,
                                    index
                                ) => (
                                    <IndicatorCard
                                        key={
                                            indicator.id
                                        }
                                        indicator={
                                            indicator
                                        }
                                        width={
                                            cardWidth
                                        }
                                        index={
                                            index
                                        }
                                        total={
                                            indicators.length
                                        }
                                        columns={
                                            columns
                                        }
                                        overlap={
                                            overlap
                                        }
                                        overlapVertical={overlapVertical}
                                        onPress={() =>
                                            handleIndicatorPress(
                                                indicator
                                            )
                                        }
                                    />
                                )
                            )}
                        </View>
                    ) : (
                        <View
                            style={
                                styles.emptyContainer
                            }
                        >
                            <MaterialCommunityIcons
                                name="puzzle-outline"
                                size={48}
                                color="#A6B59B"
                            />

                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                Nenhuma peça para
                                hoje
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Adicione um indicador
                                para começar seu
                                quebra-cabeça.
                            </Text>
                        </View>
                    )}

                    {/* PROGRESSO */}

                    <View
                        style={
                            styles.progressSection
                        }
                    >
                        <View
                            style={
                                styles.progressCard
                            }
                        >
                            <View
                                style={
                                    styles.progressIcon
                                }
                            >
                                <MaterialCommunityIcons
                                    name="puzzle"
                                    size={27}
                                    color={
                                        COLORS.primary
                                    }
                                />
                            </View>

                            <View
                                style={
                                    styles.progressInfo
                                }
                            >
                                <View
                                    style={
                                        styles.progressHeader
                                    }
                                >
                                    <Text
                                        style={
                                            styles.progressTitle
                                        }
                                    >
                                        Progresso de
                                        hoje
                                    </Text>

                                    <Text
                                        style={
                                            styles.progressPercentage
                                        }
                                    >
                                        {
                                            progressPercentage
                                        }
                                        %
                                    </Text>
                                </View>

                                <Text
                                    style={
                                        styles.progressText
                                    }
                                >
                                    {
                                        completedCount
                                    }
                                    /
                                    {
                                        indicators.length
                                    }{' '}
                                    peças completas
                                </Text>

                                <View
                                    style={
                                        styles.progressBackground
                                    }
                                >
                                    <View
                                        style={[
                                            styles.progressBar,
                                            {
                                                width: `${progressPercentage}%`,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* FRASE FINAL */}

                    <Text
                        style={
                            styles.footerMessage
                        }
                    >
                        Pequenas ações diárias
                        constroem uma{' '}
                        <Text
                            style={
                                styles.highlight
                            }
                        >
                            grande transformação.
                        </Text>
                    </Text>
                </ScrollView>

                {/* BOTÃO + */}

                <Pressable
                    style={({ pressed }) => [
                        styles.floatingButton,

                        pressed &&
                        styles.floatingButtonPressed,
                    ]}
                    onPress={
                        handleCreateIndicator
                    }
                >
                    <MaterialCommunityIcons
                        name="plus"
                        size={30}
                        color="#FFFFFF"
                    />
                </Pressable>

                {/* MODAL DE DETALHES DO INDICADOR */}
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={closeIndicatorModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedIndicator && (
                                    <>
                                        <View style={styles.modalHeader}>
                                            <Text style={styles.modalTitle}>
                                                {isEditing ? 'Editar indicador' : 'Detalhes do indicador'}
                                            </Text>
                                            <Pressable onPress={closeIndicatorModal} hitSlop={10}>
                                                <MaterialCommunityIcons name="close" size={25} color={COLORS.text} />
                                            </Pressable>
                                        </View>

                                        {isEditing ? (
                                            <>
                                                <Text style={styles.fieldLabel}>Nome</Text>
                                                <TextInput
                                                    style={styles.modalInput}
                                                    value={editName}
                                                    onChangeText={setEditName}
                                                    placeholder="Nome do indicador"
                                                    placeholderTextColor="#999999"
                                                />

                                                <Text style={styles.fieldLabel}>Descrição</Text>
                                                <TextInput
                                                    style={[styles.modalInput, styles.descriptionInput]}
                                                    value={editDescription}
                                                    onChangeText={setEditDescription}
                                                    placeholder="Descreva seu objetivo"
                                                    placeholderTextColor="#999999"
                                                    multiline
                                                />

                                                {selectedIndicator.type !== 'conclusao' && (
                                                    <>
                                                        <Text style={styles.fieldLabel}>Meta</Text>
                                                        <View style={styles.targetRow}>
                                                            <TextInput
                                                                style={[styles.modalInput, styles.targetInput]}
                                                                value={editTarget}
                                                                onChangeText={setEditTarget}
                                                                keyboardType="numeric"
                                                                placeholder="Ex.: 2"
                                                                placeholderTextColor="#999999"
                                                            />
                                                            <TextInput
                                                                style={[styles.modalInput, styles.unitInput]}
                                                                value={editUnit}
                                                                onChangeText={setEditUnit}
                                                                placeholder="Unidade"
                                                                placeholderTextColor="#999999"
                                                            />
                                                        </View>
                                                    </>
                                                )}

                                                <Pressable
                                                    style={[styles.primaryModalButton, saving && styles.disabledButton]}
                                                    onPress={handleSaveEdit}
                                                    disabled={saving}
                                                >
                                                    <Text style={styles.primaryModalButtonText}>
                                                        {saving ? 'Salvando...' : 'Salvar alterações'}
                                                    </Text>
                                                </Pressable>

                                                <Pressable style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                                                    <Text style={styles.cancelButtonText}>Cancelar edição</Text>
                                                </Pressable>
                                            </>
                                        ) : (
                                            <>
                                                <View style={[styles.indicatorIcon, { backgroundColor: selectedIndicator.backgroundColor || '#EEF5E7' }]}>
                                                    <MaterialCommunityIcons
                                                        name={selectedIndicator.iconName || 'puzzle-outline'}
                                                        size={35}
                                                        color={selectedIndicator.iconColor || COLORS.primary}
                                                    />
                                                </View>

                                                <Text style={styles.detailName}>{selectedIndicator.name || selectedIndicator.title}</Text>
                                                <Text style={styles.detailDescription}>
                                                    {selectedIndicator.description || 'Nenhuma descrição adicionada.'}
                                                </Text>

                                                <View style={styles.detailCard}>
                                                    <Text style={styles.detailLabel}>META DEFINIDA</Text>
                                                    <Text style={styles.detailValue}>
                                                        {selectedIndicator.type === 'conclusao'
                                                            ? 'Concluir atividade'
                                                            : `${selectedIndicator.target ?? 'Não definida'} ${selectedIndicator.unit || ''}`.trim()}
                                                    </Text>
                                                </View>

                                                <View style={styles.detailCard}>
                                                    <Text style={styles.detailLabel}>PROGRESSO ATUAL</Text>
                                                    <Text style={styles.detailValue}>
                                                        {selectedIndicator.type === 'conclusao'
                                                            ? (selectedIndicator.completed ? 'Concluído' : 'Não concluído')
                                                            : `${selectedIndicator.currentValue ?? 0} / ${selectedIndicator.target ?? 0} ${selectedIndicator.unit || ''}`.trim()}
                                                    </Text>
                                                </View>

                                                <View style={styles.detailCard}>
                                                    <Text style={styles.detailLabel}>FREQUÊNCIA</Text>
                                                    <Text style={styles.detailValue}>
                                                        {selectedIndicator.frequency || 'Não definida'}
                                                    </Text>
                                                    {selectedIndicator.selectedDays?.length > 0 && (
                                                        <Text style={styles.detailDescription}>
                                                            {selectedIndicator.selectedDays.join(', ')}
                                                        </Text>
                                                    )}
                                                </View>

                                                {!selectedIndicator.completed && (
                                                    <Pressable
                                                        style={[styles.primaryModalButton, saving && styles.disabledButton]}
                                                        onPress={handleCompleteIndicator}
                                                        disabled={saving}
                                                    >
                                                        <MaterialCommunityIcons name="check-circle-outline" size={21} color="#FFFFFF" />
                                                        <Text style={styles.primaryModalButtonText}>
                                                            {saving ? 'Concluindo...' : 'Marcar como concluído'}
                                                        </Text>
                                                    </Pressable>
                                                )}

                                                <View style={styles.actionRow}>
                                                    <Pressable style={styles.editButton} onPress={() => setIsEditing(true)}>
                                                        <MaterialCommunityIcons name="pencil-outline" size={19} color={COLORS.primary} />
                                                        <Text style={styles.editButtonText}>Editar</Text>
                                                    </Pressable>
                                                    <Pressable style={styles.deleteButton} onPress={handleDeleteIndicator} disabled={saving}>
                                                        <MaterialCommunityIcons name="trash-can-outline" size={19} color="#D9534F" />
                                                        <Text style={styles.deleteButtonText}>Excluir</Text>
                                                    </Pressable>
                                                </View>
                                            </>
                                        )}
                                    </>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* CONFIRMAÇÃO DE EXCLUSÃO - compatível com Web e Android */}
                <Modal
                    visible={deleteConfirmVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setDeleteConfirmVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.deleteConfirmContainer}>
                            <View style={styles.deleteConfirmIcon}>
                                <MaterialCommunityIcons
                                    name="trash-can-outline"
                                    size={30}
                                    color="#D9534F"
                                />
                            </View>

                            <Text style={styles.deleteConfirmTitle}>
                                Excluir indicador?
                            </Text>

                            <Text style={styles.deleteConfirmText}>
                                Tem certeza que deseja excluir
                                {' '}
                                <Text style={styles.deleteConfirmName}>
                                    {selectedIndicator?.name || selectedIndicator?.title || 'este indicador'}
                                </Text>
                                ? Essa ação não poderá ser desfeita.
                            </Text>

                            <View style={styles.deleteConfirmActions}>
                                <Pressable
                                    style={styles.deleteCancelButton}
                                    onPress={() => setDeleteConfirmVisible(false)}
                                    disabled={saving}
                                >
                                    <Text style={styles.deleteCancelText}>
                                        Cancelar
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={[
                                        styles.deleteConfirmButton,
                                        saving && styles.disabledButton,
                                    ]}
                                    onPress={confirmDeleteIndicator}
                                    disabled={saving}
                                >
                                    <Text style={styles.deleteConfirmButtonText}>
                                        {saving ? 'Excluindo...' : 'Sim, excluir'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },

    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    content: {
        paddingTop: 12,

        /*
         * Reserva espaço para a
         * barra inferior absoluta.
         */
        paddingBottom: 125,
    },

    topRow: {
        flexDirection: 'row',

        justifyContent:
            'space-between',

        alignItems: 'flex-start',
    },

    header: {
        flex: 1,
        paddingRight: 12,
    },

    greeting: {
        fontSize: 31,
        fontWeight: '700',

        color: COLORS.text,
    },

    subtitle: {
        marginTop: 7,

        fontSize: 16,
        lineHeight: 22,

        color: '#5E5E5E',
    },

    iconButton: {
        width: 42,
        height: 42,

        borderRadius: 21,

        backgroundColor:
            '#FFFFFFC9',

        alignItems: 'center',
        justifyContent: 'center',
    },

    message: {
        marginTop: 24,
        marginBottom: 22,

        flexDirection: 'row',
        alignItems: 'center',

        gap: 11,

        paddingHorizontal: 5,
    },

    messageText: {
        flex: 1,

        fontSize: 16,
        lineHeight: 22,

        fontWeight: '600',

        color: COLORS.text,
    },

    highlight: {
        color: COLORS.primary,
        fontWeight: '700',
    },

    puzzleContainer: {
        width: '100%',

        flexDirection: 'row',
        flexWrap: 'wrap',

        alignSelf: 'center',

        /*
         * Um pouco de respiro
         * ao redor do quebra-cabeça.
         */
        paddingVertical: 4,
    },

    emptyContainer: {
        minHeight: 240,

        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 30,
    },

    emptyTitle: {
        marginTop: 12,

        fontSize: 18,
        fontWeight: '700',

        color: COLORS.text,
    },

    emptyText: {
        marginTop: 6,

        fontSize: 14,
        lineHeight: 20,

        textAlign: 'center',

        color: '#777777',
    },

    /*
     * Essa View separa fisicamente
     * o progresso do quebra-cabeça.
     */
    progressSection: {
        width: '100%',

        marginTop: 34,

        paddingTop: 4,
    },

    progressCard: {
        minHeight: 92,

        borderRadius: 22,

        backgroundColor:
            '#FFFFFFE8',

        paddingHorizontal: 17,
        paddingVertical: 15,

        flexDirection: 'row',
        alignItems: 'center',

        shadowColor: '#000',

        shadowOffset: {
            width: 0,
            height: 2,
        },

        shadowOpacity: 0.06,

        shadowRadius: 4,

        elevation: 2,
    },

    progressIcon: {
        width: 48,
        height: 48,

        borderRadius: 24,

        backgroundColor:
            '#EEF5E7',

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 13,
    },

    progressInfo: {
        flex: 1,
    },

    progressHeader: {
        flexDirection: 'row',

        justifyContent:
            'space-between',

        alignItems: 'center',
    },

    progressTitle: {
        fontSize: 15,
        fontWeight: '700',

        color: COLORS.text,
    },

    progressPercentage: {
        fontSize: 16,
        fontWeight: '700',

        color: COLORS.primary,
    },

    progressText: {
        marginTop: 4,
        marginBottom: 8,

        fontSize: 13,

        color: '#666666',
    },

    progressBackground: {
        width: '100%',
        height: 8,

        borderRadius: 8,

        backgroundColor:
            '#E7E7E7',

        overflow: 'hidden',
    },

    progressBar: {
        height: '100%',

        borderRadius: 8,

        backgroundColor:
            COLORS.primary,
    },

    footerMessage: {
        marginTop: 22,

        paddingHorizontal: 18,

        textAlign: 'center',

        fontSize: 14,
        lineHeight: 20,

        color: COLORS.text,
    },

    floatingButton: {
        position: 'absolute',

        right: 21,

        /*
         * Sua TabBar possui 88px.
         * Então o botão fica acima dela.
         */
        bottom: 101,

        width: 58,
        height: 58,

        borderRadius: 29,

        backgroundColor:
            COLORS.primary,

        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: '#000',

        shadowOffset: {
            width: 0,
            height: 4,
        },

        shadowOpacity: 0.16,

        shadowRadius: 6,

        elevation: 6,
    },

    floatingButtonPressed: {
        opacity: 0.82,

        transform: [
            {
                scale: 0.95,
            },
        ],
    },


    // Modal de detalhes e edição dos indicadores
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    modalContainer: {
        width: '100%',
        maxWidth: 430,
        maxHeight: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 22,
    },

    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 22,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },

    indicatorIcon: {
        width: 70,
        height: 70,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 15,
    },

    detailName: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
    },

    detailDescription: {
        fontSize: 14,
        color: '#777777',
        textAlign: 'center',
        lineHeight: 21,
        marginTop: 7,
        marginBottom: 18,
    },

    detailCard: {
        backgroundColor: '#F7F9F6',
        borderRadius: 14,
        padding: 15,
        marginBottom: 10,
    },

    detailLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#858585',
        marginBottom: 6,
        letterSpacing: 0.5,
    },

    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },

    primaryModalButton: {
        minHeight: 50,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        paddingHorizontal: 12,
    },

    primaryModalButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    disabledButton: {
        opacity: 0.6,
    },

    deleteConfirmContainer: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 24,
        alignItems: 'center',
    },

    deleteConfirmIcon: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: '#FCEDEC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },

    deleteConfirmTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
    },

    deleteConfirmText: {
        marginTop: 10,
        marginBottom: 22,
        fontSize: 14,
        lineHeight: 21,
        color: '#6F6F6F',
        textAlign: 'center',
    },

    deleteConfirmName: {
        fontWeight: '700',
        color: COLORS.text,
    },

    deleteConfirmActions: {
        width: '100%',
        flexDirection: 'row',
        gap: 10,
    },

    deleteCancelButton: {
        flex: 1,
        minHeight: 46,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        alignItems: 'center',
        justifyContent: 'center',
    },

    deleteCancelText: {
        color: '#666666',
        fontWeight: '600',
    },

    deleteConfirmButton: {
        flex: 1,
        minHeight: 46,
        borderRadius: 12,
        backgroundColor: '#D9534F',
        alignItems: 'center',
        justifyContent: 'center',
    },

    deleteConfirmButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },

    editButton: {
        flex: 1,
        minHeight: 46,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 13,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },

    editButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
    },

    deleteButton: {
        flex: 1,
        minHeight: 46,
        borderWidth: 1,
        borderColor: '#E8B7B5',
        borderRadius: 13,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },

    deleteButtonText: {
        color: '#D9534F',
        fontWeight: '600',
    },

    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 7,
        marginTop: 12,
    },

    modalInput: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: '#E3E8E1',
        borderRadius: 12,
        paddingHorizontal: 13,
        fontSize: 15,
        color: COLORS.text,
        backgroundColor: '#FFFFFF',
    },

    descriptionInput: {
        minHeight: 85,
        paddingTop: 12,
        textAlignVertical: 'top',
    },

    targetRow: {
        flexDirection: 'row',
        gap: 10,
    },

    targetInput: {
        flex: 1,
    },

    unitInput: {
        flex: 1,
    },

    cancelButton: {
        alignItems: 'center',
        padding: 13,
        marginTop: 5,
    },

    cancelButtonText: {
        color: '#777777',
        fontWeight: '600',
    },

});
