import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SupabaseService } from '../services/supabaseService';

// Types for the context state
interface AuthContextProps {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Cross-platform helpers for "secure" (user credentials) storage
const setSecureItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};
const getSecureItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};
const removeSecureItem = async (key: string) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

/**
 * AuthProvider manages simple email/password authentication.
 * It uses SecureStore (native) or AsyncStorage (web) to save credentials,
 * and AsyncStorage to persist the logged‑in state between launches.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Load persisted auth state on mount.
   */
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // console.log('AuthContext: Loading auth state...');

        // Are we in a browser?
        const inBrowser = typeof window !== 'undefined';

        // Read env safely so Jest/Node/Native don't blow up if process/env is missing
        const env = ((globalThis as any)?.process?.env ?? {}) as Record<string, string | undefined>;
        const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
        const supabaseKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

        // Only try to load auth state in browser and if Supabase is configured
        if (inBrowser && supabaseUrl && supabaseKey) {
          const currentUser = await SupabaseService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsLoggedIn(true);
          }
        } else {
          // console.log('AuthContext: Not in browser or Supabase env not set, skipping auth load');
        }
      } catch (e) {
        console.error('AuthContext: Failed to load auth state', e);
        // Don't throw error, just continue without user
      } finally {
        setLoading(false);
      }
    };
    loadAuthState();
  }, []);

  /**
   * Sign up with Supabase authentication.
   */
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { user } = await SupabaseService.signUp(email, password, name);
      if (user) {
        setUser(user);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.error('AuthContext: Failed to sign up', e);
      throw e;
    }
  };

  /**
   * Sign in with Supabase authentication.
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await SupabaseService.signIn(email, password);
      if (user) {
        setUser(user);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.error('AuthContext: Failed to sign in', e);
      throw e;
    }
  };

  /**
   * Sign out with Supabase authentication.
   */
  const signOut = async () => {
    try {
      await SupabaseService.signOut();
      setUser(null);
      setIsLoggedIn(false);
    } catch (e) {
      console.error('AuthContext: Failed to sign out', e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Convenience hook to access the AuthContext.  Throws an
 * error if used outside an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
