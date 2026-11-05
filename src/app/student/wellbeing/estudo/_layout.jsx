
import { Stack } from 'expo-router';
import { EstudosProvider } from '../../../../features/study/context/EstudosContext';

export default function EstudosLayout() {
  return (
    <EstudosProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </EstudosProvider>
  );
}
