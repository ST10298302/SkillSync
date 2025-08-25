import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { SkillsProvider } from '../context/SkillsContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SkillsProvider>
          <AppLayout />
        </SkillsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppLayout() {
  const { isLoggedIn, loading } = useAuth();
  const { resolvedTheme } = useTheme();

  if (loading) {
    return null;
  }

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
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}