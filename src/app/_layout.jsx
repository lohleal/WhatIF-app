
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { AuthProvider } from '../features/auth/context/AuthContext';
import { EstudosProvider } from '../features/study/context/EstudosContext';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

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
