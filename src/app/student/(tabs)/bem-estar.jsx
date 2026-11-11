
import {
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { useEffect, useState } from 'react';

import { auth, db } from '../../../services/firebase/firebaseConfig';

import {
    collection,
    doc,
    onSnapshot,
} from 'firebase/firestore';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../../../constants/colors';
import WellbeingCard from '../../../features/indicators/components/wellbeingCard';

export default function BemEstar() {
    const router = useRouter();

    const [aguaHoje, setAguaHoje] = useState(0);
    const [objetivoAgua, setObjetivoAgua] = useState(2000);

    useEffect(() => {
        const usuario = auth.currentUser;

        if (!usuario) return;

        // Buscar objetivo diário
        const objetivoRef = doc(
            db,
            'users',
            usuario.uid,
            'waterObjectives',
            'objective'
        );

        const unsubscribeObjetivo = onSnapshot(
            objetivoRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const dados = snapshot.data();

                    if (dados.dailyGoalMl > 0) {
                        setObjetivoAgua(dados.dailyGoalMl);
                    }
                }
            },
            (erro) => console.error('Erro ao buscar objetivo:', erro)
        );

        // Buscar registros de água
        const registrosRef = collection(
            db,
            'users',
            usuario.uid,
            'waterRecords'
        );

        const unsubscribeRegistros = onSnapshot(
            registrosRef,
            (snapshot) => {
                const hoje = new Date();
                const ano = hoje.getFullYear();
                const mes = String(hoje.getMonth() + 1).padStart(2, '0');
                const dia = String(hoje.getDate()).padStart(2, '0');

                const hojeKey = `${ano}-${mes}-${dia}`;

                const total = snapshot.docs
                    .filter((documento) => {
                        return documento.data().dateKey === hojeKey;
                    })
                    .reduce((soma, documento) => {
                        return soma + (documento.data().amountMl || 0);
                    }, 0);

                setAguaHoje(total);
            },
            (erro) => console.error('Erro ao buscar água:', erro)
        );

        return () => {
            unsubscribeObjetivo();
            unsubscribeRegistros();
        };
    }, []);

    const { width, height } = useWindowDimensions();

    const compactScreen = height < 800;

    const horizontalPadding = Math.max(
        18,
        Math.min(28, width * 0.055)
    );

    const contentWidth = width - horizontalPadding * 2;
    const cardWidth = contentWidth * 0.48;

    const cardHeight = compactScreen ? 208 : 225;

    const formatarLitros = (ml) => {
        return (ml / 1000).toLocaleString('pt-BR', {
            maximumFractionDigits: 2,
        });
    };

    return (
        <ImageBackground
            source={require('../../../../assets/images/indicators-background.png')}
            resizeMode="cover"
            style={styles.background}
        >
            <SafeAreaView style={styles.safeArea}>
                <View
                    style={[
                        styles.content,
                        {
                            paddingHorizontal: horizontalPadding,
                        },
                    ]}
                >
                    {/* TOPO */}
                    <View style={styles.notificationRow}>
                        <Pressable style={styles.notificationButton}>
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={26}
                                color={COLORS.primary}
                            />
                        </Pressable>
                    </View>

                    {/* CARD DE MENSAGEM */}
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
                                Como você está{' \n'}
                                se sentindo hoje?
                            </Text>

                            <Text style={styles.welcomeSubtitle}>
                                Continue cuidando de você.
                            </Text>
                        </View>
                    </View>

                    {/* GRADE DOS CARDS */}
                    <View style={styles.grid}>

                        {/* ÁGUA */}
                        <WellbeingCard
                            width={cardWidth}
                            height={cardHeight}
                            title="Água"
                            subtitle={`${formatarLitros(aguaHoje)}L/${formatarLitros(objetivoAgua)}L`}
                            iconName="water"
                            iconColor="#48A9B6"
                            backgroundColor="#EAF7FC"
                            waveColor="#B8EAF5"
                            onPress={() =>
                                router.push('/student/wellbeing/hidratacao')
                            }
                        >
                            <View style={styles.waterCircle}>
                                <MaterialCommunityIcons
                                    name="water-outline"
                                    size={60}
                                    color="#69C6D2"
                                />
                            </View>
                        </WellbeingCard>

                        {/* SONO */}
                        <WellbeingCard
                            width={cardWidth}
                            height={cardHeight}
                            title="Sono"
                            subtitle="7h 30min"
                            iconName="moon-waning-crescent"
                            iconColor="#7155A5"
                            backgroundColor="#F6F0FC"
                            waveColor="#DCCCF2"
                            onPress={() =>
                                router.push('/student/wellbeing/sono')
                            }
                        >
                            <MaterialCommunityIcons
                                name="weather-night"
                                size={80}
                                color="#A997C7"
                            />

                            <Text style={styles.sleepStatus}>
                                Bom
                            </Text>
                        </WellbeingCard>

                        {/* HUMOR */}
                        <WellbeingCard
                            width={cardWidth}
                            height={cardHeight}
                            title="Humor"
                            subtitle="Ansioso"
                            iconName="emoticon-happy-outline"
                            iconColor="#E6A63A"
                            backgroundColor="#FFF5E8"
                            waveColor="#FFE0C3"
                            onPress={() =>
                                router.push('/student/wellbeing/humor')
                            }
                        >
                            <View style={styles.moodBars}>
                                <View style={[styles.moodBar, { height: 40 }]} />
                                <View style={[styles.moodBar, { height: 65 }]} />
                                <View style={[styles.moodBar, { height: 48 }]} />

                                <View
                                    style={[
                                        styles.moodBarActive,
                                        { height: 78 },
                                    ]}
                                />

                                <View style={[styles.moodBar, { height: 40 }]} />
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
                            height={cardHeight}
                            title="Estudo"
                            iconName="book-open-page-variant-outline"
                            iconColor="#7DA55C"
                            backgroundColor="#F0F7E9"
                            waveColor="#CDE9C2"
                            onPress={() =>
                                router.push('/student/wellbeing/estudo')
                            }
                        >
                            <View style={styles.studyCircle}>
                                <Text style={styles.studyTime}>
                                    1h
                                </Text>
                            </View>
                        </WellbeingCard>

                    </View>

                    {/* CARD FINAL */}
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
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
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
        minHeight: 80,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: '#F3F7ED',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
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
        fontSize: 20,
        lineHeight: 22,
        fontWeight: '700',
        color: COLORS.primary,
    },

    welcomeSubtitle: {
        marginTop: 3,
        fontSize: 13,
        color: COLORS.textSecondary,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 15,
    },

    // ÁGUA
    waterCircle: {
        width: 100,
        height: 100,
        borderRadius: 60,
        borderWidth: 10,
        borderColor: '#A9E7EE',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // SONO
    sleepStatus: {
        marginTop: 5,
        paddingHorizontal: 25,
        paddingVertical: 5,
        overflow: 'hidden',
        borderRadius: 20,
        backgroundColor: '#E4EEDB',
        color: '#28643C',
        fontSize: 15,
        fontWeight: '800',
        textAlign: 'center',
    },

    // HUMOR
    moodBars: {
        height: 75,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },

    moodBar: {
        width: 10,
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
        marginTop: 6,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    emoji: {
        fontSize: 23,
    },

    // ESTUDO
    studyCircle: {
        width: 100,
        height: 100,
        borderRadius: 60,
        borderWidth: 10,
        borderColor: '#A7C881',
        alignItems: 'center',
        justifyContent: 'center',
    },

    studyTime: {
        fontSize: 34,
        fontWeight: '800',
        color: '#287C46',
    },

    // CARD FINAL
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
