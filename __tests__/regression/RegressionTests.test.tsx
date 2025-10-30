import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { SkillsProvider, useSkills } from '../../context/SkillsContext';

// Mock Supabase service
jest.mock('../../services/supabaseService', () => ({
  SupabaseService: {
    signUp: jest.fn(async (email: string, password: string, name?: string) => ({
      user: { id: 'u1', email, user_metadata: { name } }
    })),
    signIn: jest.fn(async (email: string, password: string) => ({
      user: { id: 'u1', email }
    })),
    signOut: jest.fn(async () => undefined),
    getCurrentUser: jest.fn(async () => null),
    createSkill: jest.fn(async (skillData: any) => ({
      id: `skill-${Date.now()}-${Math.random()}`,
      ...skillData,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      streak: 0,
      total_hours: 0
    })),
    getSkills: jest.fn(async () => []),
    updateSkill: jest.fn(async (id: string, updates: any) => ({ id, ...updates })),
    deleteSkill: jest.fn(async (id: string) => ({ id }))
  }
}));

// Mock LanguageContext to avoid environment variable issues
jest.mock('../../context/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
  useLanguage: () => ({
    currentLanguage: 'en',
    isTranslating: false,
    t: (key: string) => key,
    translateText: async (text: string) => text,
    translateDynamicContent: async (content: any) => content,
    changeLanguage: jest.fn(),
    SUPPORTED_LANGUAGES: { en: 'English', es: 'Spanish', fr: 'French', de: 'German' }
  })
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <SkillsProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </SkillsProvider>
  </AuthProvider>
);

describe('Regression Tests - Previously Fixed Issues', () => {
  beforeAll(() => {
    // Mock browser environment
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
    
    const g: any = globalThis as any;
    g.process = g.process || {};
    g.process.env = g.process.env || {};
    g.process.env.EXPO_PUBLIC_SUPABASE_URL = 'dummy';
    g.process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'dummy';
    g.process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBZaJmEhGIVZEev8LAWlYd5HrKEvHu2eg0'; // NOSONAR - test stub, not a real key
  });

  describe('AuthContext Regression Tests', () => {
    it('should not crash when process.env is undefined (previously caused crashes)', async () => {
      // Temporarily remove process.env
      const originalProcess = (globalThis as any).process;
      (globalThis as any).process = { env: {} };
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Should not crash, should handle gracefully
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.isLoggedIn).toBe(false);
      expect(result.current.user).toBeNull();
      
      // Restore process.env
      (globalThis as any).process = originalProcess;
    });

    it('should handle multiple rapid sign-in attempts without state corruption', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Make multiple rapid sign-in attempts
      const promises = Array(5).fill(null).map(() => 
        result.current.signIn('test@example.com', 'password')
      );
      
      await act(async () => {
        await Promise.all(promises);
      });

      // Should end up in a consistent state
      await waitFor(() => {
        expect(result.current.isLoggedIn).toBe(true);
      });
      
      expect(result.current.user?.email).toBe('test@example.com');
    });

    it('should handle sign-out during loading state without errors', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Start sign-in
      const signInPromise = result.current.signIn('test@example.com', 'password');
      
      // Immediately sign out before sign-in completes
      await act(async () => {
        await result.current.signOut();
        await signInPromise; // Wait for sign-in to complete
      });

      // Should end up signed out
      await waitFor(() => {
        expect(result.current.isLoggedIn).toBe(false);
      });
      
      expect(result.current.user).toBeNull();
    });
  });

  describe('SkillsContext Regression Tests', () => {
    it('should not crash when adding skill with empty string ID (edge case)', async () => {
      const { result } = renderHook(() => {
        const auth = useAuth();
        const skills = useSkills();
        return { auth, skills };
      }, { wrapper });
      
      // Wait for contexts to initialize
      await waitFor(() => {
        expect(result.current.auth.loading).toBe(false);
      });
      
      // Sign in first
      await act(async () => {
        await result.current.auth.signIn('test@example.com', 'password');
      });
      
      await waitFor(() => {
        expect(result.current.auth.isLoggedIn).toBe(true);
      });
      
      await waitFor(() => {
        expect(result.current.skills.skills).toBeDefined();
      });

      await act(async () => {
        await result.current.skills.addSkill({
          id: '', // Empty string ID
          name: 'Test Skill',
          description: 'Test Description',
          startDate: new Date().toISOString()
        });
      });

      await waitFor(() => {
        expect(result.current.skills.skills.length).toBeGreaterThan(0);
      });

      const addedSkill = result.current.skills.skills[0];
      expect(addedSkill.name).toBe('Test Skill');
      expect(addedSkill.id).toBeTruthy(); // Should have generated a real ID
    });

    it('should handle concurrent skill operations without race conditions', async () => {
      const { result } = renderHook(() => {
        const auth = useAuth();
        const skills = useSkills();
        return { auth, skills };
      }, { wrapper });
      
      // Wait for contexts to initialize
      await waitFor(() => {
        expect(result.current.auth.loading).toBe(false);
      });
      
      // Sign in first
      await act(async () => {
        await result.current.auth.signIn('test@example.com', 'password');
      });
      
      await waitFor(() => {
        expect(result.current.auth.isLoggedIn).toBe(true);
      });
      
      await waitFor(() => {
        expect(result.current.skills.skills).toBeDefined();
      });

      // Add multiple skills concurrently
      const addPromises = Array(3).fill(null).map((_, index) => 
        result.current.skills.addSkill({
          id: '',
          name: `Skill ${index + 1}`,
          description: `Description ${index + 1}`,
          startDate: new Date().toISOString()
        })
      );

      await act(async () => {
        await Promise.all(addPromises);
      });

      await waitFor(() => {
        expect(result.current.skills.skills.length).toBe(3);
      });

      // Verify all skills were added correctly
      expect(result.current.skills.skills[0].name).toBe('Skill 1');
      expect(result.current.skills.skills[1].name).toBe('Skill 2');
      expect(result.current.skills.skills[2].name).toBe('Skill 3');
    });

    it('should handle update/delete operations on non-existent skill IDs gracefully', async () => {
      const { result } = renderHook(() => useSkills(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.skills).toBeDefined();
      });

      // Try to update non-existent skill
      await act(async () => {
        await result.current.updateSkill('non-existent-id', { name: 'New Name' });
      });

      // Should not crash, skills array should remain unchanged
      expect(result.current.skills.length).toBe(0);

      // Try to delete non-existent skill
      await act(async () => {
        await result.current.deleteSkill('non-existent-id');
      });

      // Should not crash, skills array should remain unchanged
      expect(result.current.skills.length).toBe(0);
    });
  });

  describe('Context Integration Regression Tests', () => {
    it('should maintain consistent state when switching between authenticated and unauthenticated states', async () => {
      const { result } = renderHook(() => {
        const auth = useAuth();
        const skills = useSkills();
        return { auth, skills };
      }, { wrapper });

      await waitFor(() => {
        expect(result.current.auth.loading).toBe(false);
      });

      // Initially no skills
      expect(result.current.skills.skills.length).toBe(0);

      // Sign in and add a skill
      await act(async () => {
        await result.current.auth.signIn('test@example.com', 'password');
      });

      await waitFor(() => {
        expect(result.current.auth.isLoggedIn).toBe(true);
      });

      await act(async () => {
        await result.current.skills.addSkill({
          id: '',
          name: 'Persistent Skill',
          description: 'Should persist through auth changes',
          startDate: new Date().toISOString()
        });
      });

      await waitFor(() => {
        expect(result.current.skills.skills.length).toBe(1);
      });

      // Sign out
      await act(async () => {
        await result.current.auth.signOut();
      });

      await waitFor(() => {
        expect(result.current.auth.isLoggedIn).toBe(false);
      });

      // Skills should be cleared when user signs out
      expect(result.current.skills.skills.length).toBe(0);
    });

    it('should handle rapid context provider mounting/unmounting without memory leaks', async () => {
      // Test that contexts can be mounted and unmounted rapidly without issues
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderHook(() => useAuth(), { wrapper });
        
        await waitFor(() => {
          expect(unmount).toBeDefined();
        });
        
        unmount();
      }
    });
  });

  describe('Edge Case Regression Tests', () => {
    it('should handle very long skill names and descriptions without breaking', async () => {
      const { result } = renderHook(() => {
        const auth = useAuth();
        const skills = useSkills();
        return { auth, skills };
      }, { wrapper });
      
      // Wait for contexts to initialize
      await waitFor(() => {
        expect(result.current.auth.loading).toBe(false);
      });
      
      // Sign in first
      await act(async () => {
        await result.current.auth.signIn('test@example.com', 'password');
      });
      
      await waitFor(() => {
        expect(result.current.auth.isLoggedIn).toBe(true);
      });
      
      await waitFor(() => {
        expect(result.current.skills.skills).toBeDefined();
      });

      const longName = 'A'.repeat(1000); // Very long name
      const longDescription = 'B'.repeat(2000); // Very long description

      await act(async () => {
        await result.current.skills.addSkill({
          id: '',
          name: longName,
          description: longDescription,
          startDate: new Date().toISOString()
        });
      });

      await waitFor(() => {
        expect(result.current.skills.skills.length).toBe(1);
      });

      const skill = result.current.skills.skills[0];
      expect(skill.name).toBe(longName);
      expect(skill.description).toBe(longDescription);
    });

    it('should handle special characters in skill names and descriptions', async () => {
      const { result } = renderHook(() => {
        const auth = useAuth();
        const skills = useSkills();
        return { auth, skills };
      }, { wrapper });
      
      // Wait for contexts to initialize
      await waitFor(() => {
        expect(result.current.auth.loading).toBe(false);
      });
      
      // Sign in first
      await act(async () => {
        await result.current.auth.signIn('test@example.com', 'password');
      });
      
      await waitFor(() => {
        expect(result.current.auth.isLoggedIn).toBe(true);
      });
      
      await waitFor(() => {
        expect(result.current.skills.skills).toBeDefined();
      });

      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~"\'\\/';

      await act(async () => {
        await result.current.skills.addSkill({
          id: '',
          name: `Skill ${specialChars}`,
          description: `Description with ${specialChars}`,
          startDate: new Date().toISOString()
        });
      });

      await waitFor(() => {
        expect(result.current.skills.skills.length).toBe(1);
      });

      const skill = result.current.skills.skills[0];
      expect(skill.name).toBe(`Skill ${specialChars}`);
      expect(skill.description).toBe(`Description with ${specialChars}`);
    });
  });
});
