import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Safe default fallbacks so the app compiles and runs perfectly when self-hosted or compiled outside AI Studio
const DEFAULT_API_KEY = "AIzaSyADDuI1SThr5DLOmGFsrcyt0OoK1W52JlI";
const DEFAULT_AUTH_DOMAIN = "rocxcakes-9fb4b.firebaseapp.com";
const DEFAULT_PROJECT_ID = "rocxcakes-9fb4b";
const DEFAULT_STORAGE_BUCKET = "rocxcakes-9fb4b.firebasestorage.app";
const DEFAULT_MESSAGING_SENDER_ID = "502160467560";
const DEFAULT_APP_ID = "1:502160467560:web:334588392249c1962abddd";
const DEFAULT_MEASUREMENT_ID = "G-52EQ3ZXTDK";

// Use environment variables if set in Netlify/Vercel
const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: (env.VITE_FIREBASE_API_KEY || DEFAULT_API_KEY).trim(),
  authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_AUTH_DOMAIN).trim(),
  projectId: (env.VITE_FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID).trim(),
  storageBucket: (env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_STORAGE_BUCKET).trim(),
  messagingSenderId: (env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_MESSAGING_SENDER_ID).trim(),
  appId: (env.VITE_FIREBASE_APP_ID || DEFAULT_APP_ID).trim(),
  measurementId: (env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID).trim()
};

const firestoreDatabaseId = (env.VITE_FIREBASE_DATABASE_ID || "").trim();

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
}, firestoreDatabaseId || undefined);
export const auth = getAuth(app);

