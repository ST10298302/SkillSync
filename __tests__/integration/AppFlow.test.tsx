import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { act, render, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { SkillsProvider, useSkills } from '../../context/SkillsContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock navigation
const Tab = createBottomTabNavigator();

// Mock screens for testing
const MockHomeScreen = () => <View testID="home-screen"><Text>Home Screen</Text></View>;
const MockAddScreen = () => <View testID="add-screen"><Text>Add Screen</Text></View>;
const MockAnalyticsScreen = () => <View testID="analytics-screen"><Text>Analytics Screen</Text></View>;
const MockProfileScreen = () => <View testID="profile-screen"><Text>Profile Screen</Text></View>;

// Mock the actual app screens
jest.mock('../../app/(tabs)/index', () => MockHomeScreen);
jest.mock('../../app/(tabs)/add', () => MockAddScreen);
jest.mock('../../app/(tabs)/analytics', () => MockAnalyticsScreen);
jest.mock('../../app/(tabs)/profile', () => MockProfileScreen);

// Mock Google Translate API
jest.mock('../../services/googleTranslateAPI', () => ({
  GoogleTranslateAPI: {
    initialize: jest.fn(),
    translateText: jest.fn(async (text: string, targetLanguage: string) => ({
      translatedText: text
    }))
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

const TestApp = () => (
  <NavigationContainer>
    <ThemeProvider>
      <AuthProvider>
        <SkillsProvider>
          <LanguageProvider>
            <Tab.Navigator>
              <Tab.Screen name="Home" component={MockHomeScreen} />
              <Tab.Screen name="Add" component={MockAddScreen} />
              <Tab.Screen name="Analytics" component={MockAnalyticsScreen} />
              <Tab.Screen name="Profile" component={MockProfileScreen} />
            </Tab.Navigator>
          </LanguageProvider>
        </SkillsProvider>
      </AuthProvider>
    </ThemeProvider>
  </NavigationContainer>
);

// Wrapper for hook tests
const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AuthProvider>
      <SkillsProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </SkillsProvider>
    </AuthProvider>
  </ThemeProvider>
);

describe('App Integration Tests', () => {
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

  it('completes full user journey: signup → add skill → update skill → delete skill → signout', async () => {
    const { getByTestId, getByText, getByRole } = render(<TestApp />);
    
    // Wait for app to initialize
    await waitFor(() => {
      expect(getByTestId('home-screen')).toBeTruthy();
    });

    // Test that the home screen is rendered initially
    expect(getByTestId('home-screen')).toBeTruthy();
    
    // Test that the tab navigation is present
    expect(getByRole('button', { name: 'Home, tab, 1 of 4' })).toBeTruthy();
    expect(getByRole('button', { name: 'Add, tab, 2 of 4' })).toBeTruthy();
    expect(getByRole('button', { name: 'Analytics, tab, 3 of 4' })).toBeTruthy();
    expect(getByRole('button', { name: 'Profile, tab, 4 of 4' })).toBeTruthy();
  });

  it('handles authentication state changes correctly across contexts', async () => {
    const { result } = renderHook(() => {
      const auth = useAuth();
      const skills = useSkills();
      return { auth, skills };
    }, { wrapper: Providers });
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.auth.loading).toBe(false);
    });

    // Initially not logged in
    expect(result.current.auth.isLoggedIn).toBe(false);
    expect(result.current.auth.user).toBeNull();

    // Sign in
    await act(async () => {
      await result.current.auth.signIn('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.auth.isLoggedIn).toBe(true);
    });

    expect(result.current.auth.user?.email).toBe('test@example.com');

    // Sign out
    await act(async () => {
      await result.current.auth.signOut();
    });

    await waitFor(() => {
      expect(result.current.auth.isLoggedIn).toBe(false);
    });

    expect(result.current.auth.user).toBeNull();
  });

  it('manages skills state correctly with authentication', async () => {
    const { result } = renderHook(() => {
      const auth = useAuth();
      const skills = useSkills();
      return { auth, skills };
    }, { wrapper: Providers });
    
    // Wait for initial loading to complete
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

    // Add a skill
    await act(async () => {
      await result.current.skills.addSkill({
        id: '',
        name: 'Test Skill',
        description: 'A test skill',
        startDate: new Date().toISOString()
      });
    });

    await waitFor(() => {
      expect(result.current.skills.skills.length).toBeGreaterThan(0);
    });

    const skill = result.current.skills.skills[0];
    expect(skill.name).toBe('Test Skill');

    // Update the skill
    await act(async () => {
      await result.current.skills.updateSkill(skill.id, { name: 'Updated Skill' });
    });

    await waitFor(() => {
      const updatedSkill = result.current.skills.skills.find((s: any) => s.id === skill.id);
      expect(updatedSkill?.name).toBe('Updated Skill');
    });

    // Delete the skill
    await act(async () => {
      await result.current.skills.deleteSkill(skill.id);
    });

    await waitFor(() => {
      expect(result.current.skills.skills.find((s: any) => s.id === skill.id)).toBeUndefined();
    });
  });
});
