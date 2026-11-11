import 'leaflet/dist/leaflet.css';

import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuth, AuthProvider } from '../src/auth';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from '../constants/theme';

function AppNavigator() {
  const { isDark } = useTheme();
  const { user, loading } = useAuth();
  const segments = useSegments();

  if (loading) return null;

  const onAuthScreen = segments[0] === 'auth';
  if (!user && !onAuthScreen) return <Redirect href="/auth" />;
  if (user && onAuthScreen) return <Redirect href="/(tabs)" />;

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
