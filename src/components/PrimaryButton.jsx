import {
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';

import { COLORS } from '../constants/colors';

export default function PrimaryButton({
    title,
    onPress,
}) {
    return (
        <Pressable
            style={styles.button}
            onPress={onPress}
        >
            <Text style={styles.text}>
                {title}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        minHeight: 56,
        borderRadius: 28,

        backgroundColor: COLORS.primary,

        alignItems: 'center',
        justifyContent: 'center',
    },

    text: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
});