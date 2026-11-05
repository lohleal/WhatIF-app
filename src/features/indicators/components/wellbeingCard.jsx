import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import CardWave from './cardWave';

export default function WellbeingCard({
    title,
    subtitle,
    iconName,
    iconColor,
    backgroundColor,
    waveColor,
    width,
    height,
    onPress,
    children,
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                {
                    width,
                    height,
                    backgroundColor,
                    opacity: pressed ? 0.9 : 1,
                },
            ]}
        >
            {/* Onda no fundo do card */}
            <CardWave color={waveColor || backgroundColor} />

            {/* Cabeçalho */}
            <View style={styles.header}>
                <MaterialCommunityIcons
                    name={iconName}
                    size={34}
                    color={iconColor}
                />

                <View style={styles.headerText}>
                    <Text style={styles.title}>
                        {title}
                    </Text>

                    {subtitle ? (
                        <Text style={styles.subtitle}>
                            {subtitle}
                        </Text>
                    ) : null}
                </View>
            </View>

            {/* Conteúdo */}
            <View style={styles.content}>
                {children}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 27,
        padding: 17,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
        position: 'relative',

        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 4,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        zIndex: 1,
    },

    headerText: {
        flex: 1,
    },

    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#222222',
    },

    subtitle: {
        marginTop: 3,
        fontSize: 15,
        lineHeight: 21,
        color: '#777777',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 5,
        zIndex: 1,
    },
});