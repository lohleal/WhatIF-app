
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import DashboardScreen from './features/dashboard/views/DashboardScreen';
import CreateGroupScreen from './features/groups/views/CreateGroupScreen';
import GroupsScreen from './features/groups/views/GroupsScreen';
import WorkshopsScreen from './features/workshops/views/WorkshopsScreen';
import AdminLayout from './shared/components/Layout/AdminLayout';

import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import LoginScreen from './features/auth/views/LoginScreen';

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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Acesso público */}
          <Route path="/login" element={<LoginScreen />} />

          {/* Área administrativa protegida */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardScreen />} />
              <Route path="students" element={<ComingSoon title="Estudantes" />} />
              <Route path="groups" element={<GroupsScreen />} />
              <Route path="groups/create" element={<CreateGroupScreen />} />
              <Route path="workshops" element={<WorkshopsScreen />} />
              <Route path="reports" element={<ComingSoon title="Relatórios" />} />
              <Route path="settings" element={<ComingSoon title="Configurações" />} />
            </Route>
          </Route>

          {/* Rotas inexistentes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
