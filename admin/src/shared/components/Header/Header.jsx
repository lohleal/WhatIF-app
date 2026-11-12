
import {
  Bell,
  CircleHelp,
  Search,
  UserRound,
  LogOut,
} from 'lucide-react';

import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import { auth } from '../../../services/firebase/firebaseConfig';

import './Header.css';

export default function Header() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao sair da conta:', error);
      alert('Não foi possível encerrar a sessão. Tente novamente.');
    }
  }

  return (
    <header className="admin-header">
      <div className="header-search">
        <Search size={19} />
        <input
          type="text"
          placeholder="Buscar..."
          aria-label="Buscar"
        />
      </div>

      <div className="header-actions">
        <button
          className="header-icon"
          type="button"
          aria-label="Ajuda"
        >
          <CircleHelp size={21} />
        </button>

        <button
          className="header-icon"
          type="button"
          aria-label="Notificações"
        >
          <Bell size={21} />
        </button>

        <button
          className="header-avatar"
          type="button"
          aria-label="Perfil do administrador"
        >
          <UserRound size={22} />
        </button>

        <button
          className="header-icon header-logout"
          type="button"
          onClick={handleLogout}
          aria-label="Sair da conta"
          title="Sair da conta"
        >
          <LogOut size={21} />
        </button>
      </div>
    </header>
  );
}
