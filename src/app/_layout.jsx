
import { Stack } from 'expo-router';

import { AuthProvider } from '../features/auth/context/AuthContext';
import { EstudosProvider } from '../features/study/context/EstudosContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <EstudosProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </EstudosProvider>
    </AuthProvider>
  );
}
