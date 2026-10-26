
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../services/firebase/firebaseConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregando(false);
    });

    return cancelar;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        autenticado: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return contexto;
}
