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
                    opacity: pressed ? 0.75 : 1,
                },
            ]}
        >
            <Text style={styles.icon}>
                {indicator.icon}
            </Text>

            <Text style={styles.title}>
                {indicator.title}
            </Text>

            <Text style={styles.value}>
                {indicator.value}
            </Text>

            {/* detalhe para lembrar uma peça */}
            <View style={styles.puzzleCircle} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        aspectRatio: 0.9,

        borderRadius: 8,

        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 6,

        overflow: 'hidden',
    },

    icon: {
        fontSize: 30,
        marginBottom: 8,
    },

    title: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        color: '#272727',
    },

    value: {
        marginTop: 6,

        fontSize: 12,
        textAlign: 'center',
        color: '#777777',
    },

    puzzleCircle: {
        position: 'absolute',

        width: 24,
        height: 24,

        borderRadius: 12,

        right: -12,
        top: '42%',

        backgroundColor: '#FFFFFF',
    },
});