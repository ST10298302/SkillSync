jest.mock('../../services/supabaseService', () => ({
  SupabaseService: {
    signUp: jest.fn(async (email: string) => ({ user: { id: 'u1', email } })),
    signIn: jest.fn(async (email: string) => ({ user: { id: 'u1', email } })),
    signOut: jest.fn(async () => undefined),
    getCurrentUser: jest.fn(async () => null),
  },
}));

import { act, renderHook } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  it('signs up and sets user state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signUp('a@b.com', 'pw', 'Markus');
    });
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user?.id).toBe('u1');
  });

  it('signs in and sets user state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signIn('a@b.com', 'pw');
    });
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user?.id).toBe('u1');
  });

  it('signs out and clears user state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signIn('a@b.com', 'pw');
      await result.current.signOut();
    });
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });
});


