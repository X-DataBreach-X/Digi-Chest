import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

// Firebase client configuration is safe to ship in a mobile app. Security is
// enforced by Firebase Authentication and the Data Connect operation rules.
const firebaseConfig = {
  apiKey: 'AIzaSyDkje_jK3hZJG6x0jBbLuimK9QD-eOq4LI',
  authDomain: 'digital-chest.firebaseapp.com',
  projectId: 'digital-chest',
  storageBucket: 'digital-chest.firebasestorage.app',
  messagingSenderId: '534572374120',
  appId: '1:534572374120:web:afaf17d2f301851c56c3dd',
  measurementId: 'G-4M1GB3WET4',
};

export const firebaseApp = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
export const dataConnect = getDataConnect(connectorConfig);
