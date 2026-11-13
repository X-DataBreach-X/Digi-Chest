import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { authErrorMessage, useAuth } from '../src/auth';
import { useTheme } from '../constants/theme';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { signIn, signUp, signInWithGoogle, signInWithGoogleCredential } = useAuth();
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!response) return;
    if (response.type !== 'success') {
      setSubmitting(false);
      return;
    }

    const idToken = response.authentication?.idToken ?? response.params?.id_token;
    if (!idToken) {
      setError('Google did not return an ID token. Check your OAuth client setup.');
      setSubmitting(false);
      return;
    }

    signInWithGoogleCredential(idToken)
      .catch((requestError) => setError(authErrorMessage(requestError)))
      .finally(() => setSubmitting(false));
  }, [response, signInWithGoogleCredential]);

  async function submit() {
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await (mode === 'login' ? signIn(email, password) : signUp(email, password));
    } catch (requestError) {
      setError(authErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  async function continueWithGoogle() {
    setError('');
    setSubmitting(true);
    try {
      if (Platform.OS === 'web') {
        await signInWithGoogle();
      } else if (request) {
        await promptAsync();
      } else {
        setError('Native Google sign-in is not configured yet. Add the Google client IDs to your environment.');
        setSubmitting(false);
      }
    } catch (requestError) {
      setError(authErrorMessage(requestError));
    } finally {
      if (Platform.OS === 'web') setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.brandMark}><Ionicons name="map-outline" size={34} color={colors.background} /></View>
        <Text style={styles.eyebrow}>Digi Chest</Text>
        <Text style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Start your adventure'}</Text>
        <Text style={styles.subtitle}>{mode === 'login' ? 'Sign in to keep exploring and collecting.' : 'Create an account to save your treasure map.'}</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            style={styles.input}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            textContentType="password"
            style={styles.input}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={({ pressed }) => [styles.submit, pressed && styles.pressed]} onPress={submit} disabled={submitting}>
            {submitting ? <ActivityIndicator color={colors.background} /> : <Text style={styles.submitText}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>}
          </Pressable>
          <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>OR</Text><View style={styles.dividerLine} /></View>
          <Pressable style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]} onPress={continueWithGoogle} disabled={submitting}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </Pressable>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>{mode === 'login' ? 'New to Digi Chest?' : 'Already have an account?'}</Text>
          <Pressable onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
            <Text style={styles.switchAction}>{mode === 'login' ? 'Create account' : 'Sign in'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    keyboard: { flex: 1, justifyContent: 'center', padding: 28 },
    brandMark: { alignSelf: 'center', width: 68, height: 68, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.accent, marginBottom: 18 },
    eyebrow: { textAlign: 'center', color: colors.accent, fontSize: 13, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' },
    title: { marginTop: 10, textAlign: 'center', color: colors.text, fontSize: 32, fontWeight: '800' },
    subtitle: { marginTop: 8, marginBottom: 28, textAlign: 'center', color: colors.textMuted, fontSize: 15, lineHeight: 22 },
    form: { padding: 20, borderRadius: 20, backgroundColor: colors.surface },
    label: { marginBottom: 7, color: colors.text, fontSize: 13, fontWeight: '700' },
    input: { height: 50, marginBottom: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 12, color: colors.text, backgroundColor: colors.background, fontSize: 15 },
    error: { marginBottom: 14, color: colors.danger, fontSize: 13, lineHeight: 18 },
    submit: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.accent },
    pressed: { opacity: 0.8 },
    submitText: { color: colors.background, fontSize: 15, fontWeight: '800' },
    divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { color: colors.textMuted, fontSize: 11, fontWeight: '800' },
    googleButton: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.background },
    googleG: { color: '#4285F4', fontSize: 20, fontWeight: '800' },
    googleText: { color: colors.text, fontSize: 15, fontWeight: '700' },
    switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 22 },
    switchText: { color: colors.textMuted, fontSize: 14 },
    switchAction: { color: colors.accent, fontSize: 14, fontWeight: '800' },
  });
}
