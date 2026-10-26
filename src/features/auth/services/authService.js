
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

import { auth, db } from '../../../services/firebase/firebaseConfig';

export async function cadastrarUsuario(nome, email, senha) {
  const credencial = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    senha
  );

  const usuario = credencial.user;

  await updateProfile(usuario, {
    displayName: nome.trim(),
  });

  await setDoc(doc(db, 'users', usuario.uid), {
    nome: nome.trim(),
    email: usuario.email,
    grupoId: null,
    criadoEm: serverTimestamp(),
  });

  return usuario;
}

export async function entrar(email, senha) {
  const credencial = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    senha
  );

  return credencial.user;
}

export async function sair() {
  await signOut(auth);
}
