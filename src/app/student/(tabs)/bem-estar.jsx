import {
    ImageBackground,
    Pressable,
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

    const { width, height } = useWindowDimensions();

    const compactScreen = height < 800;

    const horizontalPadding = Math.max(
        18,
        Math.min(28, width * 0.055)
    );

    const contentWidth = width - horizontalPadding * 2;
    const cardWidth = contentWidth * 0.48;

    const cardHeight = compactScreen ? 178 : 205;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ImageBackground
                source={require('../../../../assets/images/indicators-background.png')}
                resizeMode="cover"
                style={styles.background}
            >
                <View
                    style={[
                        styles.content,
                        {
                            paddingHorizontal: horizontalPadding,
                        },
                    ]}
                >
                    {/* topo */}
                    <View style={styles.notificationRow}>
                        <Pressable style={styles.notificationButton}>
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={26}
                                color={COLORS.primary}
                            />
                        </Pressable>
                    </View>

                    {/* card de mensagem */}
                    <View style={styles.welcomeCard}>
                        <View style={styles.faceCircle}>
                            <MaterialCommunityIcons
                                name="emoticon-happy-outline"
                                size={34}
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

                    {/* grade */}
                    <View style={styles.grid}>
                        <WellbeingCard
                            width={cardWidth}
                            height={cardHeight}
                            title="Água"
                            subtitle="4 de 8 copos"
                            iconName="water"
                            iconColor="#48A9B6"
                            backgroundColor="#EEF8FC"
                            onPress={() =>
                                router.push('/student/wellbeing/hidratacao')
                            }
                        >
                            <View style={styles.waterCircle}>
                                <MaterialCommunityIcons
                                    name="water-outline"
                                    size={52}
                                    color="#69C6D2"
                                />
                            </View>
                        </WellbeingCard>

                        <WellbeingCard
                            width={cardWidth}
                            height={cardHeight}
                            title="Sono"
                            subtitle="7h 30min"
                            iconName="moon-waning-crescent"
                            iconColor="#7155A5"
                            backgroundColor="#F6F0FC"
                            onPress={() =>
                                router.push('/student/wellbeing/sono')
                            }
                        >
                            <MaterialCommunityIcons
                                name="weather-night"
                                size={72}
                                color="#A997C7"
                            />
                            <Text style={styles.sleepStatus}>Bom</Text>
                        </WellbeingCard>

                        <WellbeingCard
                            width={cardWidth}
                            height={cardHeight}
                            title="Humor"
                            subtitle="Feliz"
                            iconName="emoticon-happy-outline"
                            iconColor="#E6A63A"
                            backgroundColor="#FFF7EA"
                            onPress={() =>
                                router.push('/student/wellbeing/humor')
                            }
                        >
                            <View style={styles.moodBars}>
                                <View style={[styles.moodBar, { height: 28 }]} />
                                <View style={[styles.moodBar, { height: 48 }]} />
                                <View style={[styles.moodBar, { height: 34 }]} />
                                <View
                                    style={[
                                        styles.moodBarActive,
                                        { height: 62 },
                                    ]}
                                />
                                <View style={[styles.moodBar, { height: 28 }]} />
                            </View>

                            <View style={styles.emojis}>
                                <Text style={styles.emoji}>😔</Text>
                                <Text style={styles.emoji}>😐</Text>
                                <Text style={styles.emoji}>😁</Text>
                            </View>
                        </WellbeingCard>

                        <WellbeingCard
                            width={cardWidth}
                            height={cardHeight}
                            title="Estudo"
                            subtitle={'Seu estudo geral\nde hoje.'}
                            iconName="book-open-page-variant-outline"
                            iconColor="#7DA55C"
                            backgroundColor="#F2F8EC"
                            onPress={() =>
                                router.push('/student/wellbeing/estudo')
                            }
                        >
                            <View style={styles.studyCircle}>
                                <Text style={styles.studyTime}>1h</Text>
                            </View>
                        </WellbeingCard>
                    </View>

                    {/* card final */}
                    <View style={styles.footerCard}>
                        <MaterialCommunityIcons
                            name="sprout-outline"
                            size={28}
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
                            size={22}
                            color={COLORS.primary}
                        />
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    background: {
        flex: 1,
    },

    content: {
        flex: 1,
        paddingTop: 4,
        paddingBottom: 100,
        justifyContent: 'space-between',
    },

    notificationRow: {
        alignItems: 'flex-end',
        marginBottom: 4,
    },

    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    welcomeCard: {
        minHeight: 88,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: '#F3F7ED',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    faceCircle: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#FFF8E4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    welcomeText: {
        flex: 1,
    },

    welcomeTitle: {
        fontSize: 18,
        lineHeight: 22,
        fontWeight: '700',
        color: COLORS.primary,
    },

    welcomeSubtitle: {
        marginTop: 3,
        fontSize: 12,
        color: COLORS.textSecondary,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
    },

    waterCircle: {
        width: 108,
        height: 108,
        borderRadius: 54,
        borderWidth: 10,
        borderColor: '#A9E7EE',
        alignItems: 'center',
        justifyContent: 'center',
    },

    sleepStatus: {
        marginTop: 8,
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '500',
    },

    moodBars: {
        height: 65,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },

    moodBar: {
        width: 10,
        borderRadius: 6,
        backgroundColor: '#FFDDBE',
    },

    moodBarActive: {
        width: 10,
        borderRadius: 6,
        backgroundColor: '#FF9B67',
    },

    emojis: {
        width: '100%',
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    emoji: {
        fontSize: 22,
    },

    studyCircle: {
        width: 108,
        height: 108,
        borderRadius: 54,
        borderWidth: 10,
        borderColor: '#A7C881',
        alignItems: 'center',
        justifyContent: 'center',
    },

    studyTime: {
        fontSize: 30,
        fontWeight: '700',
        color: COLORS.primary,
    },

    footerCard: {
        minHeight: 70,
        maxHeight: 74,
        marginTop: 10,
        borderRadius: 18,
        backgroundColor: '#F4F8EE',
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    footerText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        color: COLORS.textSecondary,
    },

    highlight: {
        color: COLORS.primary,
        fontWeight: '700',
    },
});