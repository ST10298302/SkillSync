import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useLanguage } from '../context/LanguageContext';
import { useColorScheme } from '../hooks/useColorScheme';

interface SkillCardProps {
  id: string;
  name: string;
  progress: number;
  description?: string;
  onPress: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  lastUpdated?: string;
  totalEntries?: number;
  streak?: number;
}

export default function SkillCard({
  id,
  name,
  progress,
  description,
  onPress,
  onEdit,
  onDelete,
  lastUpdated,
  totalEntries = 0,
  streak = 0,
}: SkillCardProps) {
  const theme = useColorScheme();
  const safeTheme = theme === 'light' || theme === 'dark' ? theme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const { translateText, currentLanguage, t } = useLanguage();
  const [translatedName, setTranslatedName] = useState(name);
  const [translatedDescription, setTranslatedDescription] = useState(description || '');

  // Translate content when language changes - FOR DISPLAY ONLY
  useEffect(() => {
    const translateContent = async () => {
      if (currentLanguage !== 'en') {
        try {
          // Ensure we have valid content to translate
          const nameToTranslate = name && name.trim() ? name.trim() : 'Skill';
          const descToTranslate = description && description.trim() ? description.trim() : '';
          
          const translatedNameResult = await translateText(nameToTranslate);
          const translatedDescResult = descToTranslate ? await translateText(descToTranslate) : '';
          
          setTranslatedName(translatedNameResult || nameToTranslate);
          setTranslatedDescription(translatedDescResult || descToTranslate);
        } catch (error) {
          console.error('Translation failed:', error);
          // Fallback to original text
          setTranslatedName(name || 'Skill');
          setTranslatedDescription(description || '');
        }
      } else {
        // Reset to original text for English
        setTranslatedName(name || 'Skill');
        setTranslatedDescription(description || '');
      }
    };

    translateContent();
  }, [name, description, currentLanguage, translateText]);

  const handleEdit = () => {
    onEdit(id);
  };

  const handleDelete = () => {
    Alert.alert(
      t('delete'),
      `${t('delete')} "${translatedName}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete'), 
          style: 'destructive',
          onPress: () => onDelete(id)
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return `1 ${t('daysAgo')}`;
    if (diffDays < 7) return `${diffDays} ${t('daysAgo')}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: themeColors.background,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.md,
    },
    titleContainer: {
      flex: 1,
      marginRight: Spacing.sm,
    },
    name: {
      ...Typography.h3,
      color: themeColors.text,
      marginBottom: Spacing.xs,
      fontWeight: '600',
    },
    description: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      lineHeight: 18,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    progressContainer: {
      marginBottom: Spacing.md,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    progressText: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      fontWeight: '500',
    },
    progressBar: {
      height: 8,
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.round,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: BorderRadius.round,
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      ...Typography.h4,
      color: themeColors.text,
      fontWeight: '700',
    },
    statLabel: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      marginTop: 2,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: themeColors.borderSecondary,
    },
    lastUpdated: {
      ...Typography.caption,
      color: themeColors.textTertiary,
    },
  });

  const progressPercentage = Math.min(progress, 100);
  const progressColor = progressPercentage >= 100 ? themeColors.success : themeColors.accent;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {translatedName || ' '}
          </Text>
          {translatedDescription && (
            <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
              {translatedDescription || ' '}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={16} color={themeColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={16} color={themeColors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {progressPercentage >= 100 ? t('complete') : `${progressPercentage}%`}
          </Text>
          <Text style={styles.progressText}>{t('progress')}</Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: progressColor,
                width: `${progressPercentage}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalEntries}</Text>
          <Text style={styles.statLabel}>{t('entries')}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>{t('streak')}</Text>
        </View>
      </View>

      {lastUpdated && (
        <View style={styles.footer}>
          <Text style={styles.lastUpdated}>
            {t('lastUpdated')}: {formatDate(lastUpdated)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}