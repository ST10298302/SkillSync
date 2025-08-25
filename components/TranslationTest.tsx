import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function TranslationTest() {
  const { translateText, currentLanguage, isTranslating } = useLanguage();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const testTexts = [
    'Hello, welcome to SkillSync!',
    'Track your learning progress',
    'Add new skills',
    'View your profile',
  ];

  const testTranslation = async (text: string) => {
    try {
      const translated = await translateText(text);
      console.log(` Translation test: "${text}" → "${translated}"`);
    } catch (error) {
      console.error('Translation test failed:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      margin: Spacing.md,
    },
    title: {
      ...Typography.h4,
      color: themeColors.text,
      marginBottom: Spacing.sm,
    },
    subtitle: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      marginBottom: Spacing.md,
    },
    testButton: {
      backgroundColor: themeColors.accent + '20',
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      marginVertical: Spacing.xs,
    },
    testButtonText: {
      ...Typography.bodySmall,
      color: themeColors.accent,
      textAlign: 'center',
    },
    status: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation Test</Text>
      <Text style={styles.subtitle}>
        Current Language: {currentLanguage}
      </Text>
      
      {testTexts.map((text, index) => (
        <TouchableOpacity
          key={index}
          style={styles.testButton}
          onPress={() => testTranslation(text)}
          disabled={isTranslating}
        >
          <Text style={styles.testButtonText}>{text}</Text>
        </TouchableOpacity>
      ))}
      
      {isTranslating && (
        <Text style={styles.status}>Translating...</Text>
      )}
    </View>
  );
}
