'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, logout as firebaseLogout } from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          ...firebaseUser,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);



  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await import('../lib/firebase').then((mod) => mod.loginWithEmail(email, password));
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password) => {
    try {
      const userCredential = await import('../lib/firebase').then((mod) => mod.signUpWithEmail(email, password));
      return userCredential;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const userCredential = await import('../lib/firebase').then((mod) => mod.loginWithGoogle());
      return userCredential;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);