
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

import { auth } from '../../../services/firebase/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

import './LoginScreen.css';

export default function LoginScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (authLoading) {
    return <div className="login-loading">Verificando acesso...</div>;
  }

  if (user && isAdmin) {
    window.location.replace('/dashboard');
    return null;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Preencha seu e-mail e sua senha.');
      return;
    }

    try {
      setLoading(true);

      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const tokenResult = await credential.user.getIdTokenResult(true);

      if (tokenResult.claims.admin !== true) {
        await auth.signOut();
        setError('Esta conta não possui autorização administrativa.');
        return;
      }

      window.location.replace('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);

      const messages = {
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/user-not-found': 'Conta não encontrada.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/invalid-email': 'Informe um e-mail válido.',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
        'auth/network-request-failed': 'Verifique sua conexão com a internet.',
      };

      setError(
        messages[error.code] || 'Não foi possível entrar. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">W</div>
          <span>WHAT IF APP</span>
        </div>

        <div className="login-heading">
          <h1>Bem-vindo!</h1>
          <p>Entre com sua conta administrativa para continuar.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="login-field">
            <label htmlFor="email">E-mail</label>
            <div className="login-input-wrapper">
              <Mail size={19} />
              <input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Senha</label>
            <div className="login-input-wrapper">
              <Lock size={19} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>

        <p className="login-footer">
          WHAT IF APP · Painel Administrativo
        </p>
      </section>
    </main>
  );
}
