
import { useEffect, useState } from 'react';

import {
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import useProfileViewModel from '../../../features/profile/viewmodels/useProfileViewModel';

const VERDE = '#43503E';
const VERDE_CLARO = '#7BA05F';

export default function EditarPerfil() {
    const router = useRouter();

    const {
        perfil,
        loading,
        salvando,
        erro,
        salvarPerfil,
    } = useProfileViewModel();

    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');

    useEffect(() => {
        if (perfil) {
            setNome(perfil.nome || '');
            setSobrenome(perfil.sobrenome || '');
            setTelefone(perfil.telefone || '');
            setDataNascimento(perfil.dataNascimento || '');
        }
    }, [perfil]);

    function formatarTelefone(valor) {
        const numeros = valor.replace(/\D/g, '').slice(0, 11);

        if (numeros.length <= 2) {
            return numeros;
        }

        if (numeros.length <= 7) {
            return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
        }

        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }

    function validarData(data) {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
            return false;
        }

        const [dia, mes, ano] = data.split('/').map(Number);
        const dataTeste = new Date(ano, mes - 1, dia);

        return (
            dataTeste.getFullYear() === ano &&
            dataTeste.getMonth() === mes - 1 &&
            dataTeste.getDate() === dia &&
            ano >= 1900 &&
            dataTeste <= new Date()
        );
    }

    async function handleSalvar() {
        if (!nome.trim() || !sobrenome.trim()) {
            Alert.alert(
                'Campos obrigatórios',
                'Preencha seu nome e sobrenome.'
            );
            return;
        }

        if (telefone && telefone.replace(/\D/g, '').length < 10) {
            Alert.alert(
                'Telefone inválido',
                'Confira o número de telefone informado.'
            );
            return;
        }

        if (dataNascimento && !validarData(dataNascimento)) {
            Alert.alert(
                'Data inválida',
                'Informe uma data válida no formato DD/MM/AAAA.'
            );
            return;
        }

        const sucesso = await salvarPerfil({
            nome,
            sobrenome,
            telefone,
            dataNascimento,
        });

        if (sucesso) {
            Alert.alert(
                'Perfil atualizado!',
                'Suas informações foram salvas com sucesso.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } else {
            Alert.alert(
                'Erro ao salvar',
                erro || 'Não foi possível atualizar seu perfil.'
            );
        }
    }

    function Campo({
        label,
        icon,
        value,
        onChangeText,
        placeholder,
        keyboardType = 'default',
        editable = true,
        maxLength,
    }) {
        return (
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>{label}</Text>

                <View
                    style={[
                        styles.inputContainer,
                        !editable && styles.inputDisabled,
                    ]}
                >
                    <MaterialCommunityIcons
                        name={icon}
                        size={21}
                        color={VERDE_CLARO}
                    />

                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor="#999999"
                        keyboardType={keyboardType}
                        editable={editable}
                        maxLength={maxLength}
                        autoCapitalize="words"
                    />
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                    Carregando informações...
                </Text>
            </View>
        );
    }

    if (!perfil) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>
                    {erro || 'Não foi possível carregar seu perfil.'}
                </Text>

                <Pressable
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.cancelButtonText}>Voltar</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ImageBackground
            source={require('../../../../assets/images/indicators-background.png')}
            resizeMode="cover"
            style={styles.background}
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.header}>
                            <Pressable
                                style={styles.backButton}
                                onPress={() => router.back()}
                            >
                                <MaterialCommunityIcons
                                    name="arrow-left"
                                    size={25}
                                    color={VERDE}
                                />
                            </Pressable>

                            <View style={styles.headerTextContainer}>
                                <Text style={styles.title}>
                                    Editar <Text style={styles.highlight}>perfil</Text>
                                </Text>

                                <Text style={styles.subtitle}>
                                    Atualize suas informações pessoais.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <MaterialCommunityIcons
                                    name="account"
                                    size={65}
                                    color={VERDE_CLARO}
                                />
                            </View>

                            <Text style={styles.avatarName}>
                                {nome || 'Seu nome'}
                            </Text>

                            <Text style={styles.avatarSubtitle}>
                                Informações da sua conta
                            </Text>
                        </View>

                        <View style={styles.formCard}>
                            <Text style={styles.sectionTitle}>
                                Dados pessoais
                            </Text>

                            <Campo
                                label="Nome"
                                icon="account-outline"
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Digite seu nome"
                            />

                            <Campo
                                label="Sobrenome"
                                icon="account-outline"
                                value={sobrenome}
                                onChangeText={setSobrenome}
                                placeholder="Digite seu sobrenome"
                            />

                            <Campo
                                label="Telefone"
                                icon="phone-outline"
                                value={telefone}
                                onChangeText={(valor) =>
                                    setTelefone(formatarTelefone(valor))
                                }
                                placeholder="(00) 00000-0000"
                                keyboardType="phone-pad"
                                maxLength={15}
                            />

                            <Campo
                                label="Data de nascimento"
                                icon="calendar-outline"
                                value={dataNascimento}
                                onChangeText={setDataNascimento}
                                placeholder="DD/MM/AAAA"
                                keyboardType="numeric"
                                maxLength={10}
                            />

                            <View style={styles.divider} />

                            <Text style={styles.sectionTitle}>
                                Dados da conta
                            </Text>

                            <Campo
                                label="E-mail"
                                icon="email-outline"
                                value={perfil.email || ''}
                                editable={false}
                            />

                            <Campo
                                label="Grupo participante"
                                icon="account-group-outline"
                                value={perfil.grupoId || 'Sem grupo vinculado'}
                                editable={false}
                            />

                            <Text style={styles.helperText}>
                                O e-mail e o grupo não podem ser alterados nesta tela.
                            </Text>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.saveButton,
                                pressed && styles.buttonPressed,
                                salvando && styles.buttonDisabled,
                            ]}
                            onPress={handleSalvar}
                            disabled={salvando}
                        >
                            {salvando ? (
                                <Text style={styles.saveButtonText}>
                                    Salvando...
                                </Text>
                            ) : (
                                <>
                                    <MaterialCommunityIcons
                                        name="content-save-outline"
                                        size={22}
                                        color="#FFFFFF"
                                    />

                                    <Text style={styles.saveButtonText}>
                                        Salvar alterações
                                    </Text>
                                </>
                            )}
                        </Pressable>

                        <Pressable
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                            disabled={salvando}
                        >
                            <Text style={styles.cancelButtonText}>
                                Cancelar
                            </Text>
                        </Pressable>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },

    background: {
        flex: 1,
    },

    safeArea: {
        flex: 1,
    },

    content: {
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 35,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    headerTextContainer: {
        flex: 1,
    },

    title: {
        fontSize: 27,
        fontWeight: '800',
        color: VERDE,
    },

    highlight: {
        color: VERDE_CLARO,
    },

    subtitle: {
        fontSize: 13,
        color: '#6F756B',
        marginTop: 4,
    },

    avatarContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },

    avatar: {
        width: 105,
        height: 105,
        borderRadius: 53,
        backgroundColor: '#FFFFFF',
        borderWidth: 3,
        borderColor: '#DCE8D5',
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarName: {
        fontSize: 20,
        fontWeight: '700',
        color: VERDE,
        marginTop: 12,
    },

    avatarSubtitle: {
        fontSize: 13,
        color: '#777777',
        marginTop: 4,
    },

    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 20,
        elevation: 3,
        shadowColor: '#000000',
        shadowOpacity: 0.07,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: VERDE,
        marginBottom: 18,
    },

    fieldContainer: {
        marginBottom: 17,
    },

    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#50564C',
        marginBottom: 8,
    },

    inputContainer: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F9F5',
        borderWidth: 1,
        borderColor: '#E1E8DC',
        borderRadius: 14,
        paddingHorizontal: 15,
    },

    inputDisabled: {
        backgroundColor: '#EEEEEE',
        borderColor: '#E5E5E5',
    },

    input: {
        flex: 1,
        height: 52,
        fontSize: 15,
        color: '#333333',
        marginLeft: 11,
    },

    divider: {
        height: 1,
        backgroundColor: '#E8EDE5',
        marginVertical: 12,
        marginBottom: 22,
    },

    helperText: {
        color: '#858585',
        fontSize: 12,
        marginTop: -5,
        marginBottom: 5,
    },

    saveButton: {
        minHeight: 56,
        borderRadius: 16,
        backgroundColor: VERDE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 24,
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    buttonPressed: {
        opacity: 0.8,
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    cancelButton: {
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },

    cancelButtonText: {
        color: VERDE,
        fontSize: 15,
        fontWeight: '700',
    },

    loadingContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 25,
    },

    loadingText: {
        color: VERDE,
        fontSize: 16,
        fontWeight: '600',
    },

    errorText: {
        color: '#B3261E',
        fontSize: 15,
        textAlign: 'center',
    },
});
