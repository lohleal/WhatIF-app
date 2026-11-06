
import React, { useState } from 'react';
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
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';

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

const INITIAL_TASKS = [
    {
        id: '1',
        title: 'Estudar matemática',
        description: 'Revisar funções do primeiro e segundo grau e resolver os exercícios da apostila.',
        status: 'todo',
        color: '#FFF1D6',
    },
    {
        id: '2',
        title: 'Organizar minha rotina',
        description: 'Separar os horários de estudo, descanso e atividades da semana.',
        status: 'todo',
        color: '#DCEFF5',
    },
    {
        id: '3',
        title: 'Finalizar trabalho de biologia',
        description: 'Concluir a pesquisa e revisar o conteúdo antes de entregar.',
        status: 'doing',
        color: '#E8E2F7',
    },
    {
        id: '4',
        title: 'Organizar materiais',
        description: 'Separar os arquivos e cadernos das matérias.',
        status: 'done',
        color: '#E3F0DD',
    },
];

export default function Kanban() {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [activeColumn, setActiveColumn] = useState('todo');

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('detail');

    const [selectedTask, setSelectedTask] = useState(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');

    const currentColumn = COLUMNS.find(
        (column) => column.id === activeColumn
    );

    const filteredTasks = tasks.filter(
        (task) => task.status === activeColumn
    );

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

    function saveTask() {
        if (!taskTitle.trim()) {
            return;
        }

        if (selectedTask) {
            setTasks((previous) =>
                previous.map((task) =>
                    task.id === selectedTask.id
                        ? {
                            ...task,
                            title: taskTitle.trim(),
                            description: taskDescription.trim(),
                        }
                        : task
                )
            );
        } else {
            const newTask = {
                id: Date.now().toString(),
                title: taskTitle.trim(),
                description: taskDescription.trim(),
                status: activeColumn,
                color: POST_IT_COLORS[
                    Math.floor(Math.random() * POST_IT_COLORS.length)
                ],
            };

            setTasks((previous) => [...previous, newTask]);
        }

        setModalVisible(false);
    }

    function changeStatus(status) {
        setTasks((previous) =>
            previous.map((task) =>
                task.id === selectedTask.id
                    ? { ...task, status }
                    : task
            )
        );

        setModalVisible(false);
    }

    function deleteTask() {
        setModalMode('confirmDelete');
    }

    function confirmDeleteTask() {
        if (!selectedTask) return;

        setTasks((previous) =>
            previous.filter(
                (task) => task.id !== selectedTask.id
            )
        );

        setModalVisible(false);
        setSelectedTask(null);
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
                </View>

                {/* ABAS */}
                <View style={styles.tabsContainer}>
                    {COLUMNS.map((column) => {
                        const selected = activeColumn === column.id;

                        const count = tasks.filter(
                            (task) => task.status === column.id
                        ).length;

                        return (
                            <TouchableOpacity
                                key={column.id}
                                style={[
                                    styles.tab,
                                    selected && styles.activeTab,
                                ]}
                                onPress={() => setActiveColumn(column.id)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        selected && styles.activeTabText,
                                    ]}
                                >
                                    {column.title}
                                </Text>

                                <View
                                    style={[
                                        styles.countBadge,
                                        selected && styles.activeCountBadge,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.countText,
                                            selected && styles.activeCountText,
                                        ]}
                                    >
                                        {count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* CONTEÚDO */}
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>
                                {currentColumn.title}
                            </Text>

                            <Text style={styles.sectionSubtitle}>
                                {filteredTasks.length === 0
                                    ? 'Nenhuma atividade por aqui'
                                    : `${filteredTasks.length} atividade(s)`}
                            </Text>
                        </View>

                        <Ionicons
                            name="ellipsis-horizontal-circle-outline"
                            size={25}
                            color={COLORS.textSecondary}
                        />
                    </View>

                    {/* POST-ITS */}
                    {filteredTasks.length > 0 ? (
                        <View style={styles.tasksContainer}>
                            {filteredTasks.map((task) => (
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
                                Crie uma atividade para começar a organizar
                                suas tarefas.
                            </Text>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

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
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

                            {/* CONFIRMAÇÃO DE EXCLUSÃO */}
                            {modalMode === 'confirmDelete' ? (
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
                                <>
                                    <Text style={styles.inputLabel}>
                                        Título
                                    </Text>

                                    <TextInput
                                        style={styles.titleInput}
                                        placeholder="Digite o título da atividade"
                                        placeholderTextColor="#9BAFC1"
                                        value={taskTitle}
                                        onChangeText={setTaskTitle}
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
                                    >
                                        <Text style={styles.saveButtonText}>
                                            Salvar atividade
                                        </Text>
                                    </TouchableOpacity>
                                </>

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
    },

    tab: {
        flex: 1,
        minHeight: 43,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 5,
    },

    activeTab: {
        backgroundColor: COLORS.primary,
    },

    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primaryDark,
    },

    activeTabText: {
        color: COLORS.white,
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

    activeCountBadge: {
        backgroundColor: '#FFFFFF',
    },

    countText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },

    activeCountText: {
        color: COLORS.primaryDark,
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
});
