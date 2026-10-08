import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import {
    useLocalSearchParams,
    useRouter,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../../../constants/colors.js';

import IndicatorCard from '../../../features/indicators/components/indicatorCard.jsx';

import useIndicatorsViewModel from '../../../features/indicators/viewmodels/use-indicators-view-model.js';

export default function Indicadores() {
    const router = useRouter();
    const { width, height } =
        useWindowDimensions();

    const { name } =
        useLocalSearchParams();

    const {
        indicators,
        completedCount,
        progress,
    } = useIndicatorsViewModel();

    /*
     * O número de peças NÃO é fixo.
     *
     * Se hoje existirem:
     * 4 indicadores → 4 peças
     * 7 indicadores → 7 peças
     * 12 indicadores → 12 peças
     */
    const columns =
    width < 360 ? 2 : 3;

    const horizontalPadding =
        Math.max(
            16,
            Math.min(
                22,
                width * 0.05
            )
        );

    const puzzleWidth =
        width -
        horizontalPadding * 2;

    /*
     * Faz as peças realmente
     * se sobreporem nos encaixes.
     */
    const overlap =
    width < 360 ? 16 : 20;

    const cardWidth =
        (
            puzzleWidth +
            overlap * (columns - 1)
        ) /
        columns;

    const progressPercentage =
        Math.round(progress * 100);

    function handleIndicatorPress(
        indicator
    ) {
        console.log(
            'Indicador selecionado:',
            indicator.id
        );
    }

  function handleCreateIndicator() {
    router.push(
        '/student/indicators/criar'
    );
}

    return (
        <ImageBackground
            source={require(
                '../../../../assets/images/indicators-background.png'
            )}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView
                style={styles.safeArea}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.content,
                        {
                            paddingHorizontal:
                                horizontalPadding,
                        },
                    ]}
                    showsVerticalScrollIndicator={
                        false
                    }
                >
                    {/* TOPO */}

                    <View style={styles.topRow}>
                        <View style={styles.header}>
                            <Text
                                style={
                                    styles.greeting
                                }
                            >
                                Olá,{' '}
                                {name ||
                                    'estudante'}
                                ! 💚
                            </Text>

                            <Text
                                style={
                                    styles.subtitle
                                }
                            >
                                Que tal completar
                                suas metas de hoje?
                            </Text>
                        </View>

                        <Pressable
                            style={
                                styles.iconButton
                            }
                        >
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={24}
                                color={
                                    COLORS.primary
                                }
                            />
                        </Pressable>
                    </View>

                    {/* MENSAGEM */}

                    <View
                        style={styles.message}
                    >
                        <MaterialCommunityIcons
                            name="puzzle-outline"
                            size={27}
                            color={
                                COLORS.primary
                            }
                        />

                        <Text
                            style={
                                styles.messageText
                            }
                        >
                            Cada meta concluída
                            completa uma parte do
                            seu{' '}
                            <Text
                                style={
                                    styles.highlight
                                }
                            >
                                quebra-cabeça.
                            </Text>
                        </Text>
                    </View>

                    {/* QUEBRA-CABEÇA */}

                    {indicators.length > 0 ? (
                        <View
                            style={
                                styles.puzzleContainer
                            }
                        >
                            {indicators.map(
                                (
                                    indicator,
                                    index
                                ) => (
                                    <IndicatorCard
                                        key={
                                            indicator.id
                                        }
                                        indicator={
                                            indicator
                                        }
                                        width={
                                            cardWidth
                                        }
                                        index={
                                            index
                                        }
                                        total={
                                            indicators.length
                                        }
                                        columns={
                                            columns
                                        }
                                        overlap={
                                            overlap
                                        }
                                        onPress={() =>
                                            handleIndicatorPress(
                                                indicator
                                            )
                                        }
                                    />
                                )
                            )}
                        </View>
                    ) : (
                        <View
                            style={
                                styles.emptyContainer
                            }
                        >
                            <MaterialCommunityIcons
                                name="puzzle-outline"
                                size={48}
                                color="#A6B59B"
                            />

                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                Nenhuma peça para
                                hoje
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Adicione um indicador
                                para começar seu
                                quebra-cabeça.
                            </Text>
                        </View>
                    )}

                    {/* PROGRESSO */}

                    <View
                        style={
                            styles.progressSection
                        }
                    >
                        <View
                            style={
                                styles.progressCard
                            }
                        >
                            <View
                                style={
                                    styles.progressIcon
                                }
                            >
                                <MaterialCommunityIcons
                                    name="puzzle"
                                    size={27}
                                    color={
                                        COLORS.primary
                                    }
                                />
                            </View>

                            <View
                                style={
                                    styles.progressInfo
                                }
                            >
                                <View
                                    style={
                                        styles.progressHeader
                                    }
                                >
                                    <Text
                                        style={
                                            styles.progressTitle
                                        }
                                    >
                                        Progresso de
                                        hoje
                                    </Text>

                                    <Text
                                        style={
                                            styles.progressPercentage
                                        }
                                    >
                                        {
                                            progressPercentage
                                        }
                                        %
                                    </Text>
                                </View>

                                <Text
                                    style={
                                        styles.progressText
                                    }
                                >
                                    {
                                        completedCount
                                    }
                                    /
                                    {
                                        indicators.length
                                    }{' '}
                                    peças completas
                                </Text>

                                <View
                                    style={
                                        styles.progressBackground
                                    }
                                >
                                    <View
                                        style={[
                                            styles.progressBar,
                                            {
                                                width: `${progressPercentage}%`,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* FRASE FINAL */}

                    <Text
                        style={
                            styles.footerMessage
                        }
                    >
                        Pequenas ações diárias
                        constroem uma{' '}
                        <Text
                            style={
                                styles.highlight
                            }
                        >
                            grande transformação.
                        </Text>
                    </Text>
                </ScrollView>

                {/* BOTÃO + */}

                <Pressable
                    style={({ pressed }) => [
                        styles.floatingButton,

                        pressed &&
                            styles.floatingButtonPressed,
                    ]}
                    onPress={
                        handleCreateIndicator
                    }
                >
                    <MaterialCommunityIcons
                        name="plus"
                        size={30}
                        color="#FFFFFF"
                    />
                </Pressable>
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
        paddingTop: 12,

        /*
         * Reserva espaço para a
         * barra inferior absoluta.
         */
        paddingBottom: 125,
    },

    topRow: {
        flexDirection: 'row',

        justifyContent:
            'space-between',

        alignItems: 'flex-start',
    },

    header: {
        flex: 1,
        paddingRight: 12,
    },

    greeting: {
        fontSize: 31,
        fontWeight: '700',

        color: COLORS.text,
    },

    subtitle: {
        marginTop: 7,

        fontSize: 16,
        lineHeight: 22,

        color: '#5E5E5E',
    },

    iconButton: {
        width: 42,
        height: 42,

        borderRadius: 21,

        backgroundColor:
            '#FFFFFFC9',

        alignItems: 'center',
        justifyContent: 'center',
    },

    message: {
        marginTop: 24,
        marginBottom: 22,

        flexDirection: 'row',
        alignItems: 'center',

        gap: 11,

        paddingHorizontal: 5,
    },

    messageText: {
        flex: 1,

        fontSize: 16,
        lineHeight: 22,

        fontWeight: '600',

        color: COLORS.text,
    },

    highlight: {
        color: COLORS.primary,
        fontWeight: '700',
    },

    puzzleContainer: {
        width: '100%',

        flexDirection: 'row',
        flexWrap: 'wrap',

        alignSelf: 'center',

        /*
         * Um pouco de respiro
         * ao redor do quebra-cabeça.
         */
        paddingVertical: 4,
    },

    emptyContainer: {
        minHeight: 240,

        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 30,
    },

    emptyTitle: {
        marginTop: 12,

        fontSize: 18,
        fontWeight: '700',

        color: COLORS.text,
    },

    emptyText: {
        marginTop: 6,

        fontSize: 14,
        lineHeight: 20,

        textAlign: 'center',

        color: '#777777',
    },

    /*
     * Essa View separa fisicamente
     * o progresso do quebra-cabeça.
     */
    progressSection: {
        width: '100%',

        marginTop: 34,

        paddingTop: 4,
    },

    progressCard: {
        minHeight: 92,

        borderRadius: 22,

        backgroundColor:
            '#FFFFFFE8',

        paddingHorizontal: 17,
        paddingVertical: 15,

        flexDirection: 'row',
        alignItems: 'center',

        shadowColor: '#000',

        shadowOffset: {
            width: 0,
            height: 2,
        },

        shadowOpacity: 0.06,

        shadowRadius: 4,

        elevation: 2,
    },

    progressIcon: {
        width: 48,
        height: 48,

        borderRadius: 24,

        backgroundColor:
            '#EEF5E7',

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 13,
    },

    progressInfo: {
        flex: 1,
    },

    progressHeader: {
        flexDirection: 'row',

        justifyContent:
            'space-between',

        alignItems: 'center',
    },

    progressTitle: {
        fontSize: 15,
        fontWeight: '700',

        color: COLORS.text,
    },

    progressPercentage: {
        fontSize: 16,
        fontWeight: '700',

        color: COLORS.primary,
    },

    progressText: {
        marginTop: 4,
        marginBottom: 8,

        fontSize: 13,

        color: '#666666',
    },

    progressBackground: {
        width: '100%',
        height: 8,

        borderRadius: 8,

        backgroundColor:
            '#E7E7E7',

        overflow: 'hidden',
    },

    progressBar: {
        height: '100%',

        borderRadius: 8,

        backgroundColor:
            COLORS.primary,
    },

    footerMessage: {
        marginTop: 22,

        paddingHorizontal: 18,

        textAlign: 'center',

        fontSize: 14,
        lineHeight: 20,

        color: COLORS.text,
    },

    floatingButton: {
        position: 'absolute',

        right: 21,

        /*
         * Sua TabBar possui 88px.
         * Então o botão fica acima dela.
         */
        bottom: 101,

        width: 58,
        height: 58,

        borderRadius: 29,

        backgroundColor:
            COLORS.primary,

        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: '#000',

        shadowOffset: {
            width: 0,
            height: 4,
        },

        shadowOpacity: 0.16,

        shadowRadius: 6,

        elevation: 6,
    },

    floatingButtonPressed: {
        opacity: 0.82,

        transform: [
            {
                scale: 0.95,
            },
        ],
    },
});