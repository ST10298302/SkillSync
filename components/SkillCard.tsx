import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/Colors';

interface SkillCardProps {
  name: string;
  progress: number;
  description?: string;
  onPress: () => void;
  lastUpdated?: string;
  totalEntries?: number;
  streak?: number;
}

/**
 * Enhanced skill card with modern design, animations, and rich information display
 */
const SkillCard: React.FC<SkillCardProps> = ({ 
  name, 
  progress, 
  description, 
  onPress,
  lastUpdated,
  totalEntries = 0,
  streak = 0
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return Colors.light.success;
    if (progress >= 60) return Colors.light.warning;
    if (progress >= 40) return Colors.light.info;
    return Colors.light.secondary;
  };

  const getProgressGradient = (progress: number) => {
    if (progress >= 80) return Colors.light.gradient.success;
    if (progress >= 60) return ['#ff9500', '#ffb74d'];
    if (progress >= 40) return Colors.light.gradient.primary;
    return ['#6c757d', '#8e8e93'];
  };

  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={Colors.light.gradient.background}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.name} numberOfLines={1}>{name}</Text>
              {streak > 0 && (
                <View style={styles.streakContainer}>
                  <Ionicons name="flame" size={16} color={Colors.light.accent} />
                  <Text style={styles.streakText}>{streak}</Text>
                </View>
              )}
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{progress}%</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]}>
                  <LinearGradient
                    colors={getProgressGradient(progress)}
                    style={styles.progressGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>
            </View>
          </View>

          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.metaContainer}>
              <Ionicons name="time-outline" size={14} color={Colors.light.textSecondary} />
              <Text style={styles.metaText}>{formatLastUpdated(lastUpdated)}</Text>
            </View>
            <View style={styles.metaContainer}>
              <Ionicons name="document-text-outline" size={14} color={Colors.light.textSecondary} />
              <Text style={styles.metaText}>{totalEntries} entries</Text>
            </View>
          </View>

          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  touchable: {
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.light.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  name: {
    ...Typography.h4,
    color: Colors.light.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundTertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  streakText: {
    ...Typography.caption,
    color: Colors.light.accent,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.light.backgroundTertiary,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.round,
  },
  progressGradient: {
    flex: 1,
    borderRadius: BorderRadius.round,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.xs,
  },
  arrowContainer: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    marginTop: -10,
  },
});

export default SkillCard;