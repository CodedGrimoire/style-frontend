/**
 * Converts Firebase error codes to user-friendly error messages
 * @param {Error} error - The Firebase error object
 * @returns {string} - A user-friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  if (!error || !error.code) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorCode = error.code;

  // Firebase Auth error codes
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please use a different email or sign in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups and try again.',
    'auth/account-exists-with-different-credential': 'An account already exists with a different sign-in method. Please use that method to sign in.',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please sign out and sign in again.',
  };

  return errorMessages[errorCode] || error.message || 'An error occurred. Please try again.';
};
