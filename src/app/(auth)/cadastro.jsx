
import { useRef, useState } from 'react';

import {
    Alert,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import useAuthViewModel from '../../features/auth/viewmodels/useAuthViewModel';

export default function Cadastro() {
    const { cadastro, loading, erro } = useAuthViewModel();
    const router = useRouter();
    const scrollViewRef = useRef(null);

    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const { width, height } = useWindowDimensions();

    const compactScreen = height < 820;

    const horizontalPadding = Math.max(
        20,
        Math.min(32, width * 0.07)
    );

    const titleSize = Math.max(
        27,
        Math.min(34, width * 0.082)
    );

    async function handleCadastro() {
        if (
            !nome.trim() ||
            !sobrenome.trim() ||
            !email.trim() ||
            !telefone.trim() ||
            !senha ||
            !confirmarSenha
        ) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert(
                'Senhas diferentes',
                'As senhas digitadas não coincidem.'
            );
            return;
        }

        try {
            await cadastro(nome, sobrenome, email, telefone, senha);

            Alert.alert(
                'Cadastro realizado!',
                'Sua conta foi criada com sucesso.'
            );

            router.replace('/login');
        } catch (error) {
            // A mensagem será exibida pela variável erro na interface.
        }
    }

    function handlePasswordFocus() {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({
                animated: true,
            });
        }, 250);
    }

    return (
        <ImageBackground
            source={require('../../../assets/images/cadastro-background.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={0}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={[
                            styles.content,
                            { paddingHorizontal: horizontalPadding },
                        ]}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode={
                            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
                        }
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Mantenha aqui TODO o conteúdo atual do cadastro */}

                        <View>
                            <View style={styles.header}>
                                <Image
                                    source={require('../../../assets/images/WhatIFicon.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />

                                <Text style={styles.appName}>
                                    WHATIF APP
                                </Text>

                                {/*
                                <Text style={styles.subtitle}>
                                    Saúde mental e{'\n'}
                                    bem-estar estudantil
                                </Text>
                                */}
                            </View>

                            <View
                                style={[
                                    styles.titleContainer,
                                    compactScreen &&
                                    styles.titleContainerCompact,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.title,
                                        {
                                            fontSize: titleSize,
                                            lineHeight: titleSize + 5,
                                        },
                                    ]}
                                >
                                    Criar{' '}
                                    <Text style={styles.highlight}>
                                        conta
                                    </Text>
                                </Text>

                                {/* <Text style={styles.description}>
                                    Vamos começar?
                                </Text> */}

                                <Text style={styles.description}>
                                    Preencha seus dados para
                                </Text>

                                <Text style={styles.descriptionHighlight}>
                                    fazer parte do WhatIF
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.form,
                                    compactScreen && styles.formCompact,
                                ]}
                            >
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nome"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={nome}
                                    onChangeText={setNome}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Sobrenome"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={sobrenome}
                                    onChangeText={setSobrenome}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="E-mail"
                                    placeholderTextColor={COLORS.textSecondary}
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />

                                <Pressable style={styles.input}>
                                    <Text style={styles.selectPlaceholder}>
                                        Selecione sua equipe
                                    </Text>

                                    <Text style={styles.selectArrow}>
                                        ↓
                                    </Text>
                                </Pressable>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Telefone"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={telefone}
                                    onChangeText={setTelefone}
                                    keyboardType="phone-pad"
                                    returnKeyType="next"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Senha"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={senha}
                                    onChangeText={setSenha}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    returnKeyType="next"
                                    onFocus={handlePasswordFocus}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirmar senha"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={confirmarSenha}
                                    onChangeText={setConfirmarSenha}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    returnKeyType="done"
                                    onFocus={handlePasswordFocus}
                                />

                                <Pressable
                                    style={styles.createButton}
                                    onPress={handleCadastro}
                                    disabled={loading}
                                >
                                    <Text style={styles.createButtonText}>
                                        {loading
                                            ? 'Criando conta...'
                                            : 'Criar conta'}
                                    </Text>
                                </Pressable>

                                {erro ? (
                                    <Text style={styles.error}>
                                        {erro}
                                    </Text>
                                ) : null}

                                <View style={styles.loginContainer}>
                                    <Text style={styles.loginQuestion}>
                                        Já possui uma conta?
                                    </Text>

                                    <Pressable
                                        onPress={() => router.replace('/login')}
                                    >
                                        <Text style={styles.loginLink}>
                                            Entrar
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>

                        {/* <Text style={styles.footer}>
                            Desenvolvido para estudantes do{' '}
                            <Text style={styles.footerHighlight}>IFPR</Text>
                        </Text> */}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    screen: {
        flex: 1,
        position: 'relative',
        backgroundColor: 'transparent',
    },

    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },

    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    content: {
        flexGrow: 1,
        paddingTop: 0,
        paddingBottom: 0,
    },

    logo: {
        width: 75,
        height: 75,
        marginBottom: 5,
    },

    header: {
        alignItems: 'center',
    },

    appName: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.primary,
    },

    subtitle: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 17,
        textAlign: 'center',
        color: COLORS.text,
    },

    titleContainer: {
        marginTop: 26,
        alignItems: 'center',
    },

    titleContainerCompact: {
        marginTop: 16,
    },

    title: {
        fontWeight: '700',
        textAlign: 'center',
        color: COLORS.text,
    },

    highlight: {
        color: COLORS.primary,
    },

    description: {
        marginTop: 8,
        fontSize: 15,
        textAlign: 'center',
        color: COLORS.textSecondary,
    },

    descriptionHighlight: {
        marginTop: 2,
        fontSize: 15,
        textAlign: 'center',
        color: COLORS.primary,
        fontWeight: '500',
    },

    form: {
        width: '100%',
        marginTop: 26,
    },

    formCompact: {
        marginTop: 18,
    },

    input: {
        minHeight: 54,
        backgroundColor: COLORS.surface,
        borderRadius: 27,
        paddingHorizontal: 22,
        marginBottom: 10,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    selectPlaceholder: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },

    selectArrow: {
        fontSize: 18,
        color: COLORS.primary,
    },

    createButton: {
        minHeight: 54,
        borderRadius: 27,
        marginTop: 4,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    createButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },

    error: {
        color: '#D32F2F',
        textAlign: 'center',
        marginTop: 8,
    },

    loginContainer: {
        marginTop: 17,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },

    loginQuestion: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },

    loginLink: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },

    footer: {
        marginTop: 20,
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontSize: 13,
    },

    footerHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
