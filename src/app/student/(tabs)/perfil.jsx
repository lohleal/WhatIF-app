import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../../../constants/colors';

import ProfileInfoRow from '../../../features/profile/components/profileInfoRow';

export default function Perfil() {
    const router = useRouter();

    const { width } = useWindowDimensions();

    const horizontalPadding = Math.max(
        18,
        Math.min(28, width * 0.055)
    );

    /*
     * Esses dados são temporários.
     * Depois virão do usuário autenticado.
     */
    const user = {
        firstName: 'Giovanna',
        lastName: 'Silva',
        username: 'giovannasilva',
        email: 'giovanna.silva@email.com',
        group: 'Grupo A',
        phone: '(41) 98765-4321',
        birthDate: '14 de março de 2005',
    };

    function handleEditProfile() {
        router.push('/student/profile/editar');
    }

    function handleLogout() {
        /*
         * Temporário.
         * Depois o Firebase fará o logout.
         */
        router.replace('/login');
    }

    return (
        <ImageBackground
            source={require(
                '../../../../assets/images/indicators-background.png'
            )}
            resizeMode="cover"
            style={styles.background}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={[
                        styles.content,
                        {
                            paddingHorizontal:
                                horizontalPadding,
                        },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* CABEÇALHO */}

                    <View style={styles.topRow}>
                        <View>
                            <Text style={styles.pageTitle}>
                                Meu{' '}
                                <Text style={styles.highlight}>
                                    perfil
                                </Text>
                            </Text>

                            <Text style={styles.pageSubtitle}>
                                Aqui estão suas informações{'\n'}
                                e preferências no What IF App.
                            </Text>
                        </View>

                        <Pressable style={styles.notificationButton}>
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={26}
                                color={COLORS.primary}
                            />

                            <View style={styles.notificationDot} />
                        </Pressable>
                    </View>

                    {/* FOTO */}

                    <View style={styles.profileArea}>
                        <View style={styles.avatarDecoration}>
                            <View style={styles.avatar}>
                                <MaterialCommunityIcons
                                    name="account"
                                    size={84}
                                    color="#7BA05F"
                                />
                            </View>

                            <Pressable style={styles.cameraButton}>
                                <MaterialCommunityIcons
                                    name="camera-outline"
                                    size={23}
                                    color="#FFFFFF"
                                />
                            </Pressable>
                        </View>

                        <Text style={styles.fullName}>
                            {user.firstName}{' '}
                            <Text style={styles.highlight}>
                                {user.lastName}
                            </Text>
                        </Text>

                        <Text style={styles.username}>
                            @{user.username}
                        </Text>
                    </View>

                    {/* DADOS */}

                    <View style={styles.informationList}>
                        <ProfileInfoRow
                            icon="account"
                            label="Nome"
                            value={user.firstName}
                        />

                        <ProfileInfoRow
                            icon="account-outline"
                            label="Sobrenome"
                            value={user.lastName}
                        />

                        <ProfileInfoRow
                            icon="at"
                            label="Nome de usuário"
                            value={user.username}
                        />

                        <ProfileInfoRow
                            icon="email-outline"
                            label="E-mail"
                            value={user.email}
                        />

                        <ProfileInfoRow
                            icon="account-group"
                            label="Grupo participante"
                            value={user.group}
                        />

                        <ProfileInfoRow
                            icon="phone-outline"
                            label="Telefone"
                            value={user.phone}
                        />

                        <ProfileInfoRow
                            icon="calendar-outline"
                            label="Data de nascimento"
                            value={user.birthDate}
                        />

                        <ProfileInfoRow
                            icon="lock-outline"
                            label="Senha"
                            value="••••••••"
                            password
                        />
                    </View>

                    {/* EDITAR */}

                    <Pressable
                        onPress={handleEditProfile}
                        style={({ pressed }) => [
                            styles.editButton,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="pencil-outline"
                            size={24}
                            color="#FFFFFF"
                        />

                        <Text style={styles.editButtonText}>
                            Editar perfil
                        </Text>

                        <MaterialCommunityIcons
                            name="arrow-right"
                            size={26}
                            color="#FFFFFF"
                        />
                    </Pressable>

                    {/* SAIR */}

                    <Pressable
                        onPress={handleLogout}
                        style={({ pressed }) => [
                            styles.logoutButton,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="logout"
                            size={23}
                            color="#F25555"
                        />

                        <Text style={styles.logoutText}>
                            Sair da conta
                        </Text>
                    </Pressable>
                </ScrollView>
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
        paddingTop: 18,

        /*
         * Espaço para não ficar atrás
         * da barra inferior.
         */
        paddingBottom: 115,
    },

    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    pageTitle: {
        fontSize: 36,
        fontWeight: '700',
        color: COLORS.text,
    },

    highlight: {
        color: COLORS.primary,
    },

    pageSubtitle: {
        marginTop: 5,

        fontSize: 14,
        lineHeight: 19,

        color: COLORS.textSecondary,
    },

    notificationButton: {
        width: 42,
        height: 42,

        borderRadius: 21,

        alignItems: 'center',
        justifyContent: 'center',
    },

    notificationDot: {
        position: 'absolute',

        top: 5,
        right: 6,

        width: 8,
        height: 8,

        borderRadius: 4,

        backgroundColor: COLORS.primary,
    },

    profileArea: {
        marginTop: 20,

        alignItems: 'center',
    },

    avatarDecoration: {
        width: 154,
        height: 154,

        borderRadius: 77,

        backgroundColor: '#E8F4E5',

        alignItems: 'center',
        justifyContent: 'center',

        position: 'relative',
    },

    avatar: {
        width: 136,
        height: 136,

        borderRadius: 68,

        backgroundColor: '#F4F8EF',

        borderWidth: 4,
        borderColor: '#FFFFFF',

        alignItems: 'center',
        justifyContent: 'center',
    },

    cameraButton: {
        position: 'absolute',

        right: 1,
        bottom: 7,

        width: 47,
        height: 47,

        borderRadius: 24,

        backgroundColor: COLORS.primary,

        borderWidth: 4,
        borderColor: '#FFFFFF',

        alignItems: 'center',
        justifyContent: 'center',
    },

    fullName: {
        marginTop: 12,

        fontSize: 27,
        fontWeight: '700',

        color: COLORS.text,
    },

    username: {
        marginTop: 1,

        fontSize: 15,

        color: COLORS.textSecondary,
    },

    informationList: {
        marginTop: 20,

        gap: 8,
    },

    editButton: {
        minHeight: 58,

        marginTop: 18,

        borderRadius: 29,

        paddingHorizontal: 25,

        backgroundColor: COLORS.primary,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    editButtonText: {
        fontSize: 18,
        fontWeight: '700',

        color: '#FFFFFF',
    },

    logoutButton: {
        minHeight: 54,

        marginTop: 10,

        borderRadius: 27,

        borderWidth: 1.5,
        borderColor: '#F58A8A',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        gap: 9,

        backgroundColor: '#FFFFFFCC',
    },

    logoutText: {
        fontSize: 16,
        fontWeight: '600',

        color: '#F25555',
    },

    buttonPressed: {
        opacity: 0.8,

        transform: [
            {
                scale: 0.99,
            },
        ],
    },
});