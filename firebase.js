// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug: Log environment variables (without exposing sensitive data)
console.log('Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  envKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_FIREBASE'))
});

// Validate Firebase configuration
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key] || firebaseConfig[key] === 'undefined');

if (missingKeys.length > 0) {
  const errorMsg = `Missing Firebase configuration keys: ${missingKeys.join(', ')}. Please check your .env file and ensure all VITE_FIREBASE_* variables are set. Then restart the dev server.`;
  console.error(errorMsg);
  console.error('Current config values:', {
    apiKey: firebaseConfig.apiKey ? 'SET' : 'MISSING',
    authDomain: firebaseConfig.authDomain || 'MISSING',
    projectId: firebaseConfig.projectId || 'MISSING',
    storageBucket: firebaseConfig.storageBucket || 'MISSING',
    messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
    appId: firebaseConfig.appId || 'MISSING',
  });
}

// Initialize Firebase
let app;
let analytics;
let auth;
let googleProvider;

// Only initialize if we have all required config values
if (missingKeys.length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    
    // Initialize analytics only if in browser environment
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (analyticsError) {
        console.warn('Analytics initialization failed:', analyticsError);
        // Analytics is optional, continue without it
      }
    }
    
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    console.error('Firebase Config:', {
      apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
      authDomain: firebaseConfig.authDomain || 'MISSING',
      projectId: firebaseConfig.projectId || 'MISSING',
      storageBucket: firebaseConfig.storageBucket || 'MISSING',
      messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
      appId: firebaseConfig.appId || 'MISSING',
    });
    throw new Error('Failed to initialize Firebase. Please check your configuration and restart the dev server.');
  }
} else {
  console.error('Cannot initialize Firebase: Missing required configuration values.');
  console.error('Please set all VITE_FIREBASE_* environment variables in your .env file and restart the dev server.');
}

export { app, analytics, auth, googleProvider };