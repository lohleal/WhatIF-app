
import { Outlet } from 'react-router-dom';

import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';

import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-container">
      <Sidebar />

      <main className="admin-main">
        <Header />

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
