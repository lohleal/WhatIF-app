import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function IndicatorCard({
    indicator,
    width,
    onPress,
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                {
                    width,
                    backgroundColor: indicator.backgroundColor,
                    opacity: pressed ? 0.85 : 1,
                },
            ]}
        >
            <View style={styles.topCircle} />
            <View style={styles.sideCircle} />

            <MaterialCommunityIcons
                name={indicator.iconName}
                size={32}
                color={indicator.iconColor}
            />

            <Text style={styles.title} numberOfLines={2}>
                {indicator.title}
            </Text>

            <Text style={styles.value}>
                {indicator.value}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        aspectRatio: 0.9,
        borderRadius: 12,

        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 8,
        paddingVertical: 10,

        position: 'relative',
        overflow: 'hidden',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

    topCircle: {
        position: 'absolute',
        top: -10,
        left: '42%',

        width: 20,
        height: 20,
        borderRadius: 10,

        backgroundColor: '#FFFFFF90',
    },

    sideCircle: {
        position: 'absolute',
        right: -10,
        top: '42%',

        width: 20,
        height: 20,
        borderRadius: 10,

        backgroundColor: '#FFFFFF90',
    },

    title: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        color: '#2B2B2B',
    },

    value: {
        marginTop: 5,
        fontSize: 12,
        textAlign: 'center',
        color: '#6E6E6E',
    },
});