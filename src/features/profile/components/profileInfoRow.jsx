
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { COLORS } from '../../../constants/colors';

export default function ProfileInfoRow({
    icon,
    label,
    value,
    onPress,
    password = false,
}) {
    const Conteudo = (
        <>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                    name={icon}
                    size={22}
                    color={COLORS.primary}
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.label}>
                    {label}
                </Text>

                <Text
                    style={styles.value}
                    numberOfLines={1}
                >
                    {value}
                </Text>
            </View>

            {password ? (
                <MaterialCommunityIcons
                    name="eye-off-outline"
                    size={24}
                    color="#777777"
                />
            ) : onPress ? (
                <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={COLORS.primary}
                />
            ) : null}
        </>
    );

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.container,
                    pressed && styles.pressed,
                ]}
            >
                {Conteudo}
            </Pressable>
        );
    }

    return (
        <View style={styles.container}>
            {Conteudo}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 76,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 22,
        backgroundColor: '#FFFFFFE8',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
        overflow: 'hidden',
    },

    pressed: {
        opacity: 0.75,
    },

    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#EEF7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    textContainer: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    label: {
        fontSize: 12,
        color: COLORS.textSecondary,
        backgroundColor: 'transparent',
    },

    value: {
        marginTop: 2,
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.text,
        backgroundColor: 'transparent',
    },
});
