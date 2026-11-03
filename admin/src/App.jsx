
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import DashboardScreen from './features/dashboard/views/DashboardScreen';
import AdminLayout from './shared/components/Layout/AdminLayout';

function ComingSoon({ title }) {
  return (
    <div>
      <h1>{title}</h1>
      <p>Esta funcionalidade será desenvolvida em breve.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardScreen />} />
          <Route path="students" element={<ComingSoon title="Estudantes" />} />
          <Route path="groups" element={<ComingSoon title="Grupos" />} />
          <Route path="reports" element={<ComingSoon title="Relatórios" />} />
          <Route path="settings" element={<ComingSoon title="Configurações" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
