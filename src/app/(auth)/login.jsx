import { useRef } from 'react';

import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../../constants/colors';

import AuthInput from '../../components/AuthInput';
import PrimaryButton from '../../components/PrimaryButton';

export default function Login() {
    const router = useRouter();
    const scrollViewRef = useRef(null);

    const { width, height } = useWindowDimensions();

    const compactScreen = height < 820;

    const horizontalPadding = Math.max(
        20,
        Math.min(32, width * 0.07)
    );

    const titleSize = Math.max(
        29,
        Math.min(37, width * 0.09)
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
                            paddingHorizontal: horizontalPadding,
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
                                styles.welcome,
                                compactScreen &&
                                    styles.welcomeCompact,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        fontSize: titleSize,
                                        lineHeight:
                                            titleSize + 6,
                                    },
                                ]}
                            >
                                Bem-vindo(a){'\n'}
                                ao{' '}
                                <Text style={styles.highlight}>
                                    What IF App
                                </Text>
                            </Text>

                            <Text style={styles.description}>
                                Um espaço para você cuidar da sua
                            </Text>

                            <Text
                                style={
                                    styles.descriptionHighlight
                                }
                            >
                                mente, emoções e conquistas.
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.form,
                                compactScreen &&
                                    styles.formCompact,
                            ]}
                        >
                            <AuthInput
                                placeholder="E-mail ou nome de usuário"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="next"
                            />

                            <AuthInput
                                placeholder="Senha"
                                secureTextEntry
                                returnKeyType="done"
                                onFocus={handlePasswordFocus}
                            />

                            <Pressable
                                style={styles.forgotPassword}
                            >
                                <Text
                                    style={
                                        styles.forgotPasswordText
                                    }
                                >
                                    Esqueceu sua senha?
                                </Text>
                            </Pressable>

                            <PrimaryButton title="Entrar" />

                            <View style={styles.separator}>
                                <View style={styles.line} />

                                <Text style={styles.separatorText}>
                                    ou
                                </Text>

                                <View style={styles.line} />
                            </View>

                            <Pressable
                                style={
                                    styles.createAccountButton
                                }
                                onPress={() =>
                                    router.push('/cadastro')
                                }
                            >
                                <Text
                                    style={
                                        styles.createAccountText
                                    }
                                >
                                    Criar conta
                                </Text>

                                <Text style={styles.arrow}>
                                    →
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    <Text style={styles.footer}>
                        Desenvolvido para estudantes do{' '}
                        <Text style={styles.footerHighlight}>
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

    welcome: {
        marginTop: 45,
        alignItems: 'center',
    },

    welcomeCompact: {
        marginTop: 25,
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
        marginTop: 10,

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
        marginTop: 55,
    },

    formCompact: {
        marginTop: 35,
    },

    forgotPassword: {
        alignSelf: 'flex-end',

        marginTop: 1,
        marginBottom: 20,
    },

    forgotPasswordText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '500',
    },

    separator: {
        flexDirection: 'row',
        alignItems: 'center',

        marginVertical: 16,
    },

    line: {
        flex: 1,
        height: 1,

        backgroundColor: COLORS.border,
    },

    separatorText: {
        marginHorizontal: 14,
        color: COLORS.textSecondary,
    },

    createAccountButton: {
        minHeight: 56,
        borderRadius: 28,

        borderWidth: 1.5,
        borderColor: COLORS.primary,

        paddingHorizontal: 24,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    createAccountText: {
        color: COLORS.primary,
        fontSize: 17,
        fontWeight: '600',
    },

    arrow: {
        color: COLORS.primary,
        fontSize: 26,
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