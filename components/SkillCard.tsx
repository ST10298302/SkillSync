import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { LevelBadge } from './LevelBadge';

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
  current_level?: 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'expert';
  likes_count?: number;
  comments_count?: number;
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
  current_level,
  likes_count,
  comments_count,
}: SkillCardProps) {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const { translateText, currentLanguage, t } = useLanguage();
  const [translatedName, setTranslatedName] = useState(name);
  const [translatedDescription, setTranslatedDescription] = useState(description || '');

  // Animation values for interactive feedback and visual effects
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flameAnim = useRef(new Animated.Value(1)).current;
  const deleteAnim = useRef(new Animated.Value(1)).current;

  // Create subtle animation loops for skills with active streaks to show momentum
  useEffect(() => {
    if (streak > 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      const flameLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
          Animated.timing(flameAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
      flameLoop.start();
      return () => {
        loop.stop();
        flameLoop.stop();
      };
    }
  }, [streak, pulseAnim, flameAnim]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.98, duration: 120, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0.95, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleEdit = () => {
    onEdit(id);
  };

  const handleEditPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start(() => handleEdit());
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
          onPress: () => onDelete(id),
        },
      ]
    );
  };

  const handleDeletePress = () => {
    Animated.sequence([
      Animated.timing(deleteAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(deleteAnim, { toValue: 1, useNativeDriver: true }),
    ]).start(() => handleDelete());
  };

  // Automatically translate skill content when user changes language (display only, not stored)
  useEffect(() => {
    const translateContent = async () => {
      if (currentLanguage !== 'en') {
        try {
          const nameToTranslate = name && name.trim() ? name.trim() : 'Skill';
          const descToTranslate = description && description.trim() ? description.trim() : '';

          const translatedNameResult = await translateText(nameToTranslate);
          const translatedDescResult = descToTranslate ? await translateText(descToTranslate) : '';

          setTranslatedName(translatedNameResult || nameToTranslate);
          setTranslatedDescription(translatedDescResult || descToTranslate);
        } catch (error) {
          console.error('Translation failed:', error);
          setTranslatedName(name || 'Skill');
          setTranslatedDescription(description || '');
        }
      } else {
        setTranslatedName(name || 'Skill');
        setTranslatedDescription(description || '');
      }
    };

    translateContent();
  }, [name, description, currentLanguage, translateText]);

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

  // Calculate progress values and colors with safety bounds
  const progressPercentage = Math.min(Math.max(typeof progress === 'number' ? progress : 0, 0), 100);
  const progressColor = progressPercentage >= 100 ? themeColors.success : themeColors.accent;
  const accentGold = (themeColors as any)?.accentGold ?? themeColors.accent;

  // Component styling with theme-aware colors and consistent spacing
  const styles = StyleSheet.create({
    // Container wrapper for consistent width
    container: {
      width: '100%',
    },
    // Touchable area with shadow effects
    touchable: {
      borderRadius: BorderRadius.xl,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },

    // Main card container with border and shadow
    card: {
      backgroundColor: themeColors.background,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      shadowColor: (themeColors as any)?.shadow?.medium ?? '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: themeColors.border,
    },

    // Header / Title row
    header: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      marginBottom: Spacing.md,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.sm,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    titleContainer: {
      flex: 1,
      marginRight: Spacing.sm,
    },

    // Text
    name: {
      ...Typography.h3,
      color: themeColors.text,
      marginBottom: Spacing.xs,
      fontWeight: '600',
      maxWidth: '80%',
    },
    description: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      lineHeight: 18,
    },

    // Actions
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
    editButton: {
      width: 28,
      height: 28,
      borderRadius: BorderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.accent + '40',
    },
    deleteButton: {
      width: 28,
      height: 28,
      borderRadius: BorderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.error + '40',
    },

    // Progress
    progressContainer: {
      marginBottom: Spacing.md,
    },
    progressSection: {
      marginTop: Spacing.xs,
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
    progressBarContainer: {
      width: 140,
      height: 8,
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.round,
      overflow: 'hidden',
      marginLeft: Spacing.sm,
    },
    // Progress bar fill element (inner bar showing completion)
    progressBar: {
      height: '100%',
      borderRadius: BorderRadius.round,
    },
    // Alternative progress fill for compatibility
    progressFill: {
      height: '100%',
      borderRadius: BorderRadius.round,
    },

    // Streak pill
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: accentGold + '40',
      marginRight: Spacing.xs,
      gap: 4,
    },
    streakText: {
      ...Typography.caption,
      fontWeight: '700',
    },

    // Stats & footer (from main)
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    stat: { alignItems: 'center' },
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

  // Render the skill card with animations and interactive elements
  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
    >
      <TouchableOpacity
        style={[styles.touchable, { shadowColor: (themeColors as any)?.shadow?.medium ?? '#000' }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View
          style={[
            styles.card,
            { borderColor: themeColors.border, backgroundColor: themeColors.background },
          ]}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>
                    {translatedName || ' '}
                  </Text>
                  {current_level && (
                    <LevelBadge level={current_level} size="small" />
                  )}
                </View>
                {!!translatedDescription && (
                  <Text style={styles.description} numberOfLines={2}>
                    {translatedDescription}
                  </Text>
                )}
              </View>

              <View style={styles.headerActions}>
                {streak > 0 && (
                  <Animated.View
                    style={[
                      styles.streakContainer,
                      {
                        backgroundColor: accentGold + '20',
                        transform: [{ scale: flameAnim }],
                      },
                    ]}
                  >
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <Ionicons name="flame" size={16} color={accentGold} />
                    </Animated.View>
                    <Text style={[styles.streakText, { color: accentGold }]}>{streak}</Text>
                  </Animated.View>
                )}

                <TouchableOpacity
                  testID="edit-button"
                  style={[styles.editButton, { backgroundColor: themeColors.accent + '15' }]}
                  onPress={handleEditPress}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={16} color={themeColors.accent} />
                </TouchableOpacity>

                <Animated.View style={{ transform: [{ scale: deleteAnim }] }}>
                  <TouchableOpacity
                    testID="delete-button"
                    style={[styles.deleteButton, { backgroundColor: themeColors.error + '15' }]}
                    onPress={handleDeletePress}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={themeColors.error} />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                  {progressPercentage >= 100 ? t('complete') : `${progressPercentage}%`} {t('progress')}
                </Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${progressPercentage}%`, backgroundColor: progressColor },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalEntries}</Text>
              <Text style={styles.statLabel}>{t('entries')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>{t('streak')}</Text>
            </View>
            {typeof likes_count === 'number' && likes_count > 0 && (
              <View style={[styles.stat, { flexDirection: 'row', gap: 4, alignItems: 'center' }]}>
                <Ionicons name="heart" size={16} color={themeColors.error} />
                <Text style={styles.statValue}>{likes_count}</Text>
              </View>
            )}
            {typeof comments_count === 'number' && comments_count > 0 && (
              <View style={[styles.stat, { flexDirection: 'row', gap: 4, alignItems: 'center' }]}>
                <Ionicons name="chatbubble-outline" size={16} color={themeColors.accent} />
                <Text style={styles.statValue}>{comments_count}</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          {!!lastUpdated && (
            <View style={styles.footer}>
              <Text style={styles.lastUpdated}>
                {t('lastUpdated')}: {formatDate(lastUpdated)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
