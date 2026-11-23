
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth } from '../../../services/firebase/firebaseConfig';

// Correspondência dos dias da semana
const DIAS_SEMANA = {
    Domingo: 1,
    Segunda: 2,
    Terça: 3,
    Quarta: 4,
    Quinta: 5,
    Sexta: 6,
    Sábado: 7,
};

// Identifica os lembretes de cada usuário e indicador
function chaveLembrete(indicadorId) {
    const uid = auth.currentUser?.uid;

    if (!uid) {
        throw new Error('Usuário não autenticado.');
    }

    return `@whatif/lembretes/${uid}/${indicadorId}`;
}

// Solicita permissão para enviar notificações
async function prepararNotificacoes() {
    let permissao = await Notifications.getPermissionsAsync();

    if (!permissao.granted) {
        permissao = await Notifications.requestPermissionsAsync();
    }

    return permissao.granted;
}

// Cancela os lembretes anteriores de um indicador
export async function cancelarLembretesIndicador(indicadorId) {
    const chave = chaveLembrete(indicadorId);

    const dadosSalvos = await AsyncStorage.getItem(chave);

    const identificadores = dadosSalvos
        ? JSON.parse(dadosSalvos)
        : [];

    for (const identificador of identificadores) {
        await Notifications.cancelScheduledNotificationAsync(
            identificador
        );
    }

    await AsyncStorage.removeItem(chave);
}

// Agenda os lembretes do indicador
export async function agendarLembretesIndicador(
    indicadorId,
    indicador
) {
    // Cancela os agendamentos anteriores
    await cancelarLembretesIndicador(indicadorId);

    // Verifica se o lembrete está ativado
    if (
        !indicador.reminderEnabled ||
        !indicador.reminderTime ||
        indicador.active === false
    ) {
        return false;
    }

    // Verifica a permissão
    const permitido = await prepararNotificacoes();

    if (!permitido) {
        console.warn(
            '[Notificações] Permissão não concedida.'
        );

        return false;
    }

    // Separa hora e minuto
    const [hora, minuto] = indicador.reminderTime
        .split(':')
        .map(Number);

    if (
        !Number.isInteger(hora) ||
        !Number.isInteger(minuto) ||
        hora < 0 ||
        hora > 23 ||
        minuto < 0 ||
        minuto > 59
    ) {
        throw new Error('Horário do lembrete inválido.');
    }

    let gatilhos = [];

    // Frequência diária
    if (indicador.frequency === 'Todos os dias') {
        gatilhos.push({
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hora,
            minute: minuto,
        });
    }

    // Frequência em dias específicos
    else if (indicador.frequency === 'Dias específicos') {
        const dias = (indicador.selectedDays || [])
            .map((dia) => DIAS_SEMANA[dia])
            .filter(Boolean);

        if (dias.length === 0) {
            throw new Error(
                'Selecione pelo menos um dia para o lembrete.'
            );
        }

        gatilhos = dias.map((dia) => ({
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: dia,
            hour: hora,
            minute: minuto,
        }));
    } else {
        throw new Error('Frequência do lembrete inválida.');
    }

    const identificadores = [];

    // Agenda as notificações
    try {
        for (const gatilho of gatilhos) {
            const identificador =
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Hora de cuidar de você! 💚',
                        body: `Não esqueça do seu indicador: ${indicador.name}`,
                        data: {
                            indicadorId,
                            tipo: 'lembrete_indicador',
                        },
                    },
                    trigger: gatilho,
                });

            identificadores.push(identificador);
        }

        // Salva os identificadores no dispositivo
        const chave = chaveLembrete(indicadorId);

        await AsyncStorage.setItem(
            chave,
            JSON.stringify(identificadores)
        );

        console.log(
            '[Notificações] Lembretes agendados:',
            indicadorId,
            identificadores
        );

        return true;

    } catch (erro) {
        // Cancela os agendamentos parciais caso ocorra uma falha
        for (const identificador of identificadores) {
            await Notifications.cancelScheduledNotificationAsync(
                identificador
            );
        }

        console.error(
            '[Notificações] Erro ao agendar:',
            erro
        );

        throw erro;
    }
}
