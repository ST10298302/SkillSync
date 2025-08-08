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
        console.log('🔧 AuthContext: Loading auth state...');
        // Only try to load auth state in browser environment and if Supabase is properly configured
        if (typeof window !== 'undefined' && process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
          const currentUser = await SupabaseService.getCurrentUser();
          if (currentUser) {
            console.log('✅ AuthContext: Found existing user, setting state');
            setUser(currentUser);
            setIsLoggedIn(true);
          } else {
            console.log('ℹ️ AuthContext: No existing user found');
          }
        } else {
          console.log('ℹ️ AuthContext: Not in browser environment or Supabase not configured, skipping auth load');
        }
      } catch (e) {
        console.error('❌ AuthContext: Failed to load auth state', e);
        // Don't throw error, just continue without user
      } finally {
        console.log('✅ AuthContext: Auth state loading complete');
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
      console.log('🔧 AuthContext: Starting sign up...', { email, name });
      const { user } = await SupabaseService.signUp(email, password, name);
      if (user) {
        console.log('✅ AuthContext: Sign up successful, setting user state');
        setUser(user);
        setIsLoggedIn(true);
      } else {
        console.log('⚠️ AuthContext: Sign up successful but no user returned');
      }
    } catch (e) {
      console.error('❌ AuthContext: Failed to sign up', e);
      throw e;
    }
  };

  /**
   * Sign in with Supabase authentication.
   */
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔧 AuthContext: Starting sign in...', { email });
      const { user } = await SupabaseService.signIn(email, password);
      if (user) {
        console.log('✅ AuthContext: Sign in successful, setting user state');
        console.log('🔄 AuthContext: Setting user:', user.id);
        console.log('🔄 AuthContext: Setting isLoggedIn to true');
        setUser(user);
        setIsLoggedIn(true);
        console.log('✅ AuthContext: State updated, should trigger navigation');
      } else {
        console.log('⚠️ AuthContext: Sign in successful but no user returned');
      }
    } catch (e) {
      console.error('❌ AuthContext: Failed to sign in', e);
      throw e;
    }
  };

  /**
   * Sign out with Supabase authentication.
   */
  const signOut = async () => {
    try {
      console.log('🔧 AuthContext: Starting sign out...');
      await SupabaseService.signOut();
      console.log('🔄 AuthContext: Setting user to null');
      setUser(null);
      console.log('🔄 AuthContext: Setting isLoggedIn to false');
      setIsLoggedIn(false);
      console.log('✅ AuthContext: Sign out successful, state updated');
    } catch (e) {
      console.error('❌ AuthContext: Failed to sign out', e);
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
