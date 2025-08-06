import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { Colors } from '../constants/Colors';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SkillsProvider } from '../context/SkillsContext';
import { useColorScheme } from '../hooks/useColorScheme';

/**
 * Root layout for the app.  It wraps the navigation stack with
 * providers for authentication and skill data.  It also applies
 * light/dark themes based on the system color scheme.  Screens
 * are guarded using the authentication state inside AppLayout.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <SkillsProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AppLayout />
        </ThemeProvider>
      </SkillsProvider>
    </AuthProvider>
  );
}

/**
 * AppLayout contains the navigation stack.  It reads the
 * authentication state and uses protected routes to control
 * access.  While the authentication state is loading, it
 * renders nothing to avoid flickering between auth and main
 * content.
 */
function AppLayout() {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return null;
  }

  return (
    <>
      {isLoggedIn ? (
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.light.primary,
            tabBarInactiveTintColor: Colors.light.textSecondary,
            tabBarStyle: {
              backgroundColor: Colors.light.background,
              borderTopColor: Colors.light.border,
              borderTopWidth: 1,
              paddingBottom: 8,
              paddingTop: 8,
              height: 88,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Skills',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="library-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: 'Analytics',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="analytics-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="skill"
            options={{
              href: null, // Hide from tab bar
            }}
          />
        </Tabs>
      ) : (
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.light.primary,
            tabBarInactiveTintColor: Colors.light.textSecondary,
            tabBarStyle: {
              backgroundColor: Colors.light.background,
              borderTopColor: Colors.light.border,
              borderTopWidth: 1,
              paddingBottom: 8,
              paddingTop: 8,
              height: 88,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}
        >
          <Tabs.Screen
            name="auth/login"
            options={{
              title: 'Sign In',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="log-in-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="auth/signup"
            options={{
              title: 'Sign Up',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-add-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      )}
      <StatusBar style="auto" />
    </>
  );
}