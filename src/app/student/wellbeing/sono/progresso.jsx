import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function ProgressoSono() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Progresso da noite
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },

    title: {
        fontSize: 26,
        fontWeight: '700',
    },
});