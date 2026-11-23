
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../../../services/firebase/firebaseConfig';

// Busca os dados do perfil do usuário autenticado
export async function buscarPerfilUsuario() {
    const usuarioAutenticado = auth.currentUser;

    if (!usuarioAutenticado) {
        throw new Error('Nenhum usuário está autenticado.');
    }

    try {
        const referencia = doc(db, 'users', usuarioAutenticado.uid);
        const resultado = await getDoc(referencia);

        if (!resultado.exists()) {
            throw new Error('Os dados do perfil não foram encontrados.');
        }

        return resultado.data();
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        console.error('Código:', error.code);
        console.error('Mensagem:', error.message);
        throw error;
    }
}

// Atualiza os dados do perfil do usuário
export async function atualizarPerfilUsuario(dados) {
    const usuarioAutenticado = auth.currentUser;

    if (!usuarioAutenticado) {
        throw new Error('Nenhum usuário está autenticado.');
    }

    const dadosAtualizados = {
        nome: (dados.nome || '').trim(),
        sobrenome: (dados.sobrenome || '').trim(),
        telefone: (dados.telefone || '').trim(),
        dataNascimento: (dados.dataNascimento || '').trim(),
    };

    const referencia = doc(db, 'users', usuarioAutenticado.uid);

    // Salva os dados no Firestore
    try {
        await setDoc(referencia, dadosAtualizados, { merge: true });
    } catch (error) {
        console.error('ERRO ORIGINAL DO FIRESTORE:', error);
        console.error('Código:', error.code);
        console.error('Mensagem:', error.message);
        throw error;
    }

    // Atualiza o nome de exibição no Firebase Authentication
    try {
        await updateProfile(usuarioAutenticado, {
            displayName: `${dadosAtualizados.nome} ${dadosAtualizados.sobrenome}`.trim(),
        });
    } catch (error) {
        console.warn(
            'Os dados foram salvos no Firestore, mas o nome de exibição não foi atualizado:',
            error
        );
    }

    return dadosAtualizados;
}
