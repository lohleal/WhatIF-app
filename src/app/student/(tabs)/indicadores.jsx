import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
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

import { COLORS } from '../../../constants/colors.js';
import IndicatorCard from '../../../features/indicators/components/indicatorCard.jsx';
import useIndicatorsViewModel from '../../../features/indicators/viewmodels/use-indicators-view-model.js.js';

export default function Indicadores() {
    const { width } = useWindowDimensions();
    const { name } = useLocalSearchParams();

    const {
        indicators,
        completedCount,
        progress,
    } = useIndicatorsViewModel();

    const columns = width < 380 ? 3 : 4;
    const horizontalPadding = 20;
    const gap = 8;

    const availableWidth =
        width -
        horizontalPadding * 2 -
        gap * (columns - 1);

    const cardWidth = availableWidth / columns;
    const progressPercentage =
        Math.round(progress * 100);

    function handleIndicatorPress(indicator) {
        console.log(
            'Indicador selecionado:',
            indicator.id
        );
    }

    function handleCreateIndicator() {
        console.log('Criar novo indicador');
    }

    return (
        <ImageBackground
            source={require('../../../../assets/images/indicators-background.png')}
            style={styles.background}
            resizeMode="cover"
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
                    <View style={styles.topRow}>
                        <View style={styles.header}>
                            <Text style={styles.greeting}>
                                Olá, {name || 'estudante'}! 💚
                            </Text>

                            <Text style={styles.subtitle}>
                                Vamos cuidar do seu bem-estar
                                hoje?
                            </Text>
                        </View>

                        <Pressable style={styles.iconButton}>
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={24}
                                color={COLORS.primary}
                            />
                        </Pressable>
                    </View>

                    <View style={styles.message}>
                        <MaterialCommunityIcons
                            name="heart-outline"
                            size={28}
                            color={COLORS.primary}
                        />

                        <Text style={styles.messageText}>
                            Complete suas{' '}
                            <Text style={styles.highlight}>
                                metas
                            </Text>{' '}
                            de hoje e monte seu
                            quebra-cabeça!
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.grid,
                            {
                                gap,
                            },
                        ]}
                    >
                        {indicators.map((indicator) => (
                            <IndicatorCard
                                key={indicator.id}
                                indicator={indicator}
                                width={cardWidth}
                                onPress={() =>
                                    handleIndicatorPress(
                                        indicator
                                    )
                                }
                            />
                        ))}
                    </View>

                    <View style={styles.progressCard}>
                        <View style={styles.progressIcon}>
                            <MaterialCommunityIcons
                                name="puzzle-outline"
                                size={28}
                                color={COLORS.primary}
                            />
                        </View>

                        <View style={styles.progressInfo}>
                            <View style={styles.progressHeader}>
                                <Text
                                    style={styles.progressTitle}
                                >
                                    Progresso de hoje
                                </Text>

                                <Text
                                    style={
                                        styles.progressPercentage
                                    }
                                >
                                    {progressPercentage}%
                                </Text>
                            </View>

                            <Text style={styles.progressText}>
                                {completedCount}/
                                {indicators.length} peças
                                completas
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

                    <Text style={styles.footerMessage}>
                        Pequenas ações diárias constroem uma{' '}
                        <Text style={styles.highlight}>
                            grande transformação.
                        </Text>
                    </Text>
                </ScrollView>

                <Pressable
                    style={styles.floatingButton}
                    onPress={handleCreateIndicator}
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
        paddingTop: 18,
        paddingBottom: 110,
    },

    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    header: {
        flex: 1,
        paddingRight: 12,
    },

    greeting: {
        fontSize: 34,
        fontWeight: '700',
        color: COLORS.text,
    },

    subtitle: {
        marginTop: 10,
        fontSize: 18,
        lineHeight: 25,
        color: '#5E5E5E',
    },

    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FFFFFFC0',
        alignItems: 'center',
        justifyContent: 'center',
    },

    message: {
        marginTop: 34,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    messageText: {
        flex: 1,
        fontSize: 17,
        lineHeight: 25,
        fontWeight: '600',
        color: COLORS.text,
    },

    highlight: {
        color: COLORS.primary,
        fontWeight: '700',
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    progressCard: {
        marginTop: 28,
        borderRadius: 24,
        backgroundColor: '#FFFFFFE6',
        padding: 18,
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
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#EEF5E7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    progressInfo: {
        flex: 1,
    },

    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    progressTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },

    progressPercentage: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },

    progressText: {
        marginTop: 6,
        marginBottom: 10,
        fontSize: 14,
        color: '#666666',
    },

    progressBackground: {
        width: '100%',
        height: 10,
        borderRadius: 10,
        backgroundColor: '#E7E7E7',
        overflow: 'hidden',
    },

    progressBar: {
        height: '100%',
        borderRadius: 10,
        backgroundColor: COLORS.primary,
    },

    footerMessage: {
        marginTop: 26,
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 22,
        color: COLORS.text,
        paddingHorizontal: 16,
    },

    floatingButton: {
        position: 'absolute',
        right: 22,
        bottom: 95,

        width: 60,
        height: 60,
        borderRadius: 30,

        backgroundColor: COLORS.primary,

        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
});