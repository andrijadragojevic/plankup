import {
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import type { User } from '../types';

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUser(result.user, false);
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

/**
 * Sign in as guest (anonymous)
 */
export const signInAsGuest = async (): Promise<User> => {
  try {
    const result = await signInAnonymously(auth);
    return mapFirebaseUser(result.user, true);
  } catch (error: any) {
    console.error('Error signing in as guest:', error);
    throw new Error(error.message || 'Failed to sign in as guest');
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthState = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(mapFirebaseUser(firebaseUser, firebaseUser.isAnonymous));
    } else {
      callback(null);
    }
  });
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  return mapFirebaseUser(firebaseUser, firebaseUser.isAnonymous);
};

/**
 * Map Firebase user to app User type
 */
const mapFirebaseUser = (firebaseUser: FirebaseUser, isGuest: boolean): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || (isGuest ? 'Guest' : null),
    photoURL: firebaseUser.photoURL,
    isGuest,
    createdAt: firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime)
      : new Date(),
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};
