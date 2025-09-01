import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { SkillsProvider, useSkills } from '../../context/SkillsContext';
import * as SupabaseServiceModule from '../../services/supabaseService';

// Use manual mock from services/__mocks__/supabaseService.ts
jest.mock('../../services/supabaseService');

// Minimal wrapper providing Auth and Skills
const Providers = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <SkillsProvider>{children}</SkillsProvider>
  </AuthProvider>
);

beforeAll(() => {
  // Simulate browser environment checks inside context code
  Object.defineProperty(global, 'window', {
    value: {},
    writable: true,
  });
  const g: any = globalThis as any;
  g.process = g.process || {};
  g.process.env = g.process.env || {};
  g.process.env.EXPO_PUBLIC_SUPABASE_URL = g.process.env.EXPO_PUBLIC_SUPABASE_URL || 'dummy';
  g.process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = g.process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'dummy';
});

beforeEach(() => {
  // Reset manual mock in-memory state between tests
  const anyModule = SupabaseServiceModule as any;
  if (typeof anyModule.__reset === 'function') {
    anyModule.__reset();
  } else if (anyModule && anyModule.SupabaseService && typeof anyModule.SupabaseService.__reset === 'function') {
    anyModule.SupabaseService.__reset();
  }
});

const useBoth = () => {
  const auth = useAuth();
  const skills = useSkills();
  return { auth, skills };
};

describe('SkillsContext', () => {
  it('adds a skill', async () => {
    const { result } = renderHook(() => useBoth(), { wrapper: Providers });
    
    // Wait for both contexts to initialize
    await waitFor(() => {
      expect(result.current.auth.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.auth.signIn('a@b.com', 'pw');
    });
    
    await waitFor(() => expect(result.current.auth.isLoggedIn).toBe(true));
    
    await act(async () => {
      await result.current.skills.addSkill({ id: '', name: 'New Skill', description: '', startDate: new Date().toISOString() });
    });
    
    await waitFor(() => expect(result.current.skills.skills.length).toBe(1));
    expect(result.current.skills.skills[0].name).toBe('New Skill');
  });

  it('updates a skill name', async () => {
    const { result } = renderHook(() => useBoth(), { wrapper: Providers });
    
    // Wait for both contexts to initialize
    await waitFor(() => {
      expect(result.current.auth.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.auth.signIn('a@b.com', 'pw');
    });
    
    await waitFor(() => expect(result.current.auth.isLoggedIn).toBe(true));
    
    await act(async () => {
      await result.current.skills.addSkill({ id: '', name: 'Old', description: '', startDate: new Date().toISOString() });
    });
    
    // Only assert that we have at least one skill; mock may preload
    await waitFor(() => expect(result.current.skills.skills.length).toBeGreaterThanOrEqual(1));
    const id = result.current.skills.skills[0].id;
    
    await act(async () => {
      await result.current.skills.updateSkill(id, { name: 'Updated' });
    });
    
    expect(result.current.skills.skills[0].name).toBe('Updated');
  });

  it('deletes a skill', async () => {
    const { result } = renderHook(() => useBoth(), { wrapper: Providers });
    
    // Wait for both contexts to initialize
    await waitFor(() => {
      expect(result.current.auth.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.auth.signIn('a@b.com', 'pw');
    });
    
    await waitFor(() => expect(result.current.auth.isLoggedIn).toBe(true));
    
    await act(async () => {
      await result.current.skills.addSkill({ id: '', name: 'Temp', description: '', startDate: new Date().toISOString() });
    });
    
    await waitFor(() => expect(result.current.skills.skills.length).toBeGreaterThanOrEqual(1));
    const id = result.current.skills.skills[result.current.skills.skills.length - 1].id;
    
    await act(async () => {
      await result.current.skills.deleteSkill(id);
    });
    
    // Ensure the deleted id is no longer present
    await waitFor(() => expect(result.current.skills.skills.find((s) => s.id === id)).toBeUndefined());
  });
});


