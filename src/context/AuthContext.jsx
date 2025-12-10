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
  const [userProfile, setUserProfile] = useState(null); // Backend user profile with role
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
        
        // Clear userProfile when user logs out
        if (!currentUser) {
          setUserProfile(null);
          setLoading(false);
          return;
        }
        
        // If user is logged in, try to ensure their profile exists in backend
        if (currentUser) {
          try {
            // Wait for token to be ready
            await currentUser.getIdToken(true); // Force refresh to ensure token is ready
            
            // Try to register user profile if it doesn't exist
            // The endpoint is idempotent - returns existing user if already registered
            let userName = currentUser.displayName || currentUser.email?.split('@')[0];
            
            // If we still don't have a name, use a more descriptive default
            if (!userName || userName.trim().length === 0) {
              userName = currentUser.email?.split('@')[0] || 'User';
            }
            
            // Ensure name is not just whitespace
            userName = userName.trim();
            
            if (userName.length === 0) {
              console.warn('Cannot register user: name is empty');
              return;
            }
            
            // Call registerUser - it's idempotent, so if user exists, it returns existing profile with actual role
            // We pass 'user' as default, but backend will return existing user's actual role if they're already registered
            const profile = await registerUser(
              userName,
              'user', // Default role for new users only
              currentUser.photoURL || null
            );
            // Store the user profile (includes role) for role-based routing
            // The profile should contain the actual role from backend (admin, decorator, or user)
            if (profile) {
              setUserProfile(profile);
            }
          } catch (error) {
            // Log the error for debugging with full details
            console.error('User profile registration error:', error);
            console.error('Error details:', {
              message: error.message,
              stack: error.stack,
              name: error.name
            });
            
            // If it's a critical error, log it but don't block the app
            // The auto-registration in apiRequest will try again when needed
            // But we should at least know what went wrong
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Wait for token to be ready
      await user.getIdToken(true);
      
      // Try to register/update user profile in backend
      // The endpoint is idempotent - returns existing user if already registered
      try {
        let userName = user.displayName || user.email.split('@')[0];
        
        // If we still don't have a name, use email prefix
        if (!userName || userName.trim().length === 0) {
          userName = user.email.split('@')[0];
        }
        
        // Ensure name is not just whitespace
        userName = userName.trim();
        
        if (userName.length > 0) {
          const profile = await registerUser(
            userName,
            'user', // Default role
            user.photoURL || null
          );
          console.log('User profile registered/updated successfully:', profile);
          setUserProfile(profile);
        } else {
          console.warn('Cannot register user: name is empty');
        }
      } catch (regError) {
        // If registration fails, log it but don't fail the signin
        // The auto-registration in apiRequest will handle it
        console.error('User profile registration failed:', regError.message);
      }
      
      return userCredential;
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
      
      // Wait for token to be ready
      await user.getIdToken(true);
      
      // Try to create user profile in backend
      // The endpoint is idempotent - returns existing user if already registered
      try {
        const userName = name || user.displayName || user.email.split('@')[0];
        if (!userName || userName.trim().length === 0) {
          throw new Error('Name is required for registration');
        }
        
        const profile = await registerUser(
          userName.trim(),
          'user', // Default role
          user.photoURL || null
        );
        console.log('User profile created successfully:', profile);
        setUserProfile(profile);
      } catch (regError) {
        // If registration fails, log it but don't fail the signup
        // The auto-registration in apiRequest will handle it
        console.error('User profile registration failed:', regError.message);
        if (regError.message.includes('Name is required')) {
          // If name is missing, we should still allow signup but warn the user
          console.warn('User signed up but profile registration failed due to missing name');
        }
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
      
      // Wait for token to be ready
      await user.getIdToken(true);
      
      // Try to create/update user profile in backend
      // The endpoint is idempotent - returns existing user if already registered
      try {
        const userName = user.displayName || user.email.split('@')[0];
        if (!userName || userName.trim().length === 0) {
          throw new Error('Name is required for registration');
        }
        
        const profile = await registerUser(
          userName.trim(),
          'user', // Default role
          user.photoURL || null
        );
        console.log('User profile created/updated successfully:', profile);
        setUserProfile(profile);
      } catch (regError) {
        // If registration fails, log it but don't fail the signin
        // The auto-registration in apiRequest will handle it
        console.error('User profile registration failed:', regError.message);
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
    // Clear userProfile before signing out to prevent stale data
    setUserProfile(null);
    await firebaseSignOut(auth);
  };

  const value = {
    user, // Firebase user
    userProfile, // Backend user profile with role
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

