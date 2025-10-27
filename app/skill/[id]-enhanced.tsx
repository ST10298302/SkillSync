import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { CommentThread } from '../../components/CommentThread';
import DiaryItem from '../../components/DiaryItem';
import { LevelBadge } from '../../components/LevelBadge';
import { MilestoneTracker } from '../../components/MilestoneTracker';
import ProgressBar from '../../components/ProgressBar';
import { ReactionButton } from '../../components/ReactionButton';
import { ResourceCard } from '../../components/ResourceCard';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useEnhancedSkills } from '../../context/EnhancedSkillsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSkills } from '../../context/SkillsContext';
import { useTheme } from '../../context/ThemeContext';

type TabType = 'overview' | 'milestones' | 'resources' | 'comments';

export default function EnhancedSkillDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { skills } = useSkills();
  const { 
    skillMilestones, 
    skillResources, 
    skillComments,
    getMilestones, 
    getResources, 
    getComments,
    refreshSkills 
  } = useEnhancedSkills();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  
  const skill = skills.find(s => s.id === id);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Load enhanced data
  useEffect(() => {
    if (id) {
      getMilestones(id);
      getResources(id);
      getComments(id);
    }
  }, [id]);

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

  if (!skill) {
    return (
      <UniformLayout>
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={64} color={Colors[safeTheme].error} />
          <Text style={styles.errorTitle}>{t('skillNotFound')}</Text>
        </View>
      </UniformLayout>
    );
  }

  const handleRefresh = async () => {
    if (id) {
      await Promise.all([
        getMilestones(id),
        getResources(id),
        getComments(id),
        refreshSkills(),
      ]);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            {/* Progress Updates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('progressUpdates')}</Text>
              {skill.progressUpdates.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="trending-up-outline" size={48} color={Colors.light.textSecondary} />
                  <Text style={styles.emptyTitle}>{t('noProgressUpdates')}</Text>
                </View>
              ) : (
                <View style={styles.updatesCard}>
                  <FlatList
                    data={[...skill.progressUpdates].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.updateItem}>
                        <Text style={styles.updateValue}>{item.progress}%</Text>
                        <Text style={styles.updateDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                      </View>
                    )}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>

            {/* Diary Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('diaryEntries')}</Text>
              {skill.entries.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="document-text-outline" size={48} color={Colors.light.textSecondary} />
                  <Text style={styles.emptyTitle}>{t('noDiaryEntries')}</Text>
                </View>
              ) : (
                <View style={styles.entriesCard}>
                  <FlatList
                    data={[...skill.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <DiaryItem text={item.text} date={item.date} hours={item.hours} />}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>
          </View>
        );
      
      case 'milestones':
        return (
          <MilestoneTracker 
            skillId={skill.id} 
            milestones={skillMilestones} 
            onRefresh={handleRefresh}
          />
        );
      
      case 'resources':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Resources</Text>
            {skillResources.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="book-outline" size={48} color={Colors.light.textSecondary} />
                <Text style={styles.emptyTitle}>No resources yet</Text>
              </View>
            ) : (
              skillResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            )}
          </View>
        );
      
      case 'comments':
        return (
          <CommentThread 
            skillId={skill.id} 
            comments={skillComments} 
            onRefresh={handleRefresh}
          />
        );
    }
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
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={Colors.light.gradient.primary as any}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <View style={styles.skillInfo}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <LevelBadge level={skill.current_level || 'beginner'} size="small" />
                  </View>
                  {skill.description && (
                    <Text style={styles.skillDescription}>{skill.description}</Text>
                  )}
                  <View style={styles.skillStats}>
                    <ReactionButton skillId={skill.id} reactionCount={skill.likes_count || 0} />
                    <View style={styles.statItem}>
                      <Ionicons name="chatbubble-outline" size={16} color={Colors.light.textSecondary} />
                      <Text style={styles.statText}>{skill.comments_count || 0}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Progress Section */}
          <Animated.View style={[styles.progressSection, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={Colors.light.gradient.background as any}
              style={styles.progressCard}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>{t('currentProgress')}</Text>
                <Text style={styles.progressValue}>{skill.progress}%</Text>
              </View>
              <ProgressBar progress={skill.progress} height={12} />
            </LinearGradient>
          </Animated.View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {(['overview', 'milestones', 'resources', 'comments'] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {renderTabContent()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </UniformLayout>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  errorTitle: { ...Typography.h2, color: Colors.light.text, marginTop: Spacing.md },
  header: { marginBottom: Spacing.lg },
  headerGradient: { paddingTop: Spacing.xl, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  headerContent: { flexDirection: 'row', alignItems: 'flex-start' },
  backButton: { padding: Spacing.sm, borderRadius: BorderRadius.round, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginRight: Spacing.md },
  skillInfo: { flex: 1 },
  skillHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  skillName: { ...Typography.h1, color: Colors.light.text, marginRight: Spacing.sm },
  skillDescription: { ...Typography.body, color: Colors.light.textSecondary, marginBottom: Spacing.sm },
  skillStats: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  statItem: { flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.md },
  statText: { ...Typography.bodySmall, color: Colors.light.textSecondary, marginLeft: 4 },
  progressSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  progressCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.light.border },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  progressTitle: { ...Typography.h3, color: Colors.light.text },
  progressValue: { ...Typography.h2, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.light.accent },
  tabText: { ...Typography.body, color: Colors.light.textSecondary },
  tabTextActive: { color: Colors.light.accent, fontWeight: '600' },
  tabContent: { paddingHorizontal: Spacing.lg },
  section: { marginVertical: 16 },
  sectionTitle: { ...Typography.h3, color: Colors.light.text, marginBottom: Spacing.md },
  emptyCard: { padding: Spacing.xl, borderRadius: BorderRadius.lg, alignItems: 'center', backgroundColor: Colors.light.backgroundSecondary },
  emptyTitle: { ...Typography.h4, color: Colors.light.text, marginTop: Spacing.md },
  updatesCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, backgroundColor: Colors.light.backgroundSecondary },
  updateItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  updateValue: { ...Typography.body, color: Colors.light.text, fontWeight: '600' },
  updateDate: { ...Typography.bodySmall, color: Colors.light.textSecondary },
  entriesCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, backgroundColor: Colors.light.backgroundSecondary },
});
