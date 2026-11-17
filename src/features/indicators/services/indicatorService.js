
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';

import { auth, db } from '../../../services/firebase/firebaseConfig';

// Verificar se o estudante está logado e se o indicador pertence a ele
async function obterIndicadorDoUsuario(id) {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error('Você precisa estar logado.');
    }

    const referencia = doc(db, 'indicators', id);
    const snapshot = await getDoc(referencia);

    if (!snapshot.exists()) {
        throw new Error('Indicador não encontrado.');
    }

    const indicador = snapshot.data();

    if (indicador.userId !== usuario.uid) {
        throw new Error('Você não tem permissão para acessar este indicador.');
    }

    return { usuario, referencia, indicador };
}

// Gerar data no formato YYYY-MM-DD usando o horário local
function gerarDateKey() {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

// Criar indicador
export async function criarIndicador(dados) {
    console.log('[Indicador] Serviço iniciado');

    try {
        const usuario = auth.currentUser;

        if (!usuario) {
            throw new Error(
                'Você precisa estar logado para criar um indicador.'
            );
        }

        const novoIndicador = {
            userId: usuario.uid,

            name: dados.name.trim(),
            description: (dados.description || '').trim(),
            type: dados.type,

            target: dados.type === 'conclusao'
                ? null
                : Number(dados.target),

            unit: dados.type === 'conclusao'
                ? ''
                : (dados.unit || '').trim(),

            frequency: dados.frequency,

            selectedDays: dados.frequency === 'Todos os dias'
                ? []
                : (dados.selectedDays || []),

            reminderEnabled: Boolean(dados.reminderEnabled),

            reminderTime: dados.reminderEnabled
                ? dados.reminderTime
                : null,

            // Personalização escolhida pelo estudante
            iconName: dados.iconName || 'water-outline',
            iconColor: dados.iconColor || '#5A8EAD',
            backgroundColor: dados.backgroundColor || '#DCEFF5',

            // Indicador ativo e sem progresso inicial
            active: true,

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        if (
            dados.type !== 'conclusao' &&
            (!Number.isFinite(novoIndicador.target) ||
                novoIndicador.target <= 0)
        ) {
            throw new Error('A meta do indicador precisa ser maior que zero.');
        }

        const referencia = await addDoc(
            collection(db, 'indicators'),
            novoIndicador
        );

        console.log('[Indicador] Salvo com ID:', referencia.id);

        return referencia.id;

    } catch (error) {
        console.error('[Indicador] Erro:', error);
        throw error;
    }
}

// Editar indicador
export async function atualizarIndicador(id, dados) {
    const { referencia, indicador } = await obterIndicadorDoUsuario(id);

    if (indicador.active === false) {
        throw new Error('Não é possível editar um indicador arquivado.');
    }

    const atualizacao = {
        name: dados.name.trim(),
        description: (dados.description || '').trim(),
        updatedAt: serverTimestamp(),
    };

    if (dados.type === 'conclusao') {
        atualizacao.target = null;
        atualizacao.unit = '';
    } else {
        const target = Number(dados.target);

        if (!Number.isFinite(target) || target <= 0) {
            throw new Error('A meta precisa ser maior que zero.');
        }

        atualizacao.target = target;
        atualizacao.unit = (dados.unit || '').trim();
    }

    await updateDoc(referencia, atualizacao);
}

// Consultar histórico de progresso
export async function buscarHistoricoIndicador(id) {
    await obterIndicadorDoUsuario(id);

    const referencia = collection(db, 'indicators', id, 'progress');
    const snapshot = await getDocs(referencia);

    const historico = snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
    }));

    return historico.sort((a, b) => {
        const dataA = a.createdAt?.toMillis?.() || 0;
        const dataB = b.createdAt?.toMillis?.() || 0;

        return dataB - dataA;
    });
}

// Calcular o progresso total com base no histórico
export async function calcularProgressoIndicador(id) {
    const { indicador } = await obterIndicadorDoUsuario(id);

    const historico = await buscarHistoricoIndicador(id);

    const currentValue = historico.reduce(
        (total, registro) => total + Number(registro.amount || 0),
        0
    );

    const completed = indicador.type === 'conclusao'
        ? currentValue >= 1
        : indicador.target !== null && currentValue >= indicador.target;

    return {
        currentValue,
        target: indicador.target,
        completed,
        historico,
    };
}

// Registrar progresso parcial ou completo
export async function registrarProgresso(id, quantidade) {
    const { indicador } = await obterIndicadorDoUsuario(id);

    if (indicador.active === false) {
        throw new Error('Não é possível registrar progresso em um indicador arquivado.');
    }

    const amount = Number(quantidade);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('O progresso precisa ser maior que zero.');
    }

    if (indicador.type === 'conclusao' && amount !== 1) {
        throw new Error('Indicadores de conclusão registram uma única conclusão.');
    }

    const novoRegistro = {
        amount,
        createdAt: serverTimestamp(),
        dateKey: gerarDateKey(),
    };

    await addDoc(
        collection(db, 'indicators', id, 'progress'),
        novoRegistro
    );

    return await calcularProgressoIndicador(id);
}

// Marcar indicador como concluído
export async function concluirIndicador(id) {
    const { indicador } = await obterIndicadorDoUsuario(id);

    if (indicador.active === false) {
        throw new Error('Não é possível concluir um indicador arquivado.');
    }

    if (indicador.type === 'conclusao') {
        const progresso = await calcularProgressoIndicador(id);

        if (progresso.completed) {
            return progresso;
        }

        return await registrarProgresso(id, 1);
    }

    const progresso = await calcularProgressoIndicador(id);
    const restante = Number(indicador.target) - progresso.currentValue;

    if (restante <= 0) {
        return progresso;
    }

    return await registrarProgresso(id, restante);
}

// Arquivar indicador sem apagar seu histórico
export async function excluirIndicador(id) {
    const { referencia, indicador } = await obterIndicadorDoUsuario(id);

    if (indicador.active === false) {
        return;
    }

    await updateDoc(referencia, {
        active: false,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}
