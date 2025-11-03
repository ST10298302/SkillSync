/**
 * Root Layout Component
 * Uses Expo Router for file-based navigation (Docs, E., 2025)
 */
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { EnhancedSkillsProvider } from '../context/EnhancedSkillsContext';
import { LanguageProvider } from '../context/LanguageContext';
import { PinLockProvider } from '../context/PinLockContext';
import { SkillsProvider } from '../context/SkillsContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { useUserActivity } from '../hooks/useUserActivity';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SkillsProvider>
          <EnhancedSkillsProvider>
            <LanguageProvider>
              <PinLockProvider>
                <AppLayout />
              </PinLockProvider>
            </LanguageProvider>
          </EnhancedSkillsProvider>
        </SkillsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppLayout() {
  const { isLoggedIn, loading } = useAuth();
  const { resolvedTheme } = useTheme();
  
  // Track user activity to reset session timeout
  useUserActivity();

  if (loading) {
    return null;
  }

  console.log('AppLayout: isLoggedIn =', isLoggedIn);

  return (
    <NavigationThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        <Stack.Screen name="skill/new" options={{ headerShown: false }} />
        <Stack.Screen name="skill/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="pin-verification" options={{ headerShown: false }} />
        <Stack.Screen name="settings/pin-setup" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}