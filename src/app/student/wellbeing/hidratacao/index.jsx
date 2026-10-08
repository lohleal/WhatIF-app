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

export default function Hidratacao() {
    const router = useRouter();

    const { width, height } = useWindowDimensions();

    const compactScreen = height < 800;

    const horizontalPadding = Math.max(
        18,
        Math.min(28, width * 0.055)
    );

    const heroHeight = compactScreen
        ? height * 0.39
        : height * 0.41;

    const waterCircleSize = compactScreen
        ? 125
        : Math.min(150, width * 0.36);

    const cardHeight = compactScreen
        ? 78
        : Math.min(92, height * 0.105);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* PARTE AZUL */}

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
                        Hidratação
                    </Text>

                    <View
                        style={[
                            styles.waterOuterCircle,
                            {
                                width: waterCircleSize,
                                height: waterCircleSize,
                                borderRadius:
                                    waterCircleSize / 2,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.waterInnerCircle,
                                {
                                    width:
                                        waterCircleSize *
                                        0.7,
                                    height:
                                        waterCircleSize *
                                        0.7,
                                    borderRadius:
                                        (waterCircleSize *
                                            0.7) /
                                        2,
                                },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="water"
                                size={
                                    compactScreen ? 52 : 62
                                }
                                color="#FFFFFF"
                            />
                        </View>
                    </View>

                    <Text style={styles.amount}>
                        1200ml / 2000ml
                    </Text>

                    <Text style={styles.encouragement}>
                        Continue se hidratando!
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
                    {/* ÚLTIMA INGESTÃO */}

                    <View
                        style={[
                            styles.infoCard,
                            {
                                height: cardHeight,
                            },
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                                name="clock-outline"
                                size={29}
                                color="#69AAB6"
                            />
                        </View>

                        <View style={styles.cardText}>
                            <Text style={styles.cardTitle}>
                                Última ingestão
                            </Text>

                            <Text style={styles.cardSubtitle}>
                                09:30 - 300ml
                            </Text>
                        </View>
                    </View>

                    {/* PROGRESSO */}

                    <Pressable
                        onPress={() =>
                            router.push(
                                '/student/wellbeing/hidratacao/progresso'
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
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                                name="chart-bar"
                                size={29}
                                color="#69AAB6"
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
                                    Progresso do dia
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
                                '/student/wellbeing/hidratacao/historico'
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
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                                name="calendar-blank-outline"
                                size={29}
                                color="#69AAB6"
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

                            <Text style={styles.cardSubtitle}>
                                Domingo a Domingo
                            </Text>
                        </View>
                    </Pressable>
                </View>

                {/* BOTÃO + */}

                <Pressable
                    style={({ pressed }) => [
                        styles.addButton,
                        pressed &&
                        styles.addButtonPressed,
                    ]}
                    onPress={() =>
                        router.push(
                            '/student/wellbeing/hidratacao/registro'
                        )
                    }
                >
                    <MaterialCommunityIcons
                        name="plus"
                        size={30}
                        color="#FFFFFF"
                    />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#AFE0EA',
    },

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    hero: {
        backgroundColor: '#AFE0EA',

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

    waterOuterCircle: {
        marginTop: 22,

        backgroundColor: '#C9EBF1',

        alignItems: 'center',
        justifyContent: 'center',
    },

    waterInnerCircle: {
        borderWidth: 5,
        borderColor: '#FFFFFF',

        backgroundColor: '#B4E2EA',

        alignItems: 'center',
        justifyContent: 'center',
    },

    amount: {
        marginTop: 14,

        fontSize: 23,
        fontWeight: '400',

        color: '#FFFFFF',
    },

    encouragement: {
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

        jjustifyContent: 'flex-start',
        gap: 14,
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

        color: '#65A4B1',
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
        width: '60%',
        height: '100%',

        borderRadius: 8,

        backgroundColor: '#AFE5EC',
    },

    addButton: {
        position: 'absolute',

        right: 22,
        bottom: 22,

        width: 58,
        height: 58,

        borderRadius: 29,

        backgroundColor: '#65AAB7',

        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.18,
        shadowRadius: 5,

        elevation: 6,
    },

    addButtonPressed: {
        opacity: 0.8,

        transform: [
            {
                scale: 0.95,
            },
        ],
    },
});