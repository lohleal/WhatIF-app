
import {
    getIdTokenResult,
    onAuthStateChanged,
    signOut,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';

import { auth } from '../../../services/firebase/firebaseConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Atualiza o token para buscar as permissões mais recentes.
          const tokenResult = await getIdTokenResult(currentUser, true);

          setUser(currentUser);
          setIsAdmin(tokenResult.claims.admin === true);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setUser(null);
        setIsAdmin(false);
        await signOut(auth);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }

  return context;
}
