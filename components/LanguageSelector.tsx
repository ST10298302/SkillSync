import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { SUPPORTED_LANGUAGES, SupportedLanguage, useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface LanguageSelectorProps {
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export default function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const { currentLanguage, changeLanguage, isTranslating } = useLanguage();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  // Handle language selection with haptic feedback and error handling
  const handleLanguageChange = async (language: SupportedLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await changeLanguage(language);
      onLanguageChange?.(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginVertical: Spacing.sm,
    },
    title: {
      ...Typography.h4,
      color: themeColors.text,
      marginBottom: Spacing.md,
      fontWeight: '600',
    },
    languageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    languageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.background,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: themeColors.border,
      minWidth: 120,
    },
    languageButtonActive: {
      backgroundColor: themeColors.accent + '20',
      borderColor: themeColors.accent,
    },
    languageText: {
      ...Typography.bodySmall,
      color: themeColors.text,
      marginLeft: Spacing.sm,
      flex: 1,
    },
    languageTextActive: {
      color: themeColors.accent,
      fontWeight: '600',
    },
    checkIcon: {
      marginLeft: Spacing.xs,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.sm,
    },
    loadingText: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      marginLeft: Spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Language</Text>
      
      {isTranslating && (
        <View style={styles.loadingContainer}>
          <Ionicons name="language" size={16} color={themeColors.textSecondary} />
          <Text style={styles.loadingText}>Translating...</Text>
        </View>
      )}

      <View style={styles.languageGrid}>
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => {
          const isActive = currentLanguage === code;
          return (
            <TouchableOpacity
              key={code}
              style={[styles.languageButton, isActive && styles.languageButtonActive]}
              onPress={() => handleLanguageChange(code as SupportedLanguage)}
              disabled={isTranslating}
            >
              <Ionicons 
                name="language" 
                size={16} 
                color={isActive ? themeColors.accent : themeColors.textSecondary} 
              />
              <Text style={[styles.languageText, isActive && styles.languageTextActive]}>
                {name}
              </Text>
              {isActive && (
                <Ionicons 
                  name="checkmark" 
                  size={16} 
                  color={themeColors.accent} 
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
