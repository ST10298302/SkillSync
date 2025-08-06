import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Platform,
    SafeAreaView,
    StatusBar,
    StatusBarStyle,
    StyleSheet,
    View,
    ViewStyle
} from 'react-native';

import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

interface UniformLayoutProps {
  children: React.ReactNode;
  gradientColors?: [string, string];
  showStatusBar?: boolean;
  statusBarStyle?: StatusBarStyle;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
}

/**
 * Uniform layout component that provides consistent design across all pages
 * - Full gradient background that extends to the very top
 * - Safe area handling for notches and system UI
 * - Consistent content positioning
 */
export default function UniformLayout({
  children,
  gradientColors,
  showStatusBar = true,
  statusBarStyle,
  containerStyle,
  contentStyle
}: UniformLayoutProps) {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  // Use provided gradient colors or default to theme gradient
  const colors = gradientColors || (themeColors.gradient.primary as [string, string]);
  const barStyle = statusBarStyle || (safeTheme === 'dark' ? 'light-content' : 'dark-content') as StatusBarStyle;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Full gradient background */}
      <LinearGradient
        colors={colors}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Status bar */}
        {showStatusBar && (
          <StatusBar 
            barStyle={barStyle} 
            backgroundColor="transparent" 
            translucent 
          />
        )}
        
        {/* Safe area container for content */}
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.content, contentStyle]}>
            {children}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 24, // Android status bar padding
  },
}); 