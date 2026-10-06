import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../../../constants/colors';

import WellbeingCard from '../../../features/indicators/components/wellbeingCard';

export default function BemEstar() {
    const router = useRouter();
    const { width } = useWindowDimensions();

const horizontalPadding = Math.max(
    20,
    Math.min(32, width * 0.07)
);

const gap = 14;

const cardWidth =
    (width - horizontalPadding * 2 - gap) / 2;

    return (
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
                {/* Notificação */}

                <View style={styles.notificationRow}>
                    <Pressable style={styles.notificationButton}>
                        <MaterialCommunityIcons
                            name="bell-outline"
                            size={27}
                            color={COLORS.primary}
                        />
                    </Pressable>
                </View>

                {/* Mensagem principal */}

                <View style={styles.welcomeCard}>
                    <View style={styles.faceCircle}>
                        <MaterialCommunityIcons
                            name="emoticon-happy-outline"
                            size={42}
                            color="#EFB864"
                        />
                    </View>

                    <View style={styles.welcomeText}>
                        <Text style={styles.welcomeTitle}>
                            Como você está{'\n'}
                            se sentindo hoje?
                        </Text>

                        <Text style={styles.welcomeSubtitle}>
                            Continue cuidando de você.
                        </Text>
                    </View>
                </View>

                {/* Cards */}

                <View
                    style={[
                        styles.grid,
                        {
                            gap,
                        },
                    ]}
                >
                    {/* ÁGUA */}

                    <WellbeingCard
                        width={cardWidth}
                        title="Água"
                        subtitle="4 de 8 copos"
                        iconName="water"
                        iconColor="#48A9B6"
                        backgroundColor="#EEF8FC"
                        onPress={() =>
                            router.push(
                                '/student/wellbeing/hidratacao'
                            )
                        }
                    >
                        <View style={styles.waterCircle}>
                            <MaterialCommunityIcons
                                name="water-outline"
                                size={55}
                                color="#69C6D2"
                            />
                        </View>
                    </WellbeingCard>

                    {/* SONO */}

                    <WellbeingCard
                        width={cardWidth}
                        title="Sono"
                        subtitle="7h 30min"
                        iconName="moon-waning-crescent"
                        iconColor="#7155A5"
                        backgroundColor="#F6F0FC"
                        onPress={() =>
                            router.push(
                                '/student/wellbeing/sono'
                            )
                        }
                    >
                        <MaterialCommunityIcons
                            name="weather-night"
                            size={75}
                            color="#A997C7"
                        />

                        <Text style={styles.sleepStatus}>
                            Bom
                        </Text>
                    </WellbeingCard>

                    {/* HUMOR */}

                    <WellbeingCard
                        width={cardWidth}
                        title="Humor"
                        subtitle="Feliz"
                        iconName="emoticon-happy-outline"
                        iconColor="#E6A63A"
                        backgroundColor="#FFF7EA"
                        onPress={() =>
                            router.push(
                                '/student/wellbeing/humor'
                            )
                        }
                    >
                        <View style={styles.moodBars}>
                            <View
                                style={[
                                    styles.moodBar,
                                    { height: 35 },
                                ]}
                            />

                            <View
                                style={[
                                    styles.moodBar,
                                    { height: 55 },
                                ]}
                            />

                            <View
                                style={[
                                    styles.moodBar,
                                    { height: 42 },
                                ]}
                            />

                            <View
                                style={[
                                    styles.moodBarActive,
                                    { height: 75 },
                                ]}
                            />

                            <View
                                style={[
                                    styles.moodBar,
                                    { height: 35 },
                                ]}
                            />
                        </View>

                        <View style={styles.emojis}>
                            <Text style={styles.emoji}>😔</Text>
                            <Text style={styles.emoji}>😐</Text>
                            <Text style={styles.emoji}>😁</Text>
                        </View>
                    </WellbeingCard>

                    {/* ESTUDO */}

                    <WellbeingCard
                        width={cardWidth}
                        title="Estudo"
                        subtitle={'Seu estudo geral\nde hoje.'}
                        iconName="book-open-page-variant-outline"
                        iconColor="#7DA55C"
                        backgroundColor="#F2F8EC"
                        onPress={() =>
                            router.push(
                                '/student/wellbeing/estudo'
                            )
                        }
                    >
                        <View style={styles.studyCircle}>
                            <Text style={styles.studyTime}>
                                1h
                            </Text>
                        </View>
                    </WellbeingCard>
                </View>

                {/* Mensagem final */}

                <View style={styles.footerCard}>
                    <MaterialCommunityIcons
                        name="sprout-outline"
                        size={35}
                        color="#89AE70"
                    />

                    <Text style={styles.footerText}>
                        Pequenas ações diárias geram{' '}
                        <Text style={styles.highlight}>
                            grandes transformações.
                        </Text>
                    </Text>

                    <MaterialCommunityIcons
                        name="heart-outline"
                        size={26}
                        color={COLORS.primary}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    content: {
        paddingTop: 10,
        paddingBottom: 115,
    },

    notificationRow: {
        alignItems: 'flex-end',
        marginBottom: 22,
    },

    notificationButton: {
        width: 44,
        height: 44,

        borderRadius: 22,

        alignItems: 'center',
        justifyContent: 'center',
    },

    welcomeCard: {
        minHeight: 125,

        borderRadius: 22,

        paddingHorizontal: 18,
        paddingVertical: 15,

        backgroundColor: '#F3F7ED',

        flexDirection: 'row',
        alignItems: 'center',

        marginBottom: 20,
    },

    faceCircle: {
        width: 82,
        height: 82,

        borderRadius: 41,

        backgroundColor: '#FFF8E4',

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 16,
    },

    welcomeText: {
        flex: 1,
    },

    welcomeTitle: {
        fontSize: 23,
        lineHeight: 29,
        fontWeight: '700',

        color: COLORS.primary,
    },

    welcomeSubtitle: {
        marginTop: 6,

        fontSize: 14,

        color: COLORS.textSecondary,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    waterCircle: {
        width: 120,
        height: 120,

        borderRadius: 60,

        borderWidth: 14,
        borderColor: '#A9E7EE',

        alignItems: 'center',
        justifyContent: 'center',
    },

    sleepStatus: {
        marginTop: 15,

        color: COLORS.primary,

        fontSize: 16,
        fontWeight: '500',
    },

    moodBars: {
        height: 80,

        flexDirection: 'row',
        alignItems: 'flex-end',

        gap: 10,
    },

    moodBar: {
        width: 12,

        borderRadius: 8,

        backgroundColor: '#FFDDBE',
    },

    moodBarActive: {
        width: 12,

        borderRadius: 8,

        backgroundColor: '#FF9B67',
    },

    emojis: {
        width: '100%',

        marginTop: 18,

        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    emoji: {
        fontSize: 27,
    },

    studyCircle: {
        width: 125,
        height: 125,

        borderRadius: 63,

        borderWidth: 13,
        borderColor: '#A7C881',

        alignItems: 'center',
        justifyContent: 'center',
    },

    studyTime: {
        fontSize: 34,
        fontWeight: '700',

        color: COLORS.primary,
    },

    footerCard: {
        marginTop: 35,

        minHeight: 90,

        borderRadius: 20,

        backgroundColor: '#F4F8EE',

        paddingHorizontal: 20,

        flexDirection: 'row',
        alignItems: 'center',

        gap: 14,
    },

    footerText: {
        flex: 1,

        fontSize: 15,
        lineHeight: 21,

        color: COLORS.textSecondary,
    },

    highlight: {
        color: COLORS.primary,
        fontWeight: '700',
    },
});