
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../../../services/firebase/firebaseConfig';

export async function cadastrarUsuario(
    nome,
    sobrenome,
    email,
    telefone,
    senha
) {
    const nomeFormatado = nome.trim();
    const sobrenomeFormatado = sobrenome.trim();
    const emailFormatado = email.trim().toLowerCase();
    const telefoneFormatado = telefone.trim();

    // Cria a conta no Firebase Authentication.
    const credencial = await createUserWithEmailAndPassword(
        auth,
        emailFormatado,
        senha
    );

    const usuario = credencial.user;

    try {
        // Salva o nome completo no perfil do Authentication.
        await updateProfile(usuario, {
            displayName: `${nomeFormatado} ${sobrenomeFormatado}`,
        });

        // Salva os demais dados no Firestore.
        await setDoc(doc(db, 'users', usuario.uid), {
            nome: nomeFormatado,
            sobrenome: sobrenomeFormatado,
            email: emailFormatado,
            telefone: telefoneFormatado,
            grupoId: null,
            criadoEm: serverTimestamp(),
        });

        return usuario;
    } catch (error) {
        // Evita deixar uma conta de autenticação criada
        // quando a gravação dos dados falha.
        try {
            await usuario.delete();
        } catch (deleteError) {
            console.log(
                'Não foi possível remover a conta incompleta:',
                deleteError.message
            );
        }

        throw error;
    }
}

export async function entrar(email, senha) {
    const credencial = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        senha
    );

    return credencial.user;
}

export async function sair() {
    await signOut(auth);
}
