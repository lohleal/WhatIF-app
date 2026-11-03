
import { Bell, CircleHelp, Search, UserRound } from 'lucide-react';

import './Header.css';

export default function Header() {
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
      </div>
    </header>
  );
}
