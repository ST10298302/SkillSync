import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import DiaryItem from '../../components/DiaryItem';
import ProgressBar from '../../components/ProgressBar';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useSkills } from '../../context/SkillsContext';
import { useTheme } from '../../context/ThemeContext';

/**
 * Enhanced skill detail screen with modern design and improved UX
 */
export default function SkillDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { skills, addEntry, addProgressUpdate } = useSkills();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const skill = skills.find(s => s.id === id);
  const [entryText, setEntryText] = useState('');
  const [hoursInput, setHoursInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progressInput, setProgressInput] = useState('');
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Show loading state while skills are being loaded
  if (skills.length === 0) {
    return (
      <UniformLayout>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </UniformLayout>
    );
  }

  if (!skill) {
    return (
      <UniformLayout>
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={64} color={Colors[safeTheme].error} />
          <Text style={styles.errorTitle}>Skill not found</Text>
          <Text style={styles.errorSubtitle}>The skill you are looking for does not exist</Text>
        </View>
      </UniformLayout>
    );
  }

  const handleAddEntry = async () => {
    if (!entryText.trim()) {
      setError('Please enter some text');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const hours = hoursInput.trim() ? parseFloat(hoursInput) : 0;
    if (hoursInput.trim() && (isNaN(hours) || hours < 0)) {
      setError('Hours must be a positive number');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsAddingEntry(true);
    try {
      await addEntry(skill.id, entryText.trim(), hours);
      setEntryText('');
      setHoursInput('');
      setError(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError('Failed to add entry');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAddingEntry(false);
    }
  };

  const handleAddProgress = async () => {
    const trimmed = progressInput.trim();
    if (!trimmed) {
      setError('Enter a progress value');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const value = Number(trimmed);
    if (isNaN(value) || value < 0 || value > 100) {
      setError('Progress must be a number between 0 and 100');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await addProgressUpdate(skill!.id, value);
      setProgressInput('');
      setError(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError('Failed to update progress');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleIncreaseProgress = async () => {
    const newValue = Math.min(100, skill.progress + 10);
    try {
      await addProgressUpdate(skill.id, newValue);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      setError('Failed to update progress');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return Colors[safeTheme].success;
    if (progress >= 60) return Colors[safeTheme].warning;
    if (progress >= 40) return Colors[safeTheme].info;
    return Colors[safeTheme].accent;
  };

  return (
    <UniformLayout>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                             <LinearGradient
                   colors={Colors.light.gradient.primary as any}
                   style={styles.headerGradient}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 1 }}
                 >
              <View style={styles.headerContent}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.back();
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill?.name || 'Unnamed Skill'}</Text>
                  <Text style={styles.skillDate}>Started {formatDate(skill?.startDate || new Date().toISOString())}</Text>
                  {skill?.description && skill.description.trim() && (
                    <Text style={styles.skillDescription}>{skill.description}</Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Progress Section */}
          <Animated.View style={[styles.progressSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                         <LinearGradient
               colors={Colors.light.gradient.background as any}
               style={styles.progressCard}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
             >
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Current Progress</Text>
                <Text style={[styles.progressValue, { color: getProgressColor(skill.progress) }]}>
                  {skill.progress}%
                </Text>
              </View>

              <ProgressBar progress={skill.progress} height={12} />

              <View style={styles.progressActions}>
                <TouchableOpacity
                  style={styles.progressButton}
                  onPress={handleIncreaseProgress}
                >
                                  <LinearGradient
                  colors={Colors[safeTheme].gradient.primary}
                  style={styles.progressButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="add" size={20} color={Colors[safeTheme].text} />
                  <Text style={styles.progressButtonText}>+10%</Text>
                </LinearGradient>
                </TouchableOpacity>

                <View style={styles.progressInputContainer}>
                  <TextInput
                    style={styles.progressInput}
                    placeholder="Enter progress (0-100%)"
                    value={progressInput}
                    onChangeText={setProgressInput}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                  <TouchableOpacity
                    style={styles.progressSetButton}
                    onPress={handleAddProgress}
                  >
                    <Text style={styles.progressSetText}>Set</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Progress Updates */}
          <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.sectionTitle}>Progress Updates</Text>
            {skill.progressUpdates.length === 0 ? (
              <LinearGradient
                colors={Colors.light.gradient.background}
                style={styles.emptyCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="trending-up-outline" size={48} color={Colors.light.textSecondary} />
                <Text style={styles.emptyTitle}>No progress updates yet</Text>
                <Text style={styles.emptySubtitle}>Use the buttons above to track your progress</Text>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={Colors.light.gradient.background}
                style={styles.updatesCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                                  <FlatList
                    data={[...skill.progressUpdates].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.updateItem}>
                        <View style={styles.updateHeader}>
                          <Text style={styles.updateValue}>{item.progress}%</Text>
                          <Text style={styles.updateDate}>{formatDate(item.created_at)}</Text>
                        </View>
                      </View>
                    )}
                    scrollEnabled={false}
                  />
              </LinearGradient>
            )}
          </Animated.View>

          {/* Diary Section */}
          <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.sectionTitle}>Diary Entries</Text>
            {skill.entries.length === 0 ? (
              <LinearGradient
                colors={Colors.light.gradient.background}
                style={styles.emptyCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="document-text-outline" size={48} color={Colors.light.textSecondary} />
                <Text style={styles.emptyTitle}>No diary entries yet</Text>
                <Text style={styles.emptySubtitle}>Start documenting your learning journey below</Text>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={Colors.light.gradient.background}
                style={styles.entriesCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FlatList
                  data={[...skill.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => <DiaryItem text={item.text} date={item.date} hours={item.hours} />}
                  scrollEnabled={false}
                />
              </LinearGradient>
            )}
          </Animated.View>

          {/* Add Entry Section */}
          <Animated.View style={[styles.addEntrySection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient
              colors={Colors.light.gradient.background}
              style={styles.addEntryCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={Colors.light.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.entryInput, { flex: 1, marginRight: Spacing.sm }]}
                  placeholder="Write about your progress..."
                  value={entryText}
                  onChangeText={setEntryText}
                  multiline
                  placeholderTextColor={Colors.light.textSecondary}
                  textAlignVertical="top"
                />
                <TextInput
                  style={styles.hoursInput}
                  placeholder="Hours"
                  value={hoursInput}
                  onChangeText={setHoursInput}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              <TouchableOpacity
                style={[styles.addEntryButton, isAddingEntry && styles.addEntryButtonDisabled]}
                onPress={handleAddEntry}
                disabled={isAddingEntry}
              >
                <LinearGradient
                  colors={isAddingEntry ? [Colors.light.backgroundSecondary, Colors.light.backgroundSecondary] : Colors.light.gradient.primary}
                  style={styles.addEntryButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isAddingEntry ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={[styles.loadingSpinner, { transform: [{ rotate: '360deg' }] }]} />
                      <Text style={styles.loadingText}>Adding...</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="add" size={20} color={Colors.light.text} />
                      <Text style={styles.addEntryButtonText}>Add Entry</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </UniformLayout>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorSubtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerGradient: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: Spacing.md,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    ...Typography.h1,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  skillDate: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  skillDescription: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  progressSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  progressCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  progressValue: {
    ...Typography.h2,
    fontWeight: 'bold',
  },
  progressActions: {
    marginTop: Spacing.md,
  },
  progressButton: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  progressButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  progressButtonText: {
    ...Typography.button,
    color: Colors.light.text,
    marginLeft: Spacing.xs,
  },
  progressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressInput: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    ...Typography.body,
    color: Colors.light.text,
  },
  progressSetButton: {
    backgroundColor: Colors.light.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  progressSetText: {
    ...Typography.button,
    color: Colors.light.text,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.light.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  updatesCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  updateItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderSecondary,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateValue: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
  },
  updateDate: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },
  entriesCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addEntrySection: {
    paddingHorizontal: Spacing.lg,
  },
  addEntryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.error + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.light.error,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  entryInput: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 100,
    ...Typography.body,
    color: Colors.light.text,
    textAlignVertical: 'top',
  },
  hoursInput: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: 80,
    height: 50,
    ...Typography.body,
    color: Colors.light.text,
    textAlign: 'center',
  },
  addEntryButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  addEntryButtonDisabled: {
    opacity: 0.7,
  },
  addEntryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  addEntryButtonText: {
    ...Typography.button,
    color: Colors.light.text,
    marginLeft: Spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.light.text,
    borderTopColor: 'transparent',
    borderRadius: BorderRadius.round,
    marginRight: Spacing.sm,
  },
  loadingText: {
    ...Typography.button,
    color: Colors.light.text,
  },
});