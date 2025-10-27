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

import { AddArtifactModal } from '../../components/AddArtifactModal';
import { AddDiaryEntryModal } from '../../components/AddDiaryEntryModal';
import { AddMilestoneModal } from '../../components/AddMilestoneModal';
import { AddProgressModal } from '../../components/AddProgressModal';
import { AddResourceModal } from '../../components/AddResourceModal';
import { CommentThread } from '../../components/CommentThread';
import DiaryItem from '../../components/DiaryItem';
import { EditDiaryEntryModal } from '../../components/EditDiaryEntryModal';
import { LevelBadge } from '../../components/LevelBadge';
import { MilestoneTracker } from '../../components/MilestoneTracker';
import ProgressBar from '../../components/ProgressBar';
import { ReactionButton } from '../../components/ReactionButton';
import { ResourceCard } from '../../components/ResourceCard';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useEnhancedSkills } from '../../context/EnhancedSkillsContext';
import { useLanguage } from '../../context/LanguageContext';
import { DiaryEntry, useSkills } from '../../context/SkillsContext';
import { useTheme } from '../../context/ThemeContext';

type TabType = 'overview' | 'milestones' | 'resources' | 'comments';

export default function EnhancedSkillDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { skills } = useSkills();
  const { 
    milestones: skillMilestones,
    resources: skillResources,
    comments: skillComments,
    getMilestones, 
    getResources, 
    getComments,
    refreshSkills 
  } = useEnhancedSkills();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const skill = skills.find(s => s.id === id);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showEditDiaryModal, setShowEditDiaryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showArtifactModal, setShowArtifactModal] = useState(false);
  const { updateEntry, deleteEntry } = useSkills();

  // Load enhanced data
  useEffect(() => {
    if (id) {
      loadEnhancedData();
    }
  }, [id]);

  const loadEnhancedData = async () => {
    if (!id) return;
    try {
      await Promise.all([
        getMilestones(id),
        getResources(id),
        getComments(id),
      ]);
    } catch (error) {
      console.error('Failed to load enhanced data:', error);
    }
  };

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
          <Ionicons name="alert-circle" size={64} color={themeColors.error} />
          <Text style={[styles.errorTitle, { color: themeColors.text }]}>{t('skillNotFound')}</Text>
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

  const handleEditEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setShowEditDiaryModal(true);
  };

  const handleDeleteEntry = async (entry: DiaryEntry) => {
    if (typeof id === 'string' && confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(id, entry.id);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            {/* Progress Updates */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('progressUpdates')}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowProgressModal(true)}
                >
                  <Ionicons name="add-circle" size={24} color={themeColors.accent} />
                </TouchableOpacity>
              </View>
              {skill.progressUpdates.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                  <Ionicons name="trending-up-outline" size={48} color={themeColors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: themeColors.text }]}>{t('noProgressUpdates')}</Text>
                </View>
              ) : (
                <View style={[styles.updatesCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                  <FlatList
                    data={[...skill.progressUpdates].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.updateItem}>
                        <Text style={[styles.updateValue, { color: themeColors.text }]}>{item.progress}%</Text>
                        <Text style={[styles.updateDate, { color: themeColors.textSecondary }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                      </View>
                    )}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>

            {/* Diary Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('diaryEntries')}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowDiaryModal(true)}
                >
                  <Ionicons name="add-circle" size={24} color={themeColors.accent} />
                </TouchableOpacity>
              </View>
              {skill.entries.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                  <Ionicons name="document-text-outline" size={48} color={themeColors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: themeColors.text }]}>{t('noDiaryEntries')}</Text>
                </View>
              ) : (
                <View style={[styles.entriesCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                  <FlatList
                    data={[...skill.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <DiaryItem 
                        text={item.text} 
                        date={item.date} 
                        hours={item.hours}
                        onEdit={() => handleEditEntry(item)}
                        onDelete={() => handleDeleteEntry(item)}
                      />
                    )}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>
          </View>
        );
      
      case 'milestones':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Milestones</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowMilestoneModal(true)}
              >
                <Ionicons name="add-circle" size={24} color={themeColors.accent} />
              </TouchableOpacity>
            </View>
            <MilestoneTracker 
              skillId={skill.id} 
              milestones={skillMilestones} 
              onRefresh={handleRefresh}
              hideTitle
            />
          </View>
        );
      
      case 'resources':
        return (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Learning Resources</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowResourceModal(true)}
                >
                  <Ionicons name="add-circle" size={24} color={themeColors.accent} />
                </TouchableOpacity>
              </View>
              {skillResources.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                  <Ionicons name="book-outline" size={48} color={themeColors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No resources yet</Text>
                </View>
              ) : (
                skillResources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              )}
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Evidence/Artifacts</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowArtifactModal(true)}
                >
                  <Ionicons name="add-circle" size={24} color={themeColors.accent} />
                </TouchableOpacity>
              </View>
            </View>
          </>
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
              colors={themeColors.gradient.primary as any}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <View style={styles.skillInfo}>
                  <View style={styles.skillHeader}>
                    <Text style={[styles.skillName, { color: themeColors.text }]}>{skill.name}</Text>
                    <LevelBadge level={skill.current_level || 'beginner'} size="small" />
                  </View>
                  {skill.description && (
                    <Text style={[styles.skillDescription, { color: themeColors.textSecondary }]}>{skill.description}</Text>
                  )}
                  <View style={styles.skillStats}>
                    <ReactionButton skillId={skill.id} reactionCount={skill.likes_count || 0} />
                    <View style={styles.statItem}>
                      <Ionicons name="chatbubble-outline" size={16} color={themeColors.textSecondary} />
                      <Text style={[styles.statText, { color: themeColors.textSecondary }]}>{skill.comments_count || 0}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Progress Section */}
          <Animated.View style={[styles.progressSection, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={themeColors.gradient.background as any}
              style={[styles.progressCard, { borderColor: themeColors.border }]}
            >
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, { color: themeColors.text }]}>{t('currentProgress')}</Text>
                <Text style={[styles.progressValue, { color: themeColors.text }]}>{skill.progress}%</Text>
              </View>
              <ProgressBar progress={skill.progress} height={12} />
            </LinearGradient>
          </Animated.View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {(['overview', 'milestones', 'resources', 'comments'] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && [styles.tabActive, { borderBottomColor: themeColors.accent }]]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive, 
                  { color: activeTab === tab ? themeColors.accent : themeColors.textSecondary }]}>
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

      {/* Modals */}
      <AddProgressModal
        visible={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        skillId={skill.id}
        currentProgress={skill.progress}
      />
      
      <AddDiaryEntryModal
        visible={showDiaryModal}
        onClose={() => setShowDiaryModal(false)}
        skillId={skill.id}
      />
      
      <EditDiaryEntryModal
        visible={showEditDiaryModal}
        onClose={() => {
          setShowEditDiaryModal(false);
          setSelectedEntry(null);
        }}
        skillId={skill.id}
        entry={selectedEntry}
      />

      <AddResourceModal
        visible={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        skillId={skill.id}
      />
      
      <AddMilestoneModal
        visible={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        skillId={skill.id}
      />
      
      <AddArtifactModal
        visible={showArtifactModal}
        onClose={() => setShowArtifactModal(false)}
        skillId={skill.id}
      />
    </UniformLayout>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  errorTitle: { ...Typography.h2, marginTop: Spacing.md },
  header: { marginBottom: Spacing.lg },
  headerGradient: { paddingTop: Spacing.xl, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  headerContent: { flexDirection: 'row', alignItems: 'flex-start' },
  backButton: { padding: Spacing.sm, borderRadius: BorderRadius.round, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginRight: Spacing.md },
  skillInfo: { flex: 1 },
  skillHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  skillName: { ...Typography.h1, marginRight: Spacing.sm },
  skillDescription: { ...Typography.body, marginBottom: Spacing.sm },
  skillStats: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  statItem: { flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.md },
  statText: { ...Typography.bodySmall, marginLeft: 4 },
  progressSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  progressCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  progressTitle: { ...Typography.h3 },
  progressValue: { ...Typography.h2, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: 'transparent' },
  tabText: { ...Typography.body },
  tabTextActive: { fontWeight: '600' },
  tabContent: { paddingHorizontal: Spacing.lg },
  section: { marginVertical: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h3 },
  addButton: { padding: Spacing.xs },
  emptyCard: { padding: Spacing.xl, borderRadius: BorderRadius.lg, alignItems: 'center' },
  emptyTitle: { ...Typography.h4, marginTop: Spacing.md },
  updatesCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
  updateItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  updateValue: { ...Typography.body, fontWeight: '600' },
  updateDate: { ...Typography.bodySmall },
  entriesCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
});