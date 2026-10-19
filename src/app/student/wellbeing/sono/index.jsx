import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import Svg, { Circle } from 'react-native-svg';

export default function Sono() {
    const router = useRouter();

    const { width, height } = useWindowDimensions();

    const compactScreen = height < 800;

    const horizontalPadding = Math.max(
        18,
        Math.min(28, width * 0.055)
    );

    const heroHeight = compactScreen
        ? height * 0.43
        : height * 0.45;

    const progressSize = compactScreen
        ? 165
        : Math.min(195, width * 0.47);

    const cardHeight = compactScreen
        ? 78
        : Math.min(92, height * 0.105);

    const progress = 7.5 / 8;

    const radius = progressSize * 0.35;
    const circumference = 2 * Math.PI * radius;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* PARTE LILÁS */}

                <View
                    style={[
                        styles.hero,
                        {
                            height: heroHeight,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.title,
                            compactScreen &&
                                styles.titleCompact,
                        ]}
                    >
                        Sono
                    </Text>

                    {/* PROGRESSO CIRCULAR */}

                    <View
                        style={[
                            styles.sleepProgressContainer,
                            {
                                width: progressSize,
                                height: progressSize,
                            },
                        ]}
                    >
                        <Svg
                            width={progressSize}
                            height={progressSize}
                        >
                            {/* círculo de fundo */}

                            <Circle
                                cx={progressSize / 2}
                                cy={progressSize / 2}
                                r={radius}
                                stroke="#E9D9F2"
                                strokeWidth={12}
                                fill="transparent"
                            />

                            {/* progresso */}

                            <Circle
                                cx={progressSize / 2}
                                cy={progressSize / 2}
                                r={radius}
                                stroke="#FFFFFF"
                                strokeWidth={12}
                                fill="transparent"
                                strokeLinecap="round"
                                strokeDasharray={
                                    circumference
                                }
                                strokeDashoffset={
                                    circumference *
                                    (1 - progress)
                                }
                                rotation="-90"
                                originX={
                                    progressSize / 2
                                }
                                originY={
                                    progressSize / 2
                                }
                            />
                        </Svg>

                        <View
                            style={
                                styles.progressTextContainer
                            }
                        >
                            <Text
                                style={
                                    styles.progressMainText
                                }
                            >
                                7.5h
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.amount}>
                        7.5h / 8h
                    </Text>

                    <Text style={styles.quality}>
                        Qualidade: Boa
                    </Text>
                </View>

                {/* PARTE BRANCA */}

                <View
                    style={[
                        styles.detailsContainer,
                        {
                            paddingHorizontal:
                                horizontalPadding,
                        },
                    ]}
                >
                    {/* HORÁRIO */}

                    <Pressable
                        onPress={() =>
                            router.push(
                                '/student/wellbeing/sono/horario'
                            )
                        }
                        style={({ pressed }) => [
                            styles.infoCard,
                            {
                                height: cardHeight,
                            },
                            pressed &&
                                styles.cardPressed,
                        ]}
                    >
                        <View
                            style={
                                styles.iconContainer
                            }
                        >
                            <MaterialCommunityIcons
                                name="moon-waning-crescent"
                                size={30}
                                color="#B37BC9"
                            />
                        </View>

                        <View style={styles.cardText}>
                            <View
                                style={
                                    styles.cardTitleRow
                                }
                            >
                                <Text
                                    style={
                                        styles.cardTitle
                                    }
                                >
                                    Horário de sono
                                </Text>

                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={21}
                                    color="#AAAAAA"
                                />
                            </View>

                            <Text
                                style={
                                    styles.cardSubtitle
                                }
                            >
                                23:00 às 06:30
                            </Text>
                        </View>
                    </Pressable>

                    {/* PROGRESSO */}

                    <Pressable
                        onPress={() =>
                            router.push(
                                '/student/wellbeing/sono/progresso'
                            )
                        }
                        style={({ pressed }) => [
                            styles.infoCard,
                            {
                                height: cardHeight,
                            },
                            pressed &&
                                styles.cardPressed,
                        ]}
                    >
                        <View
                            style={
                                styles.iconContainer
                            }
                        >
                            <MaterialCommunityIcons
                                name="chart-bar"
                                size={30}
                                color="#B37BC9"
                            />
                        </View>

                        <View style={styles.cardText}>
                            <View
                                style={
                                    styles.cardTitleRow
                                }
                            >
                                <Text
                                    style={
                                        styles.cardTitle
                                    }
                                >
                                    Progresso da noite
                                </Text>

                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={21}
                                    color="#AAAAAA"
                                />
                            </View>

                            <View
                                style={
                                    styles.progressBackground
                                }
                            >
                                <View
                                    style={
                                        styles.progressBar
                                    }
                                />
                            </View>
                        </View>
                    </Pressable>

                    {/* HISTÓRICO */}

                    <Pressable
                        onPress={() =>
                            router.push(
                                '/student/wellbeing/sono/historico'
                            )
                        }
                        style={({ pressed }) => [
                            styles.infoCard,
                            {
                                height: cardHeight,
                            },
                            pressed &&
                                styles.cardPressed,
                        ]}
                    >
                        <View
                            style={
                                styles.iconContainer
                            }
                        >
                            <MaterialCommunityIcons
                                name="calendar-blank-outline"
                                size={30}
                                color="#B37BC9"
                            />
                        </View>

                        <View style={styles.cardText}>
                            <View
                                style={
                                    styles.cardTitleRow
                                }
                            >
                                <Text
                                    style={
                                        styles.cardTitle
                                    }
                                >
                                    Histórico semanal
                                </Text>

                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={21}
                                    color="#AAAAAA"
                                />
                            </View>

                            <Text
                                style={
                                    styles.cardSubtitle
                                }
                            >
                                Segunda a Domingo
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#D7A8E8',
    },

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    hero: {
        backgroundColor: '#D7A8E8',

        alignItems: 'center',

        paddingTop: 10,
        paddingHorizontal: 20,
    },

    title: {
        fontSize: 34,
        fontWeight: '700',

        color: '#FFFFFF',
    },

    titleCompact: {
        fontSize: 30,
    },

    sleepProgressContainer: {
        marginTop: 22,

        borderRadius: 999,

        backgroundColor: '#DEB9EC',

        alignItems: 'center',
        justifyContent: 'center',

        position: 'relative',
    },

    progressTextContainer: {
        position: 'absolute',

        alignItems: 'center',
        justifyContent: 'center',
    },

    progressMainText: {
        fontSize: 42,
        fontWeight: '700',

        color: '#FFFFFF',
    },

    amount: {
        marginTop: 11,

        fontSize: 22,
        fontWeight: '700',

        color: '#FFFFFF',
    },

    quality: {
        marginTop: 7,

        fontSize: 16,

        color: '#FFFFFF',
    },

    detailsContainer: {
        flex: 1,

        marginTop: -24,

        paddingTop: 31,
        paddingBottom: 18,

        borderTopLeftRadius: 34,
        borderTopRightRadius: 34,

        backgroundColor: '#FFFFFF',

        justifyContent: 'flex-start',

        gap: 12,
    },

    infoCard: {
        width: '100%',

        borderRadius: 20,

        backgroundColor: '#FAF5FC',

        paddingHorizontal: 16,

        flexDirection: 'row',
        alignItems: 'center',

        shadowColor: '#000000',

        shadowOffset: {
            width: 0,
            height: 2,
        },

        shadowOpacity: 0.11,
        shadowRadius: 3,

        elevation: 3,
    },

    cardPressed: {
        opacity: 0.75,

        transform: [
            {
                scale: 0.99,
            },
        ],
    },

    iconContainer: {
        width: 38,

        alignItems: 'center',
        justifyContent: 'center',
    },

    cardText: {
        flex: 1,

        marginLeft: 13,
    },

    cardTitleRow: {
        flexDirection: 'row',

        alignItems: 'center',
        justifyContent: 'space-between',
    },

    cardTitle: {
        fontSize: 17,
        fontWeight: '700',

        color: '#B37BC9',
    },

    cardSubtitle: {
        marginTop: 4,

        fontSize: 15,

        color: '#999999',
    },

    progressBackground: {
        width: '100%',
        height: 8,

        marginTop: 9,

        borderRadius: 8,

        overflow: 'hidden',

        backgroundColor: '#E6E6E6',
    },

    progressBar: {
        width: '94%',
        height: '100%',

        borderRadius: 8,

        backgroundColor: '#CE9DE0',
    },
});