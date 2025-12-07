import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { registerUser } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.error('Firebase auth is not initialized');
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        
        // If user is logged in, try to ensure their profile exists in backend
        if (currentUser) {
          try {
            // Try to register user profile if it doesn't exist
            // This will fail silently if profile already exists or endpoint doesn't exist
            await registerUser({
              email: currentUser.email,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              firebaseUid: currentUser.uid,
              image: currentUser.photoURL || null,
            });
          } catch (error) {
            // Profile might already exist or endpoint might not be available
            // This is not critical - backend should auto-create on first API call
            console.log('User profile check:', error.message);
          }
        }
        
        setLoading(false);
      }, (error) => {
        console.error('Auth state change error:', error);
        if (error.code === 'auth/configuration-not-found') {
          console.error('Firebase Authentication is not enabled in your Firebase project.');
          console.error('Please enable Authentication in Firebase Console:');
          console.error('1. Go to https://console.firebase.google.com/');
          console.error('2. Select your project');
          console.error('3. Go to Authentication > Sign-in method');
          console.error('4. Enable Email/Password and Google sign-in providers');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      setLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    if (!auth) {
      throw new Error('Firebase Authentication is not configured. Please enable Authentication in Firebase Console.');
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase Authentication is not enabled. Please enable it in Firebase Console under Authentication > Sign-in method.');
      }
      throw error;
    }
  };

  const signUp = async (email, password, name = null) => {
    if (!auth) {
      throw new Error('Firebase Authentication is not configured. Please enable Authentication in Firebase Console.');
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Try to create user profile in backend
      // The backend should auto-create, but we'll try explicit registration if available
      try {
        await registerUser({
          email: user.email,
          name: name || user.displayName || user.email.split('@')[0],
          firebaseUid: user.uid,
          image: user.photoURL || null,
        });
      } catch (regError) {
        // Backend might auto-create on first API call, so this is not critical
        console.log('User profile will be created on first API call');
      }
      
      return userCredential;
    } catch (error) {
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase Authentication is not enabled. Please enable it in Firebase Console under Authentication > Sign-in method.');
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase Authentication is not configured. Please enable Authentication in Firebase Console.');
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Try to create/update user profile in backend
      try {
        await registerUser({
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          firebaseUid: user.uid,
          image: user.photoURL || null,
        });
      } catch (regError) {
        // Backend might auto-create on first API call, so this is not critical
        console.log('User profile will be created on first API call');
      }
      
      return result;
    } catch (error) {
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase Authentication is not enabled. Please enable it in Firebase Console under Authentication > Sign-in method.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) {
      return;
    }
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

