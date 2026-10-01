import { useRef } from 'react';

import {
    Image,
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

export default function Cadastro() {
    const router = useRouter();
    const scrollViewRef = useRef(null);

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

    function handlePasswordFocus() {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({
                animated: true,
            });
        }, 250);
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : 'height'
                }
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={[
                        styles.content,
                        {
                            paddingHorizontal:
                                horizontalPadding,
                        },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={
                        Platform.OS === 'ios'
                            ? 'interactive'
                            : 'on-drag'
                    }
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        <View style={styles.header}>
                            <Image
                                source={require('../../../assets/images/WhatIFicon.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />

                            <Text style={styles.appName}>
                                WHAT IF APP
                            </Text>

                            <Text style={styles.subtitle}>
                                Saúde mental e{'\n'}
                                bem-estar estudantil
                            </Text>
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
                                        lineHeight:
                                            titleSize + 5,
                                    },
                                ]}
                            >
                                Crie sua{' '}
                                <Text
                                    style={
                                        styles.highlight
                                    }
                                >
                                    conta
                                </Text>
                            </Text>

                            <Text
                                style={
                                    styles.description
                                }
                            >
                                Vamos começar?
                            </Text>

                            <Text
                                style={
                                    styles.description
                                }
                            >
                                Preencha seus dados para 
                            </Text>

                            <Text
                                style={
                                    styles.descriptionHighlight
                                }
                            >
                                fazer parte do WhatIF
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.form,
                                compactScreen &&
                                styles.formCompact,
                            ]}
                        >
                            <TextInput
                                style={styles.input}
                                placeholder="Nome"
                                placeholderTextColor={
                                    COLORS.textSecondary
                                }
                                returnKeyType="next"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="E-mail"
                                placeholderTextColor={
                                    COLORS.textSecondary
                                }
                                keyboardType="email-address"
                                autoCapitalize="none"
                                returnKeyType="next"
                            />

                            <Pressable
                                style={styles.input}
                            >
                                <Text
                                    style={
                                        styles.selectPlaceholder
                                    }
                                >
                                    Selecione sua equipe
                                </Text>

                                <Text
                                    style={
                                        styles.selectArrow
                                    }
                                >
                                    ↓
                                </Text>
                            </Pressable>

                            <TextInput
                                style={styles.input}
                                placeholder="Senha"
                                placeholderTextColor={
                                    COLORS.textSecondary
                                }
                                secureTextEntry
                                returnKeyType="next"
                                onFocus={
                                    handlePasswordFocus
                                }
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Confirmar senha"
                                placeholderTextColor={
                                    COLORS.textSecondary
                                }
                                secureTextEntry
                                returnKeyType="done"
                                onFocus={
                                    handlePasswordFocus
                                }
                            />

                            <Pressable
                                style={
                                    styles.createButton
                                }
                            >
                                <Text
                                    style={
                                        styles.createButtonText
                                    }
                                >
                                    Criar conta
                                </Text>
                            </Pressable>

                            <View
                                style={
                                    styles.loginContainer
                                }
                            >
                                <Text
                                    style={
                                        styles.loginQuestion
                                    }
                                >
                                    Já possui uma conta?
                                </Text>

                                <Pressable
                                    onPress={() =>
                                        router.replace(
                                            '/login'
                                        )
                                    }
                                >
                                    <Text
                                        style={
                                            styles.loginLink
                                        }
                                    >
                                        Entrar
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.footer}>
                        Desenvolvido para estudantes do{' '}
                        <Text
                            style={
                                styles.footerHighlight
                            }
                        >
                            IFPR
                        </Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
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
        backgroundColor: COLORS.background,
    },

    content: {
        flexGrow: 1,

        paddingTop: 18,
        paddingBottom: 16,

        justifyContent: 'space-between',
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
        fontSize: 27,
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