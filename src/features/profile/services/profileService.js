import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../../../services/firebase/firebaseConfig';

export async function buscarPerfilUsuario() {
    const usuarioAutenticado = auth.currentUser;

    if (!usuarioAutenticado) {
        throw new Error('Nenhum usuário está autenticado.');
    }

    const referencia = doc(db, 'users', usuarioAutenticado.uid);
    const resultado = await getDoc(referencia);

    if (!resultado.exists()) {
        throw new Error('Os dados do perfil não foram encontrados.');
    }

    return resultado.data();
}

export async function atualizarPerfilUsuario(dados) {
    const usuarioAutenticado = auth.currentUser;

    if (!usuarioAutenticado) {
        throw new Error('Nenhum usuário está autenticado.');
    }

    const dadosAtualizados = {
        nome: dados.nome.trim(),
        sobrenome: dados.sobrenome.trim(),
        telefone: dados.telefone.trim(),
        dataNascimento: dados.dataNascimento.trim(),
    };

    const referencia = doc(db, 'users', usuarioAutenticado.uid);

    await setDoc(referencia, dadosAtualizados, { merge: true });

    await updateProfile(usuarioAutenticado, {
        displayName: `${dadosAtualizados.nome} ${dadosAtualizados.sobrenome}`.trim(),
    });

    return dadosAtualizados;
}