import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WellbeingCard({
    title,
    subtitle,
    iconName,
    iconColor,
    backgroundColor,
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
                    opacity: pressed ? 0.8 : 1,
                },
            ]}
        >
            <View style={styles.header}>
                <MaterialCommunityIcons
                    name={iconName}
                    size={30}
                    color={iconColor}
                />

                <View style={styles.headerText}>
                    <Text style={styles.title}>
                        {title}
                    </Text>

                    <Text style={styles.subtitle}>
                        {subtitle}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                {children}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 22,
        padding: 18,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },

    headerText: {
        flex: 1,
    },

    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222222',
    },

    subtitle: {
        marginTop: 4,
        fontSize: 14,
        lineHeight: 20,
        color: '#777777',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});