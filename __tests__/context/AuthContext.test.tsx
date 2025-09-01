jest.mock('../../services/supabaseService', () => ({
  SupabaseService: {
    signUp: jest.fn(async (email: string) => ({ user: { id: 'u1', email } })),
    signIn: jest.fn(async (email: string) => ({ user: { id: 'u1', email } })),
    signOut: jest.fn(async () => undefined),
    getCurrentUser: jest.fn(async () => null),
  },
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    // Mock browser environment
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
    
    // Mock process.env
    const g: any = globalThis as any;
    g.process = g.process || {};
    g.process.env = g.process.env || {};
    g.process.env.EXPO_PUBLIC_SUPABASE_URL = 'dummy';
    g.process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'dummy';
  });

  it('initializes with loading state and then completes', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Initially should be loading
    expect(result.current.loading).toBe(true);
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Should be in logged out state
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('signs up and sets user state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.signUp('a@b.com', 'pw', 'Markus');
    });
    
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user?.id).toBe('u1');
  });

  it('signs in and sets user state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.signIn('a@b.com', 'pw');
    });
    
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user?.id).toBe('u1');
  });

  it('signs out and clears user state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.signIn('a@b.com', 'pw');
      await result.current.signOut();
    });
    
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });
});


