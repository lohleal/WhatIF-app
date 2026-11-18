
import { useEffect, useState } from 'react';

import {
  Bell,
  CircleHelp,
  Search,
  UserRound,
  LogOut,
  Users,
  ArrowRight,
} from 'lucide-react';

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import { auth, db } from '../../../services/firebase/firebaseConfig';

import './Header.css';

export default function Header() {
  const navigate = useNavigate();

  const [pendingCount, setPendingCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState(false);

  // ACOMPANHAR SOLICITAÇÕES PENDENTES EM TEMPO REAL
  useEffect(() => {
    const requestsQuery = query(
      collection(db, 'groupRequests'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        setPendingCount(snapshot.size);
        setNotificationError(false);
      },
      (error) => {
        console.error('Erro ao acompanhar notificações:', error);
        setNotificationError(true);
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao sair da conta:', error);
      alert('Não foi possível encerrar a sessão. Tente novamente.');
    }
  }

  function handleProfile() {
    navigate('/profile');
  }

  function handleNotifications() {
    setNotificationsOpen((current) => !current);
  }

  function handleViewRequests() {
    setNotificationsOpen(false);
    navigate('/groups');
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

        <div className="header-notifications">
          <button
            className={`header-icon notification-button ${
              notificationsOpen ? 'notification-active' : ''
            }`}
            type="button"
            onClick={handleNotifications}
            aria-label={`Notificações: ${pendingCount} solicitações pendentes`}
            aria-expanded={notificationsOpen}
            title="Notificações"
          >
            <Bell size={21} />

            {pendingCount > 0 && (
              <span className="notification-badge">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="notification-dropdown">
              <div className="notification-heading">
                <div>
                  <strong>Notificações</strong>
                  <span>Solicitações de entrada</span>
                </div>

                <span className="notification-count">
                  {pendingCount}
                </span>
              </div>

              <div className="notification-content">
                {notificationError ? (
                  <div className="notification-empty">
                    <CircleHelp size={25} />
                    <strong>Não foi possível carregar</strong>
                    <span>
                      Verifique sua conexão e tente novamente.
                    </span>
                  </div>
                ) : pendingCount > 0 ? (
                  <div className="notification-message">
                    <div className="notification-message-icon">
                      <Users size={20} />
                    </div>

                    <div>
                      <strong>
                        {pendingCount === 1
                          ? 'Nova solicitação de entrada'
                          : 'Novas solicitações de entrada'}
                      </strong>

                      <span>
                        {pendingCount === 1
                          ? 'Há 1 aluno aguardando aprovação.'
                          : `Há ${pendingCount} alunos aguardando aprovação.`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="notification-empty">
                    <Bell size={25} />
                    <strong>Nenhuma pendência</strong>
                    <span>
                      Você está em dia com as solicitações dos grupos.
                    </span>
                  </div>
                )}
              </div>

              <button
                className="notification-footer"
                type="button"
                onClick={handleViewRequests}
              >
                Ver solicitações
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        <button
          className="header-avatar"
          type="button"
          onClick={handleProfile}
          aria-label="Perfil do administrador"
          title="Meu perfil"
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
