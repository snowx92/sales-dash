import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only on client side and only if not already initialized
function getFirebaseApp() {
  if (typeof window === 'undefined') {
    // Server-side: return null or throw error
    return null;
  }
  
  // Client-side: initialize if needed
  const apps = getApps();
  if (apps.length > 0) {
    return getApp();
  }
  
  // Validate config before initializing
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
    console.warn('Firebase config is not properly set. Skipping initialization.');
    return null;
  }
  
  return initializeApp(firebaseConfig);
}

// Lazy initialization of Firebase Auth
export function getFirebaseAuth() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase auth is only available on the client side');
  }
  
  const app = getFirebaseApp();
  if (!app) {
    throw new Error('Firebase app not initialized');
  }
  const authInstance = getAuth(app);
  // Ensure persistence is set (idempotent after first time)
  setPersistence(authInstance, browserLocalPersistence).catch(() => {/* ignore */});
  return authInstance;
}

// For backward compatibility - only initialize on client side
export const auth = typeof window !== 'undefined' ? (() => {
  try {
    return getFirebaseAuth();
  } catch {
    return null;
  }
})() : null;

// Export app getter for other uses
export { getFirebaseApp };
export default getFirebaseApp; 