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

import AuthInput from '../../components/AuthInput';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';

export default function Login() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();

    const isDesktop = width >= 700;
    const compactScreen = height < 820;

    const horizontalPadding = Math.max(20, Math.min(32, width * 0.07));
    const titleSize = Math.max(29, Math.min(37, width * 0.09));

    if (isDesktop) {
        return (
            <SafeAreaView style={styles.desktopSafeArea}>
                {}
                <View style={styles.desktopOverlay}>
                    <View style={styles.desktopCard}>
                        <View style={styles.desktopLeft}>
                            <Image
                                source={require('../../../assets/images/login-left-background.png')}
                                style={styles.desktopLeftImage}
                                resizeMode="cover"
                                accessibilityLabel="Fundo botânico decorativo"
                            />

                            <View style={styles.desktopBrand}>
                                <Image
                                    source={require('../../../assets/images/WhatIFicon.png')}
                                    style={styles.desktopLogo}
                                    resizeMode="contain"
                                />
                                <Text style={styles.desktopAppName}>WHATIF APP</Text>
                                <Text style={styles.desktopSubtitle}>
                                    Saúde mental e{'\n'}bem-estar estudantil
                                </Text>
                            </View>

                            <View style={styles.desktopSlogan}>
                                <Text style={styles.desktopSloganLine}>Cuidar de hoje</Text>
                                <Text style={styles.desktopSloganLine}>constrói um</Text>
                                <Text style={styles.desktopSloganHighlight}>amanhã melhor.</Text>
                            </View>
                        </View>

                        <KeyboardAvoidingView
                            style={styles.desktopRight}
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        >
                            <ScrollView
                                contentContainerStyle={styles.desktopFormContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.desktopWelcome}>
                                    Bem-vindo(a){'\n'}ao{' '}
                                    <Text style={styles.desktopWelcomeHighlight}>What IF App</Text>
                                </Text>

                                <Text style={styles.desktopDescription}>
                                    Acesse sua conta para continuar.
                                </Text>

                                <View style={styles.desktopForm}>
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
                                    />

                                    <Pressable style={styles.desktopForgotPassword}>
                                        <Text style={styles.desktopForgotPasswordText}>
                                            Esqueceu sua senha?
                                        </Text>
                                    </Pressable>

                                    <PrimaryButton
                                        title="Entrar"
                                        onPress={() => router.push('/student/indicadores')}
                                    />

                                   

                                   
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // mobile
    return (
        <SafeAreaView style={styles.safeArea}>
            <Image
                source={require('../../../assets/images/login-background.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
                pointerEvents="none"
            />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.content,
                        { paddingHorizontal: horizontalPadding },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        <View style={styles.header}>
                            <Image
                                source={require('../../../assets/images/WhatIFicon.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />

                            <Text style={styles.appName}>WHATIF APP</Text>
                            <Text style={styles.subtitle}>
                                Saúde mental e{'\n'}bem-estar estudantil
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.welcome,
                                compactScreen && styles.welcomeCompact,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        fontSize: titleSize,
                                        lineHeight: titleSize + 6,
                                    },
                                ]}
                            >
                                Que bom ter você por aqui!
                            </Text>

                            <Text style={styles.description}>
                                Entre ou crie sua conta para
                                <Text style={styles.descriptionHighlight}>
                                    {' '}iniciar sua jornada!
                                </Text>
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.form,
                                compactScreen && styles.formCompact,
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
                            />

                            <Pressable style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>
                                    Esqueceu sua senha?
                                </Text>
                            </Pressable>

                            <PrimaryButton
                                title="Entrar"
                                onPress={() => router.push('/student/indicadores')}
                            />

                            <View style={styles.separator}>
                                <View style={styles.line} />
                                <Text style={styles.separatorText}>ou</Text>
                                <View style={styles.line} />
                            </View>

                            <Pressable
                                style={styles.createAccountButton}
                                onPress={() => router.push('/cadastro')}
                            >
                                <Text style={styles.createAccountText}>Criar conta</Text>
                                <Text style={styles.arrow}>→</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Text style={styles.footer}>
                        Desenvolvido para estudantes do{' '}
                        <Text style={styles.footerHighlight}>IFPR</Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    /* MOBILE */
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 8,
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
    description: {
        marginTop: 10,
        fontSize: 15,
        textAlign: 'center',
        color: COLORS.textSecondary,
    },
    descriptionHighlight: {
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

    /* EMULADOR / DESKTOP */
    desktopSafeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    desktopOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingVertical: 24,
        backgroundColor: '#FFFFFF',
    },
    desktopCard: {
        width: '100%',
        maxWidth: 1180,
        height: '88%',
        minHeight: 520,
        maxHeight: 760,
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#EDF1F0',
        backgroundColor: '#FFFFFF',
        elevation: 8,
        shadowColor: '#173B35',
        shadowOpacity: 0.12,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 10 },
    },
    desktopLeft: {
        width: '46%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#F5FAF7',
    },
    desktopLeftImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    desktopBrand: {
        position: 'absolute',
        top: 28,
        left: 18,
        right: 18,
        alignItems: 'center',
    },
    desktopLogo: {
        width: 66,
        height: 66,
        marginBottom: 6,
    },
    desktopAppName: {
        color: '#176B49',
        fontSize: 25,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    desktopSubtitle: {
        color: '#465A61',
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
        marginTop: 5,
    },
    desktopSlogan: {
        position: 'absolute',
        top: '39%',
        left: 28,
        right: 22,
    },
    desktopSloganLine: {
        color: '#10202C',
        fontSize: 28,
        lineHeight: 33,
        fontWeight: '800',
    },
    desktopSloganHighlight: {
        color: '#198754',
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '800',
    },
    desktopRight: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
    },
    desktopFormContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 48,
        paddingVertical: 36,
    },
    desktopWelcome: {
        color: '#101F2D',
        fontSize: 34,
        lineHeight: 42,
        fontWeight: '800',
    },
    desktopWelcomeHighlight: {
        color: '#198754',
    },
    desktopDescription: {
        color: '#687B8D',
        fontSize: 16,
        marginTop: 12,
    },
    desktopForm: {
        marginTop: 38,
        gap: 14,
    },
    desktopForgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -4,
        marginBottom: 4,
    },
    desktopForgotPasswordText: {
        color: '#198754',
        fontSize: 14,
        fontWeight: '600',
    },
    desktopSeparator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    desktopLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#DCE4E7',
    },
    desktopSeparatorText: {
        color: '#7A8996',
        marginHorizontal: 14,
    },
    desktopCreateAccount: {
        minHeight: 54,
        borderRadius: 28,
        borderWidth: 1.5,
        borderColor: '#198754',
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    desktopCreateAccountText: {
        color: '#198754',
        fontSize: 16,
        fontWeight: '700',
    },
    desktopArrow: {
        color: '#198754',
        fontSize: 26,
    },
});
