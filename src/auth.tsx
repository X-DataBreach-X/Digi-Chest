import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { firebaseAuth } from './firebase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleCredential: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(firebaseAuth, (nextUser: User | null) => {
    setUser(nextUser);
    setLoading(false);
  }), []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: (email, password) => signInWithEmailAndPassword(firebaseAuth, email.trim(), password).then(() => undefined),
    signUp: (email, password) => createUserWithEmailAndPassword(firebaseAuth, email.trim(), password).then(() => undefined),
    signInWithGoogle: () => signInWithPopup(firebaseAuth, new GoogleAuthProvider()).then(() => undefined),
    signInWithGoogleCredential: (idToken) => signInWithCredential(firebaseAuth, GoogleAuthProvider.credential(idToken)).then(() => undefined),
    signOut: () => firebaseSignOut(firebaseAuth),
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

export function authErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  switch (code) {
    case 'auth/email-already-in-use': return 'That email is already registered. Try signing in.';
    case 'auth/invalid-email': return 'Enter a valid email address.';
    case 'auth/weak-password': return 'Your password must be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password': return 'The email or password is incorrect.';
    case 'auth/network-request-failed': return 'Check your internet connection and try again.';
    case 'auth/popup-closed-by-user': return 'The Google sign-in window was closed.';
    case 'auth/popup-blocked': return 'Allow popups in your browser to continue with Google.';
    default: return 'Something went wrong. Please try again.';
  }
}
