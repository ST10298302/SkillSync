import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Types for the context state
interface AuthContextProps {
  user: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
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
  const [user, setUser] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Keys for storage
  const USER_CRED_KEY = 'userCredentials';
  const LOGGED_IN_KEY = 'loggedIn';

  /**
   * Load persisted auth state on mount.
   */
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const loggedInFlag = await AsyncStorage.getItem(LOGGED_IN_KEY);
        if (loggedInFlag === 'true') {
          const credentialsJson = await getSecureItem(USER_CRED_KEY);
          if (credentialsJson) {
            const creds = JSON.parse(credentialsJson);
            setUser(creds.email);
            setIsLoggedIn(true);
          }
        }
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        setLoading(false);
      }
    };
    loadAuthState();
  }, []);

  /**
   * Save user credentials securely and set logged‑in flag.
   */
  const signUp = async (email: string, password: string) => {
    try {
      const credentials = JSON.stringify({ email, password });
      await setSecureItem(USER_CRED_KEY, credentials);
      await AsyncStorage.setItem(LOGGED_IN_KEY, 'true');
      setUser(email);
      setIsLoggedIn(true);
    } catch (e) {
      console.error('Failed to sign up', e);
    }
  };

  /**
   * Attempt to log in by comparing the provided credentials
   * against the stored credentials.
   */
  const signIn = async (email: string, password: string) => {
    try {
      const storedCreds = await getSecureItem(USER_CRED_KEY);
      if (!storedCreds) {
        throw new Error('No user found');
      }
      const { email: storedEmail, password: storedPassword } = JSON.parse(storedCreds);
      if (email === storedEmail && password === storedPassword) {
        await AsyncStorage.setItem(LOGGED_IN_KEY, 'true');
        setUser(email);
        setIsLoggedIn(true);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (e) {
      console.error('Failed to sign in', e);
      throw e;
    }
  };

  /**
   * Clear logged‑in flag and user state.
   */
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(LOGGED_IN_KEY);
      setUser(null);
      setIsLoggedIn(false);
    } catch (e) {
      console.error('Failed to sign out', e);
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
