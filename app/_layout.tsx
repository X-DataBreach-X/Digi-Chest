import 'leaflet/dist/leaflet.css';

import { Stack } from 'expo-router';
import { AuthProvider } from '../src/auth';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from '../constants/theme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function AppNavigator() {
  const { isDark } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
