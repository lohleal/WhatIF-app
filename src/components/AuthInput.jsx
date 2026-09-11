import { StyleSheet, TextInput } from 'react-native';

import { COLORS } from '../constants/colors';

export default function AuthInput({
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    autoCorrect = true,
    returnKeyType,
    onFocus,
}) {
    return (
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textSecondary}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            returnKeyType={returnKeyType}
            onFocus={onFocus}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        minHeight: 56,

        backgroundColor: COLORS.surface,
        borderRadius: 28,

        paddingHorizontal: 22,

        marginBottom: 12,

        fontSize: 16,
        color: COLORS.text,

        borderWidth: 1,
        borderColor: COLORS.border,
    },
});