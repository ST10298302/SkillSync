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

describe('Performance Tests', () => {
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
    g.process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBZaJmEhGIVZEev8LAWlYd5HrKEvHu2eg0';
  });

  describe('Authentication Performance', () => {
    it('should handle rapid authentication state changes efficiently', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const startTime = performance.now();
      
      // Perform 10 rapid sign-in/sign-out cycles
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await result.current.signIn('test@example.com', 'password');
        });
        
        await waitFor(() => {
          expect(result.current.isLoggedIn).toBe(true);
        });
        
        await act(async () => {
          await result.current.signOut();
        });
        
        await waitFor(() => {
          expect(result.current.isLoggedIn).toBe(false);
        });
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete 10 cycles in reasonable time (adjust threshold as needed)
      expect(totalTime).toBeLessThan(5000); // 5 seconds
      console.log(`Completed 10 auth cycles in ${totalTime.toFixed(2)}ms`);
    });

    it('should handle concurrent authentication requests efficiently', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const startTime = performance.now();
      
      // Make 20 concurrent sign-in attempts
      const promises = Array(20).fill(null).map((_, index) => 
        result.current.signIn(`user${index}@example.com`, 'password')
      );
      
      await act(async () => {
        await Promise.all(promises);
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle concurrent requests efficiently
      expect(totalTime).toBeLessThan(2000); // 2 seconds
      console.log(`Handled 20 concurrent auth requests in ${totalTime.toFixed(2)}ms`);
      
      // Should end up in consistent state
      expect(result.current.isLoggedIn).toBe(true);
    });
  });

  describe('Skills Management Performance', () => {
    it('should handle large numbers of skills efficiently', async () => {
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

      const startTime = performance.now();
      
      // Add 100 skills
      const addPromises = Array(100).fill(null).map((_, index) => 
        result.current.skills.addSkill({
          id: '',
          name: `Skill ${index + 1}`,
          description: `Description for skill ${index + 1}`,
          startDate: new Date().toISOString()
        })
      );
      
      await act(async () => {
        await Promise.all(addPromises);
      });
      
      const endTime = performance.now();
      const addTime = endTime - startTime;
      
      // Should add 100 skills efficiently
      expect(addTime).toBeLessThan(3000); // 3 seconds
      console.log(`Added 100 skills in ${addTime.toFixed(2)}ms`);
      
      await waitFor(() => {
        expect(result.current.skills.skills.length).toBe(100);
      });
      
      // Test reading performance
      const readStartTime = performance.now();
      const skillNames = result.current.skills.skills.map(skill => skill.name);
      const readEndTime = performance.now();
      const readTime = readEndTime - readStartTime;
      
      // Should read skills efficiently
      expect(readTime).toBeLessThan(100); // 100ms
      console.log(`Read 100 skills in ${readTime.toFixed(2)}ms`);
      
      expect(skillNames).toHaveLength(100);
      expect(skillNames[0]).toBe('Skill 1');
      expect(skillNames[99]).toBe('Skill 100');
    });

    it('should handle bulk operations efficiently', async () => {
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

      // Add 50 skills first
      const addPromises = Array(50).fill(null).map((_, index) => 
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
        expect(result.current.skills.skills.length).toBe(50);
      });

      const startTime = performance.now();
      
      // Update all skills concurrently
      const updatePromises = result.current.skills.skills.map(skill => 
        result.current.skills.updateSkill(skill.id, { 
          name: `Updated ${skill.name}`,
          description: `Updated ${skill.description}`
        })
      );
      
      await act(async () => {
        await Promise.all(updatePromises);
      });
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      // Should update 50 skills efficiently
      expect(updateTime).toBeLessThan(2000); // 2 seconds
      console.log(`Updated 50 skills in ${updateTime.toFixed(2)}ms`);
      
      // Verify updates
      await waitFor(() => {
        const updatedSkills = result.current.skills.skills;
        expect(updatedSkills.every(skill => skill.name.startsWith('Updated '))).toBe(true);
      });
    });

    it('should handle rapid skill operations without performance degradation', async () => {
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

      const operations: Promise<any>[] = [];
      const startTime = performance.now();
      
      // Perform 200 rapid operations (add, update, delete)
      for (let i = 0; i < 200; i++) {
        if (i % 3 === 0) {
          // Add skill
          operations.push(
            result.current.skills.addSkill({
              id: '',
              name: `Rapid Skill ${i}`,
              description: `Rapid Description ${i}`,
              startDate: new Date().toISOString()
            })
          );
        } else if (i % 3 === 1) {
          // Update skill (if exists)
          if (result.current.skills.skills.length > 0) {
            const skill = result.current.skills.skills[0];
            operations.push(
              result.current.skills.updateSkill(skill.id, { name: `Updated ${skill.name}` })
            );
          }
        } else {
          // Delete skill (if exists)
          if (result.current.skills.skills.length > 0) {
            const skill = result.current.skills.skills[0];
            operations.push(
              result.current.skills.deleteSkill(skill.id)
            );
          }
        }
      }
      
      await act(async () => {
        await Promise.all(operations);
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle rapid operations efficiently
      expect(totalTime).toBeLessThan(5000); // 5 seconds
      console.log(`Completed 200 rapid operations in ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not have memory leaks during rapid context operations', async () => {
      // Test that contexts can be rapidly mounted/unmounted without memory issues
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 50; i++) {
        const { unmount } = renderHook(() => {
          const auth = useAuth();
          const skills = useSkills();
          return { auth, skills };
        }, { wrapper });
        
        await waitFor(() => {
          expect(unmount).toBeDefined();
        });
        
        unmount();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      if (initialMemory > 0 && finalMemory > 0) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
        console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      }
    });
  });

  describe('Rendering Performance', () => {
    it('should render large skill lists efficiently', async () => {
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

      const startTime = performance.now();
      
      // Add 200 skills to test rendering performance
      const addPromises = Array(200).fill(null).map((_, index) => 
        result.current.skills.addSkill({
          id: '',
          name: `Render Skill ${index + 1}`,
          description: `Render Description ${index + 1}`,
          startDate: new Date().toISOString()
        })
      );
      
      await act(async () => {
        await Promise.all(addPromises);
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle large skill lists efficiently
      expect(totalTime).toBeLessThan(5000); // 5 seconds
      console.log(`Added 200 skills for rendering test in ${totalTime.toFixed(2)}ms`);
      
      await waitFor(() => {
        expect(result.current.skills.skills.length).toBe(200);
      });
      
      // Test that all skills are accessible
      const allNames = result.current.skills.skills.map(skill => skill.name);
      expect(allNames).toHaveLength(200);
      expect(allNames[0]).toBe('Render Skill 1');
      expect(allNames[199]).toBe('Render Skill 200');
    });
  });
});
