
import {
  ChartNoAxesCombined,
  Layers,
  LayoutDashboard,
  Settings,
  Users
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import logo from '../../../assets/logo.png';
import './Sidebar.css';

const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Estudantes',
    path: '/students',
    icon: Users,
  },
  {
    label: 'Grupos',
    path: '/groups',
    icon: Layers,
  },
  {
    label: 'Relatórios',
    path: '/reports',
    icon: ChartNoAxesCombined,
  },
  {
    label: 'Configurações',
    path: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <img src={logo} alt="Logo What IF App" />
        </div>

        <div className="brand-text">
          <h2>WHAT IF APP</h2>
          <span>Admin</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={21} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>WHAT IF APP © 2026</span>
      </div>
    </aside>
  );
}
