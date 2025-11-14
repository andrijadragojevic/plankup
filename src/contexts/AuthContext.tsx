import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import {
  signInWithGoogle as googleSignIn,
  signInAsGuest as guestSignIn,
  signOut as authSignOut,
  subscribeToAuthState,
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');

    // Timeout fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('AuthContext: Auth state listener timeout - setting loading to false');
      setLoading(false);
    }, 5000);

    const unsubscribe = subscribeToAuthState(async (user) => {
      clearTimeout(timeout);
      console.log('AuthContext: Auth state changed', user ? 'User logged in' : 'No user');
      setUser(user);

      // Don't initialize here - let UserContext handle it
      // This prevents race conditions

      console.log('AuthContext: Setting loading to false');
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      console.log('AuthContext: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await googleSignIn();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    try {
      setError(null);
      setLoading(true);
      await guestSignIn();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in as guest');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authSignOut();
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
