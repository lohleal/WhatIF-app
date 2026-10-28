
import { doc, getDoc } from 'firebase/firestore';
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
