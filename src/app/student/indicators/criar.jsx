import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function CriarIndicador() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Criar indicador
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
        fontSize: 24,
        fontWeight: '700',
    },
});