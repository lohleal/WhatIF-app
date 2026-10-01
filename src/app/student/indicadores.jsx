import {
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import IndicatorCard from '../../features/indicators/components/indicatorCard';
import useIndicatorsViewModel from '../../features/indicators/viewmodels/useIndicatorsViewModel';

import { COLORS } from '../../constants/colors';

export default function Indicadores() {
    const { width } = useWindowDimensions();

    const {
        indicators,
        completedCount,
        progress,
    } = useIndicatorsViewModel();

    const columns = width < 380 ? 3 : 4;

    const horizontalPadding = 20;
    const gap = 6;

    const availableWidth =
        width -
        horizontalPadding * 2 -
        gap * (columns - 1);

    const cardWidth =
        availableWidth / columns;

    const progressPercentage =
        Math.round(progress * 100);

    function handleIndicatorPress(indicator) {
        console.log(
            'Indicador selecionado:',
            indicator.id
        );
    }

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
                <View style={styles.header}>
                    <Text style={styles.greeting}>
                        Olá, Gil!
                    </Text>

                    <Text style={styles.subtitle}>
                        Cada escolha positiva{'\n'}
                        completa uma parte de você.
                    </Text>
                </View>

                <View style={styles.message}>
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
                    <View style={styles.progressInfo}>
                        <Text style={styles.progressTitle}>
                            Progresso de hoje
                        </Text>

                        <Text style={styles.progressText}>
                            {completedCount}/
                            {indicators.length} peças
                            completas
                        </Text>
                    </View>

                    <View style={styles.progressRight}>
                        <Text
                            style={
                                styles.progressPercentage
                            }
                        >
                            {progressPercentage}%
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
                    Pequenas ações diárias constroem
                    uma{' '}
                    <Text style={styles.highlight}>
                        grande transformação.
                    </Text>
                </Text>
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
        paddingTop: 30,
        paddingBottom: 40,
    },

    header: {
        marginBottom: 45,
    },

    greeting: {
        fontSize: 38,
        fontWeight: '700',
        color: COLORS.text,
    },

    subtitle: {
        marginTop: 12,

        fontSize: 17,
        lineHeight: 25,

        color: COLORS.textSecondary,
    },

    message: {
        marginBottom: 30,
        paddingHorizontal: 20,
    },

    messageText: {
        fontSize: 19,
        lineHeight: 28,
        fontWeight: '600',

        textAlign: 'center',

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
        marginTop: 30,

        minHeight: 100,

        borderRadius: 22,

        backgroundColor: '#FAFAFA',

        paddingHorizontal: 20,
        paddingVertical: 18,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    progressInfo: {
        flex: 1,
    },

    progressTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },

    progressText: {
        marginTop: 6,

        fontSize: 14,
        color: COLORS.textSecondary,
    },

    progressRight: {
        width: '45%',
        alignItems: 'flex-end',
    },

    progressPercentage: {
        marginBottom: 10,

        fontSize: 17,
        fontWeight: '700',

        color: COLORS.primary,
    },

    progressBackground: {
        width: '100%',
        height: 9,

        borderRadius: 5,

        overflow: 'hidden',

        backgroundColor: '#E7E7E7',
    },

    progressBar: {
        height: '100%',

        borderRadius: 5,

        backgroundColor: COLORS.primary,
    },

    footerMessage: {
        marginTop: 35,
        paddingHorizontal: 35,

        textAlign: 'center',

        fontSize: 15,
        lineHeight: 22,

        color: COLORS.text,
    },
});