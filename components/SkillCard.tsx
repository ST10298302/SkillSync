import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

interface SkillCardProps {
  id: string;
  name: string;
  progress: number;
  description?: string;
  onPress: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  lastUpdated?: string;
  totalEntries?: number;
  streak?: number;
}

/**
 * Enhanced skill card with modern design, animations, and rich information display
 */
const SkillCard: React.FC<SkillCardProps> = ({ 
  id,
  name, 
  progress, 
  description, 
  onPress,
  onEdit,
  onDelete,
  lastUpdated,
  totalEntries = 0,
  streak = 0
}) => {
  const theme = useColorScheme() ?? 'light';
  const safeTheme = theme === 'light' || theme === 'dark' ? theme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  // Animation refs
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;
  const flameAnim = React.useRef(new Animated.Value(1)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const deleteAnim = React.useRef(new Animated.Value(1)).current;

  // Flame animation
  React.useEffect(() => {
    if (streak > 0) {
      const flameSequence = Animated.sequence([
        Animated.timing(flameAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(flameAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]);
      
      const pulseSequence = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(Animated.parallel([
        Animated.loop(flameSequence),
        Animated.loop(pulseSequence, { iterations: -1, resetBeforeIteration: true }),
      ])).start();
    }
  }, [streak, flameAnim, pulseAnim]);

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

  const handleEditPress = () => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDeletePress = () => {
    Animated.sequence([
      Animated.timing(deleteAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(deleteAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert(
      'Delete Skill',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(id);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) {
      return 'Never';
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Unknown';
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}> 
      <TouchableOpacity
        style={[styles.touchable, { shadowColor: themeColors.shadow.medium }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View
          style={[styles.card, { borderColor: themeColors.border, backgroundColor: themeColors.background }]}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>
                {name}
              </Text>
              <View style={styles.headerActions}>
                {streak > 0 && (
                  <Animated.View 
                    style={[
                      styles.streakContainer, 
                      { 
                        backgroundColor: themeColors.accentGold + '20',
                        transform: [{ scale: flameAnim }]
                      }
                    ]}
                  > 
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <Ionicons name="flame" size={16} color={themeColors.accentGold} />
                    </Animated.View>
                    <Text style={[styles.streakText, { color: themeColors.accentGold }]}>
                      {streak}
                    </Text>
                  </Animated.View>
                )}
                {onEdit && (
                  <TouchableOpacity
                    testID="edit-button"
                    style={[styles.editButton, { backgroundColor: themeColors.accent + '15' }]}
                    onPress={handleEditPress}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={16} color={themeColors.accent} />
                  </TouchableOpacity>
                )}
                {onDelete && (
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
                )}
              </View>
            </View>
            
            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                  {progress}% Complete
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: themeColors.accent }]}> 
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Description Section */}
          {description && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.description, { color: themeColors.textSecondary }]} numberOfLines={2}>
                {description}
              </Text>
            </View>
          )}

          {/* Footer Section */}
          <View style={styles.footer}>
            <View style={styles.metaRow}>
              <View style={styles.metaContainer}>
                <Ionicons name="time-outline" size={14} color={themeColors.textSecondary} />
                <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                  {formatLastUpdated(lastUpdated)}
                </Text>
              </View>
              <View style={styles.metaContainer}>
                <Ionicons name="document-text-outline" size={14} color={themeColors.textSecondary} />
                <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                  {totalEntries} entries
                </Text>
              </View>
            </View>
            
            {/* Arrow Indicator */}
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
            </View>
          </View>
        </View>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minHeight: 140,
  },
  header: {
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    ...Typography.h4,
    flex: 1,
    marginRight: Spacing.sm,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    shadowColor: 'rgba(245, 158, 66, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  streakText: {
    ...Typography.caption,
    marginLeft: Spacing.xs,
    fontWeight: '700',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(239, 68, 68, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  progressSection: {
    marginTop: Spacing.sm,
  },
  progressHeader: {
    alignItems: 'flex-start',
  },
  progressText: {
    ...Typography.bodySmall,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.round,
  },
  progressGradient: {
    flex: 1,
    borderRadius: BorderRadius.round,
  },
  descriptionSection: {
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.bodySmall,
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  metaText: {
    ...Typography.caption,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
});

export default SkillCard;