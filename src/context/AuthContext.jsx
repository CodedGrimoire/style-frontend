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
import toast from 'react-hot-toast';


const getFirebaseErrorMessage = (error) => 
  
  {
  if (!error || !error.code) {
    return error?.message || 'An unexpected error occurred';
  }

  const errorCode = error.code;
  
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please use a different email or try logging in.';
    
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password (at least 6 characters).';
    
    case 'auth/invalid-email':
      return 'Invalid email address. Please enter a valid email.';
    
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups and try again.';
    
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not enabled. Please enable it in Firebase Console.';
    
    default:
     
      return error.message || 'An error occurred during authentication. Please try again.';
  }
};

const AuthContext = createContext(null);

export const useAuth = () => 
  
  
  {
  const context = useContext(AuthContext);
  if (!context) 
    
    {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => 
  
  {
  const [user, setUser] = useState(null);


    const [loading, setLoading] = useState(true);

  const [userProfile, setUserProfile] = useState(null);
 
  useEffect(() => 
    
    {
    if (!auth) {
      console.error('Firebase auth is not initialized');
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        
       
        if (!currentUser) {
          setUserProfile(null);
          setLoading(false);
          return;
        }
        
        
        if (currentUser) {
          try {
           
            await currentUser.getIdToken(true); 
            
         
            let userName = currentUser.displayName || currentUser.email?.split('@')[0];
            
            
            if (!userName || userName.trim().length === 0) {
              userName = currentUser.email?.split('@')[0] || 'User';
            }
            
           
            userName = userName.trim();
            
            if (userName.length === 0) {
              console.warn('Cannot register user: name is empty');
              return;
            }
            
            const profile = await registerUser(
              userName,
              'user', 
              currentUser.photoURL || null
            );
            
            if (profile) {
              setUserProfile(profile);
            }
          } catch (error) {
          
         //   console.error('User profile registration error:', error);
            console.error('Error details:', 
              
              
              {
              message: error.message,
              stack: error.stack,
              name: error.name
            });
           
          }
        }
        
        setLoading(false);
      }, (error) => {
        console.error('Auth state change error:', error);
       
        setLoading(false);
      });

      return () => unsubscribe();
    } 
    
    
    catch (error) 
    
    
    {
      console.error('Error setting up auth state listener:', error);
      setLoading(false);
    }
  }, []);

  const signIn = async (email, password) =>
    
    
    {
    if (!auth) {
      throw new Error('Firebase Authentication is not configured. Please enable Authentication in Firebase Console.');
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
     
      await user.getIdToken(true);
      
      
      try 
      
      
      {
        let userName = user.displayName || user.email.split('@')[0];
        
       
        if (!userName || userName.trim().length === 0) 
          
          
          {
          userName = user.email.split('@')[0];
        }
        
       
        userName = userName.trim();
        
        if (userName.length > 0) 
          
          
          {
          const profile = await registerUser(
            userName,
            'user', 
            user.photoURL || null
          );
         // console.log('User profile registered/updated successfully:', profile);
          setUserProfile(profile);
        }
        
        else 
          
          {
          console.warn('Cannot register user: name is empty');
        }
      } catch (regError) {
        
        console.error('User profile registration failed:', regError.message);
      }
      
      return userCredential;
    } 
    
    
    catch (error) 
    
    
    {
      const friendlyMessage = getFirebaseErrorMessage(error);
    
      toast.error(friendlyMessage);
     
      const silentError = new Error(friendlyMessage);
      silentError.stack = undefined;
      throw silentError;
    }
  };

  const signUp = async (email, password, name = null) => 
    
    {
    if (!auth) 
      {
      throw new Error('Firebase Authentication is not configured.');
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      
      await user.getIdToken(true);
      
     
      try 
      
      {
        const userName = name || user.displayName || user.email.split('@')[0];
        if (!userName || userName.trim().length === 0)
          
          {
          throw new Error('Name is required for registration');
        }
        
        const profile = await registerUser(
          userName.trim(),
          'user', 
          user.photoURL || null
        );
      //  console.log('User profile created successfully:', profile);
        setUserProfile(profile);
      } 
      
      
      catch (regError) 
      
      
      {
      
        //console.error('User profile registration failed:', regError.message);
        if (regError.message.includes('Name is required')) {
        
          console.warn('User signed up but profile registration failed due to missing name');
        }
      }
      
      return userCredential;
    } 
    
    
    catch (error) 
    
    
    {
      const friendlyMessage = getFirebaseErrorMessage(error);
      
      toast.error(friendlyMessage);
     
      const silentError = new Error(friendlyMessage);


      silentError.stack = undefined;
      throw silentError;
    }
  };

  const signInWithGoogle = async () => 
    
    
    {
    if (!auth) {
      //throw new Error('Firebase Authentication is not configured. Please enable Authentication in Firebase Console.');
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      
      await user.getIdToken(true);
      
      try {
        const userName = user.displayName || user.email.split('@')[0];
        if (!userName || userName.trim().length === 0)
          
          
          {
          throw new Error('Name is required for registration');
        }
        
        const profile = await registerUser(
          userName.trim(),
          'user', 
          user.photoURL || null
        );
       // console.log('User profile created/updated successfully:', profile);
        setUserProfile(profile);
      } 
      
      
      catch (regError) {
       
        console.error('User profile registration failed:', regError.message);
      }
      
      return result;
    }
    
    
    catch (error) 
    
    
    {
      const friendlyMessage = getFirebaseErrorMessage(error);
     
     


      const silentError = new Error(friendlyMessage);
      silentError.stack = undefined;
      throw silentError;
    }
  };

  const signOut = async () => 
    
    
    {
    if (!auth)
      
      
      {
      return;
    }
   
    setUserProfile(null);
    await firebaseSignOut(auth);
  };

  const value = {
    user, 
    userProfile, 
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

