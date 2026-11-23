import { db } from '../../../services/firebase/firebaseConfig';
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Animated,
    PanResponder,
    Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { useAuth } from '../../../features/auth/context/AuthContext';
import {
    ouvirTarefas,
    criarTarefa,
    atualizarTarefa,
    excluirTarefa,
} from '../../../features/kanban/services/kanbanService';

const POST_IT_COLORS = [
    '#FFF1D6',
    '#DCEFF5',
    '#E8E2F7',
    '#FCE4E4',
    '#E3F0DD',
];

const COLUMNS = [
    { id: 'todo', title: 'A fazer' },
    { id: 'doing', title: 'Fazendo' },
    { id: 'done', title: 'Feito' },
];

export default function Kanban() {
    const { usuario, carregando: carregandoAuth } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [archivedTasks, setArchivedTasks] = useState([]);
    const [carregandoTarefas, setCarregandoTarefas] = useState(true);

    // Escuta em tempo real apenas as tarefas do estudante autenticado.
    useEffect(() => {
        if (carregandoAuth) return;

        if (!usuario?.uid) {
            setTasks([]);
            setArchivedTasks([]);
            setCarregandoTarefas(false);
            return;
        }

        setCarregandoTarefas(true);

        console.log('[KANBAN] UID recebido:', usuario.uid);
        console.log('[KANBAN] UID esperado:', 'v2yjFfwFK1adw6MWyGeAx3DdUSe2');
        console.log('[KANBAN] Projeto Firebase:', db.app.options.projectId);

        const cancelar = ouvirTarefas(
            usuario.uid,
            (tarefas) => {
                setTasks(tarefas.filter((task) => task.status !== 'archived'));
                setArchivedTasks(tarefas.filter((task) => task.status === 'archived'));
                setCarregandoTarefas(false);
            },
            (error) => {
                console.error('[Kanban] Erro ao carregar tarefas:', error);
                Alert.alert('Erro', 'Não foi possível carregar suas atividades.');
                setCarregandoTarefas(false);
            }
        );

        return cancelar;
    }, [usuario?.uid, carregandoAuth]);

    // Arquiva tarefas concluídas após 7 dias. A verificação ocorre ao abrir
    // o quadro e enquanto a tela estiver aberta.
    useEffect(() => {
        if (!usuario?.uid || carregandoTarefas) return;

        const arquivarTarefasVencidas = async () => {
            const agora = Date.now();
            const vencidas = tasks.filter(
                (task) =>
                    task.status === 'done' &&
                    task.completedAt &&
                    agora - task.completedAt >= 7 * 24 * 60 * 60 * 1000
            );

            for (const task of vencidas) {
                try {
                    await atualizarTarefa(usuario.uid, task.id, {
                        status: 'archived',
                        archivedAt: agora,
                    });
                } catch (error) {
                    console.error('[Kanban] Erro ao arquivar tarefa:', error);
                }
            }
        };

        arquivarTarefasVencidas();
        const interval = setInterval(arquivarTarefasVencidas, 60 * 1000);
        return () => clearInterval(interval);
    }, [tasks, usuario?.uid, carregandoTarefas]);

    const [activeColumn, setActiveColumn] = useState('todo');
    const [boardWidth, setBoardWidth] = useState(0);
    const [tabsWidth, setTabsWidth] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const currentPage = useRef(0);
    const boardWidthRef = useRef(0);
    const pageTranslateX = scrollX.interpolate({
        inputRange: [0, boardWidth || 1, (boardWidth || 1) * 2],
        outputRange: [0, -(boardWidth || 1), -2 * (boardWidth || 1)],
        extrapolate: 'clamp',
    });

    const tabWidth = Math.max((tabsWidth - 8) / COLUMNS.length, 0);
    const indicatorTranslateX = scrollX.interpolate({
        inputRange: [0, boardWidth || 1, (boardWidth || 1) * 2],
        outputRange: [0, tabWidth, tabWidth * 2],
        extrapolate: 'clamp',
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('detail');

    const [selectedTask, setSelectedTask] = useState(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');

    function goToColumn(index) {
        if (!boardWidth) return;
        const safeIndex = Math.max(0, Math.min(index, COLUMNS.length - 1));
        currentPage.current = safeIndex;
        setActiveColumn(COLUMNS[safeIndex].id);
        Animated.timing(scrollX, {
            toValue: safeIndex * boardWidth,
            duration: 320,
            useNativeDriver: false,
        }).start();
    }

    const pagerResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) =>
                Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
            onPanResponderRelease: (_, gesture) => {
                if (Math.abs(gesture.dx) < 35) return;
                const nextPage = gesture.dx < 0
                    ? Math.min(currentPage.current + 1, COLUMNS.length - 1)
                    : Math.max(currentPage.current - 1, 0);
                const width = boardWidthRef.current;
                if (!width) return;
                currentPage.current = nextPage;
                setActiveColumn(COLUMNS[nextPage].id);
                Animated.timing(scrollX, {
                    toValue: nextPage * width,
                    duration: 320,
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    function openCreateModal() {
        setSelectedTask(null);
        setTaskTitle('');
        setTaskDescription('');
        setModalMode('form');
        setModalVisible(true);
    }

    function openTask(task) {
        setSelectedTask(task);
        setModalMode('detail');
        setModalVisible(true);
    }

    function openEditModal() {
        setTaskTitle(selectedTask.title);
        setTaskDescription(selectedTask.description);
        setModalMode('form');
    }

    async function saveTask() {
        if (!taskTitle.trim()) {
            Alert.alert('Atenção', 'Informe o título da atividade.');
            return;
        }

        if (!usuario?.uid) {
            Alert.alert('Atenção', 'Faça login novamente para salvar suas atividades.');
            return;
        }

        try {
            if (selectedTask) {
                await atualizarTarefa(usuario.uid, selectedTask.id, {
                    title: taskTitle.trim(),
                    description: taskDescription.trim(),
                });
            } else {
                const agora = Date.now();
                await criarTarefa(usuario.uid, {
                    title: taskTitle.trim(),
                    description: taskDescription.trim(),
                    status: activeColumn,
                    color: POST_IT_COLORS[
                        Math.floor(Math.random() * POST_IT_COLORS.length)
                    ],
                    createdAt: agora,
                    completedAt: activeColumn === 'done' ? agora : null,
                    archivedAt: null,
                });
            }

            setModalVisible(false);
        } catch (error) {
            console.error('[Kanban] Erro ao salvar tarefa:', error);
            Alert.alert('Erro', 'Não foi possível salvar a atividade. Tente novamente.');
        }
    }

    async function changeStatus(status) {
        if (!selectedTask || !usuario?.uid) return;

        const completedAt = status === 'done' ? Date.now() : null;

        try {
            await atualizarTarefa(usuario.uid, selectedTask.id, {
                status,
                completedAt,
                archivedAt: null,
            });

            if (status === 'done') {
                setModalMode('congratulations');
                setModalVisible(true);
            } else {
                setModalVisible(false);
            }
        } catch (error) {
            console.error('[Kanban] Erro ao mover tarefa:', error);
            Alert.alert('Erro', 'Não foi possível mover a atividade.');
        }
    }

    async function restoreArchivedTask(task) {
        if (!usuario?.uid) return;

        try {
            await atualizarTarefa(usuario.uid, task.id, {
                status: 'done',
                completedAt: Date.now(),
                archivedAt: null,
            });
            setModalVisible(false);
        } catch (error) {
            console.error('[Kanban] Erro ao restaurar tarefa:', error);
            Alert.alert('Erro', 'Não foi possível restaurar a atividade.');
        }
    }

    async function deleteArchivedTask(taskId) {
        if (!usuario?.uid) return;

        try {
            await excluirTarefa(usuario.uid, taskId);
        } catch (error) {
            console.error('[Kanban] Erro ao excluir tarefa arquivada:', error);
            Alert.alert('Erro', 'Não foi possível excluir a atividade do histórico.');
        }
    }

    function deleteTask() {
        setModalMode('confirmDelete');
    }

    async function confirmDeleteTask() {
        if (!selectedTask || !usuario?.uid) return;

        try {
            await excluirTarefa(usuario.uid, selectedTask.id);
            setModalVisible(false);
            setSelectedTask(null);
        } catch (error) {
            console.error('[Kanban] Erro ao excluir tarefa:', error);
            Alert.alert('Erro', 'Não foi possível excluir a atividade.');
        }
    }

    function closeModal() {
        setModalVisible(false);
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* CABEÇALHO */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Ionicons
                            name="clipboard-outline"
                            size={23}
                            color={COLORS.primaryDark}
                        />
                    </View>

                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>
                            Meu quadro
                        </Text>

                        <Text style={styles.headerSubtitle}>
                            Organize suas atividades
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => {
                            setModalMode('history');
                            setModalVisible(true);
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="archive-outline" size={21} color={COLORS.primaryDark} />
                        <Text style={styles.historyButtonText}>Histórico</Text>
                    </TouchableOpacity>
                </View>

                {/* ABAS COM INDICADOR ANIMADO */}
                <View
                    style={styles.tabsContainer}
                    onLayout={(event) => setTabsWidth(event.nativeEvent.layout.width)}
                >
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.animatedTabIndicator,
                            {
                                width: tabWidth,
                                transform: [{ translateX: indicatorTranslateX }],
                            },
                        ]}
                    />

                    {COLUMNS.map((column, index) => {
                        const count = tasks.filter(
                            (task) => task.status === column.id
                        ).length;

                        const color = scrollX.interpolate({
                            inputRange: [0, boardWidth || 1, (boardWidth || 1) * 2],
                            outputRange: index === 0
                                ? ['#FFFFFF', '#237438', '#237438']
                                : index === 1
                                    ? ['#237438', '#FFFFFF', '#237438']
                                    : ['#237438', '#237438', '#FFFFFF'],
                            extrapolate: 'clamp',
                        });

                        return (
                            <TouchableOpacity
                                key={column.id}
                                style={styles.tab}
                                onPress={() => goToColumn(index)}
                                activeOpacity={0.85}
                            >
                                <Animated.Text
                                    style={[styles.tabText, { color }]}
                                >
                                    {column.title}
                                </Animated.Text>

                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>
                                        {count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* QUADRO COM TRANSIÇÃO HORIZONTAL ANIMADA */}
                <View
                    style={styles.pagesViewport}
                    onLayout={(event) => {
                        const width = event.nativeEvent.layout.width;
                        boardWidthRef.current = width;
                        setBoardWidth(width);
                    }}
                    {...pagerResponder.panHandlers}
                >
                    {carregandoAuth || carregandoTarefas ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Carregando suas atividades...</Text>
                        </View>
                    ) : boardWidth > 0 && (
                        <Animated.View
                            style={[
                                styles.pagesTrack,
                                {
                                    width: boardWidth * COLUMNS.length,
                                    transform: [{ translateX: pageTranslateX }],
                                },
                            ]}
                        >
                            {COLUMNS.map((column) => {
                                const columnTasks = tasks.filter(
                                    (task) => task.status === column.id
                                );

                                return (
                                    <View
                                        key={column.id}
                                        style={[styles.page, { width: boardWidth }]}
                                    >
                                        <ScrollView
                                            style={styles.scroll}
                                            contentContainerStyle={styles.scrollContent}
                                            showsVerticalScrollIndicator={false}
                                            nestedScrollEnabled
                                        >
                                            <View style={styles.sectionHeader}>
                                                <View>
                                                    <Text style={styles.sectionTitle}>
                                                        {column.title}
                                                    </Text>
                                                    <Text style={styles.sectionSubtitle}>
                                                        {columnTasks.length === 0
                                                            ? 'Nenhuma atividade por aqui'
                                                            : `${columnTasks.length} atividade(s)`}
                                                    </Text>
                                                </View>
                                            </View>

                                            {columnTasks.length > 0 ? (
                                                <View style={styles.tasksContainer}>
                                                    {columnTasks.map((task) => (
                                                        <TouchableOpacity
                                                            key={task.id}
                                                            style={[
                                                                styles.postIt,
                                                                { backgroundColor: task.color },
                                                            ]}
                                                            onPress={() => openTask(task)}
                                                            activeOpacity={0.85}
                                                        >
                                                            <View style={styles.postItHeader}>
                                                                <View style={styles.postItIcon}>
                                                                    <Ionicons
                                                                        name="document-text-outline"
                                                                        size={18}
                                                                        color={COLORS.primaryDark}
                                                                    />
                                                                </View>
                                                                <Ionicons
                                                                    name="ellipsis-horizontal"
                                                                    size={21}
                                                                    color={COLORS.text}
                                                                />
                                                            </View>

                                                            <Text style={styles.postItTitle}>
                                                                {task.title}
                                                            </Text>

                                                            {!!task.description && (
                                                                <Text style={styles.postItDescription}>
                                                                    {task.description}
                                                                </Text>
                                                            )}
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            ) : (
                                                <View style={styles.emptyContainer}>
                                                    <View style={styles.emptyIcon}>
                                                        <Ionicons
                                                            name="document-text-outline"
                                                            size={34}
                                                            color={COLORS.primary}
                                                        />
                                                    </View>
                                                    <Text style={styles.emptyTitle}>
                                                        Seu quadro está vazio!
                                                    </Text>
                                                    <Text style={styles.emptyText}>
                                                        Crie uma atividade para começar a organizar suas tarefas.
                                                    </Text>
                                                </View>
                                            )}

                                            <View style={{ height: 100 }} />
                                        </ScrollView>
                                    </View>
                                );
                            })}
                        </Animated.View>
                    )}
                </View>

                {/* BOTÃO + FIXO NO CANTO INFERIOR DIREITO */}
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={openCreateModal}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="add"
                        size={34}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>

                {/* MODAL DE ATIVIDADE */}
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={closeModal}
                >
                    <KeyboardAvoidingView
                        style={styles.modalOverlay}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View style={styles.modalContent}>

                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {modalMode === 'confirmDelete'
                                        ? 'Excluir atividade'
                                        : modalMode === 'form'
                                            ? selectedTask
                                                ? 'Editar atividade'
                                                : 'Nova atividade'
                                            : 'Detalhes da atividade'}
                                </Text>

                                <TouchableOpacity onPress={closeModal}>
                                    <Ionicons
                                        name="close-circle"
                                        size={27}
                                        color={COLORS.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* HISTÓRICO DE ATIVIDADES */}
                            {modalMode === 'history' ? (
                                <View>
                                    <Text style={styles.historyIntro}>
                                        Aqui ficam suas atividades concluídas e arquivadas.
                                    </Text>

                                    <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                                        {archivedTasks.length === 0 ? (
                                            <View style={styles.historyEmpty}>
                                                <Ionicons name="archive-outline" size={36} color={COLORS.primary} />
                                                <Text style={styles.emptyTitle}>Seu histórico está vazio</Text>
                                                <Text style={styles.emptyText}>
                                                    As atividades concluídas ficarão disponíveis aqui depois de 7 dias.
                                                </Text>
                                            </View>
                                        ) : (
                                            archivedTasks.slice().sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0)).map((task) => (
                                                <View key={task.id} style={styles.historyItem}>
                                                    <View style={[styles.historyTaskIcon, { backgroundColor: task.color || '#E3F0DD' }]}>
                                                        <Ionicons name="checkmark" size={20} color={COLORS.primaryDark} />
                                                    </View>
                                                    <View style={styles.historyTaskInfo}>
                                                        <Text style={styles.historyTaskTitle}>{task.title}</Text>
                                                        <Text style={styles.historyTaskDate}>
                                                            Concluída em {task.completedAt ? new Date(task.completedAt).toLocaleDateString('pt-BR') : 'data não informada'}
                                                        </Text>
                                                    </View>
                                                    <TouchableOpacity onPress={() => restoreArchivedTask(task)} style={styles.historyAction}>
                                                        <Ionicons name="refresh-outline" size={20} color={COLORS.primaryDark} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => deleteArchivedTask(task.id)} style={styles.historyAction}>
                                                        <Ionicons name="trash-outline" size={19} color="#D65C65" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))
                                        )}
                                    </ScrollView>
                                </View>
                            ) : modalMode === 'congratulations' ? (
                                <View style={styles.congratulationsContainer}>
                                    <View style={styles.congratulationsIcon}>
                                        <Ionicons name="trophy" size={38} color="#237438" />
                                    </View>
                                    <Text style={styles.congratulationsTitle}>Atividade concluída!</Text>
                                    <Text style={styles.congratulationsText}>
                                        Parabéns por mais uma conquista! Sua atividade ficará disponível na coluna Feito por 7 dias e depois será arquivada automaticamente.
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.congratulationsButton}
                                        onPress={closeModal}
                                    >
                                        <Text style={styles.congratulationsButtonText}>Continuar</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : modalMode === 'confirmDelete' ? (
                                <View>
                                    <Text style={styles.confirmTitle}>
                                        Tem certeza?
                                    </Text>

                                    <Text style={styles.confirmDescription}>
                                        Deseja realmente excluir
                                        "{selectedTask?.title}"?
                                        Essa ação não poderá ser desfeita.
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.confirmDeleteButton}
                                        onPress={confirmDeleteTask}
                                    >
                                        <Text style={styles.confirmDeleteText}>
                                            Sim, excluir
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setModalMode('detail')}
                                    >
                                        <Text style={styles.cancelButtonText}>
                                            Cancelar
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                            ) : modalMode === 'form' ? (
                                <ScrollView
                                    style={styles.modalFormScroll}
                                    contentContainerStyle={styles.modalFormContent}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                    nestedScrollEnabled
                                >
                                    <Text style={styles.inputLabel}>
                                        Título
                                    </Text>

                                    <TextInput
                                        style={styles.titleInput}
                                        placeholder="Digite o título da atividade"
                                        placeholderTextColor="#9BAFC1"
                                        value={taskTitle}
                                        onChangeText={setTaskTitle}
                                        returnKeyType="next"
                                    />

                                    <Text style={styles.inputLabel}>
                                        Descrição
                                    </Text>

                                    <TextInput
                                        style={styles.descriptionInput}
                                        placeholder="Escreva os detalhes da sua atividade..."
                                        placeholderTextColor="#9BAFC1"
                                        value={taskDescription}
                                        onChangeText={setTaskDescription}
                                        multiline
                                        textAlignVertical="top"
                                    />

                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={saveTask}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={styles.saveButtonText}>
                                            Salvar atividade
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>

                            ) : (
                                <>
                                    <View
                                        style={[
                                            styles.detailPostIt,
                                            {
                                                backgroundColor:
                                                    selectedTask?.color,
                                            },
                                        ]}
                                    >
                                        <Text style={styles.detailTitle}>
                                            {selectedTask?.title}
                                        </Text>

                                        <Text style={styles.detailDescription}>
                                            {selectedTask?.description ||
                                                'Nenhuma descrição adicionada.'}
                                        </Text>
                                    </View>

                                    <Text style={styles.optionsTitle}>
                                        O que deseja fazer?
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.optionButton}
                                        onPress={openEditModal}
                                    >
                                        <Ionicons
                                            name="create-outline"
                                            size={21}
                                            color={COLORS.primaryDark}
                                        />

                                        <Text style={styles.optionText}>
                                            Editar atividade
                                        </Text>
                                    </TouchableOpacity>

                                    {COLUMNS.filter(
                                        (column) =>
                                            column.id !== selectedTask?.status
                                    ).map((column) => (
                                        <TouchableOpacity
                                            key={column.id}
                                            style={styles.optionButton}
                                            onPress={() =>
                                                changeStatus(column.id)
                                            }
                                        >
                                            <Ionicons
                                                name={
                                                    column.id === 'doing'
                                                        ? 'play-circle-outline'
                                                        : column.id === 'done'
                                                            ? 'checkmark-circle-outline'
                                                            : 'refresh-circle-outline'
                                                }
                                                size={21}
                                                color={COLORS.primaryDark}
                                            />

                                            <Text style={styles.optionText}>
                                                Mover para {column.title}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}

                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={deleteTask}
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={20}
                                            color="#D65C65"
                                        />

                                        <Text style={styles.deleteButtonText}>
                                            Excluir atividade
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    container: {
        flex: 1,
        position: 'relative',
        paddingHorizontal: 22,
        paddingTop: 50,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        gap: 12,
    },

    headerIcon: {
        width: 46,
        height: 46,
        borderRadius: 15,
        backgroundColor: '#E5F3E8',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D2E8D7',
    },

    headerText: {
        flex: 1,
    },

    historyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 9,
        paddingHorizontal: 11,
        borderRadius: 13,
        backgroundColor: '#E5F3E8',
    },
    historyButtonText: {
        color: COLORS.primaryDark,
        fontSize: 12,
        fontWeight: '700',
    },
    historyIntro: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 14,
    },
    historyList: {
        maxHeight: 420,
    },
    historyEmpty: {
        alignItems: 'center',
        paddingVertical: 35,
        paddingHorizontal: 15,
        gap: 10,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF3F8',
        gap: 9,
    },
    historyTaskIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyTaskInfo: {
        flex: 1,
    },
    historyTaskTitle: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: '700',
    },
    historyTaskDate: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: 4,
    },
    historyAction: {
        padding: 7,
    },
    congratulationsContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    congratulationsIcon: {
        width: 76,
        height: 76,
        borderRadius: 25,
        backgroundColor: '#E3F0DD',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    congratulationsTitle: {
        color: COLORS.primaryDark,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 10,
        textAlign: 'center',
    },
    congratulationsText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 8,
    },

    headerTitle: {
        fontSize: 23,
        fontWeight: '800',
        color: COLORS.primaryDark,
    },

    headerSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },

    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F6F1',
        borderRadius: 18,
        padding: 4,
        borderWidth: 1,
        borderColor: '#DCEADF',
        marginBottom: 25,
        position: 'relative',
        overflow: 'hidden',
    },

    animatedTabIndicator: {
        position: 'absolute',
        left: 4,
        top: 4,
        bottom: 4,
        borderRadius: 14,
        backgroundColor: '#237438',
    },

    tab: {
        flex: 1,
        minHeight: 43,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 5,
        zIndex: 1,
    },

    tabText: {
        fontSize: 12,
        fontWeight: '700',
    },

    countBadge: {
        backgroundColor: '#DCEADF',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },

    countText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },

    pagesViewport: {
        flex: 1,
        overflow: 'hidden',
    },

    pagesTrack: {
        flex: 1,
        flexDirection: 'row',
    },

    page: {
        flex: 1,
    },

    scroll: {
        flex: 1,
        zIndex: 0,
    },

    scrollContent: {
        paddingBottom: 20,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 17,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primaryDark,
    },

    sectionSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 3,
    },

    tasksContainer: {
        gap: 13,
    },

    postIt: {
        width: '100%',
        minHeight: 115,
        borderRadius: 18,
        padding: 17,
        borderWidth: 1,
        borderColor: 'rgba(36,77,118,0.07)',
    },

    postItHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    postItIcon: {
        width: 32,
        height: 32,
        borderRadius: 11,
        backgroundColor: 'rgba(255,255,255,0.75)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    postItTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 6,
    },

    postItDescription: {
        fontSize: 13,
        color: '#526F8C',
        lineHeight: 20,
    },

    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 45,
        paddingHorizontal: 25,
        backgroundColor: '#F0F6F1',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#DCEADF',
    },

    emptyIcon: {
        width: 65,
        height: 65,
        borderRadius: 22,
        backgroundColor: '#E0F0E3',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },

    emptyTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primaryDark,
        marginBottom: 7,
    },

    emptyText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },

   floatingButton: {
    position: 'absolute',
    bottom: 110,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2F8F46',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 9999,
},

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(20,45,30,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    modalContent: {
        width: '100%',
        maxWidth: 450,
        maxHeight: '85%',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 22,
    },

    modalFormScroll: {
        flexShrink: 1,
    },

    modalFormContent: {
        paddingBottom: 4,
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 22,
    },

    modalTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: COLORS.primaryDark,
    },

    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primaryDark,
        marginBottom: 8,
        marginTop: 10,
    },

    titleInput: {
        backgroundColor: '#F3F8F3',
        borderWidth: 1,
        borderColor: '#DCEADF',
        borderRadius: 13,
        paddingHorizontal: 15,
        minHeight: 50,
        fontSize: 14,
        color: COLORS.text,
    },

    descriptionInput: {
        backgroundColor: '#F3F8F3',
        borderWidth: 1,
        borderColor: '#DCEADF',
        borderRadius: 13,
        padding: 15,
        minHeight: 130,
        maxHeight: 230,
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 21,
    },

    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 22,
    },

    saveButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.white,
    },

    detailPostIt: {
        padding: 18,
        borderRadius: 16,
        marginBottom: 22,
    },

    detailTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 10,
    },

    detailDescription: {
        fontSize: 14,
        lineHeight: 22,
        color: '#526F8C',
    },

    optionsTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primaryDark,
        marginBottom: 10,
    },

    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 49,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF3F8',
    },

    optionText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },

    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 49,
        marginTop: 8,
    },

    deleteButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#D65C65',
    },

    confirmTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: COLORS.primaryDark,
        marginBottom: 12,
    },

    confirmDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 21,
        marginBottom: 22,
    },

    confirmDeleteButton: {
        backgroundColor: '#D65C65',
        borderRadius: 13,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },

    confirmDeleteText: {
        color: '#FFFFFF',
        fontWeight: '800',
    },

    cancelButton: {
        minHeight: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },

    cancelButtonText: {
        color: COLORS.primaryDark,
        fontWeight: '700',
    },
    congratulationsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    width: '100%',
    maxWidth: 220,
    minHeight: 46,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
},

congratulationsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
},
    
});
