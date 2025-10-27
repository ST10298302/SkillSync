import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { AddArtifactModal } from '../../components/AddArtifactModal';
import { AddChallengeModal } from '../../components/AddChallengeModal';
import { AddDiaryEntryModal } from '../../components/AddDiaryEntryModal';
import { AddMilestoneModal } from '../../components/AddMilestoneModal';
import { AddProgressModal } from '../../components/AddProgressModal';
import { AddResourceModal } from '../../components/AddResourceModal';
import { AddTechniqueModal } from '../../components/AddTechniqueModal';
import { ArtifactViewModal } from '../../components/ArtifactViewModal';
import { ChallengeCard } from '../../components/ChallengeCard';
import { CommentThread } from '../../components/CommentThread';
import DiaryItem from '../../components/DiaryItem';
import { EditDiaryEntryModal } from '../../components/EditDiaryEntryModal';
import { LevelBadge } from '../../components/LevelBadge';
import { MilestoneTracker } from '../../components/MilestoneTracker';
import ProgressBar from '../../components/ProgressBar';
import { ReactionButton } from '../../components/ReactionButton';
import { ResourceCard } from '../../components/ResourceCard';
import { TechniqueCard } from '../../components/TechniqueCard';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useEnhancedSkills } from '../../context/EnhancedSkillsContext';
import { useLanguage } from '../../context/LanguageContext';
import { DiaryEntry, useSkills } from '../../context/SkillsContext';
import { useTheme } from '../../context/ThemeContext';

type TabType = 'overview' | 'milestones' | 'resources' | 'techniques' | 'challenges' | 'comments';

export default function EnhancedSkillDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { skills, user } = useSkills();
  const { user: currentUser } = useAuth();
  const { 
    milestones: skillMilestones,
    resources: skillResources,
    artifacts: skillArtifacts,
    techniques: skillTechniques,
    challenges: skillChallenges,
    comments: skillComments,
    getMilestones, 
    getResources,
    getArtifacts,
    getTechniques,
    getChallenges,
    getComments,
    deleteArtifact,
    refreshSkills 
  } = useEnhancedSkills();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  // Responsive sizing
  const screenWidth = Dimensions.get('window').width;
  const isSmall = screenWidth < 375;
  
  const [skill, setSkill] = useState<any>(null);
  const [loadingSkill, setLoadingSkill] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Check if this is the user's own skill
  // Debug logging
  const isOwnSkill = skill && currentUser && String(skill.user_id) === String(currentUser.id);
  
  // Debug logging
  React.useEffect(() => {
    if (skill && currentUser) {
      console.log('Ownership check:', {
        skillUserId: skill.user_id,
        currentUserId: currentUser.id,
        match: String(skill.user_id) === String(currentUser.id),
        isOwnSkill
      });
    }
  }, [skill, currentUser, isOwnSkill]);
  
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showEditDiaryModal, setShowEditDiaryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showArtifactModal, setShowArtifactModal] = useState(false);
  const { updateEntry, deleteEntry } = useSkills();
  const [showArtifactViewModal, setShowArtifactViewModal] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [editingTechnique, setEditingTechnique] = useState<any>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);

  // Load skill from database if not found in context
  useEffect(() => {
    const loadSkill = async () => {
      if (!id) return;
      
      // First check if skill is in context
      const contextSkill = skills.find(s => s.id === id);
      if (contextSkill) {
        setSkill(contextSkill);
        setLoadingSkill(false);
        return;
      }

      // If not in context, fetch from database
      try {
        const { supabase } = await import('../../utils/supabase');
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .eq('id', id)
          .single();

      if (data && !error) {
        // Ensure skill has all required properties with defaults
        setSkill({
          ...data,
          progressUpdates: data.progressUpdates || [],
          entries: data.entries || [],
          description: data.description || '',
          progress: data.progress || 0,
          likes_count: data.likes_count || 0,
          comments_count: data.comments_count || 0,
          current_level: data.current_level || 'beginner',
          user_id: data.user_id, // Include user_id for ownership checks
        });
      }
      } catch (error) {
        console.error('Error loading skill:', error);
      } finally {
        setLoadingSkill(false);
      }
    };

    loadSkill();
  }, [id, skills]);

  // Load enhanced data
  useEffect(() => {
    const loadData = async () => {
      // Don't load if no skill or skill ID
      if (!id || !skill) {
        console.warn('Skipping enhanced data load: Missing skill or ID', { id, hasSkill: !!skill });
        return;
      }
      
      // Ensure id is valid UUID format
      if (typeof id !== 'string' || id === 'null' || id === 'undefined' || id.trim() === '') {
        console.warn('Skipping enhanced data load: Invalid skill ID', id);
        return;
      }
      
      // Validate UUID format (basic check for 8-4-4-4-12 pattern)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(id)) {
        console.warn('Skipping enhanced data load: Invalid UUID format', id);
        return;
      }
      
      try {
        await Promise.all([
          getMilestones(id),
          getResources(id),
          getArtifacts(id),
          getTechniques(id),
          getChallenges(id),
          getComments(id),
        ]);
      } catch (error) {
        console.error('Failed to load enhanced data:', error);
        // Don't throw - allow UI to continue without enhanced data
      }
    };
    
    // Only run when skill is loaded
    if (skill) {
      loadData();
    }
  }, [skill, id]);

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

  if (loadingSkill) {
    return (
      <UniformLayout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={themeColors.accent} />
          <Text style={styles.errorTitle}>Loading skill...</Text>
        </View>
      </UniformLayout>
    );
  }

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
    // Validate ID before refreshing
    if (!id || typeof id !== 'string' || id === 'null' || id === 'undefined' || id.trim() === '') {
      return;
    }
    
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(id)) {
      console.warn('Cannot refresh: invalid UUID format:', id);
      return;
    }
    
    try {
      // First refresh skills context to update the skill with new level
      await refreshSkills();
      
      // Then reload the skill from the database to get the latest data
      const { supabase } = await import('../../utils/supabase');
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('id', id)
        .single();

      if (data && !error) {
        setSkill({
          ...data,
          progressUpdates: data.progressUpdates || [],
          entries: data.entries || [],
          description: data.description || '',
          progress: data.progress || 0,
          likes_count: data.likes_count || 0,
          comments_count: data.comments_count || 0,
          current_level: data.current_level || 'beginner',
          user_id: data.user_id,
        });
      }
      
      // Load enhanced data
      await Promise.all([
        getMilestones(id),
        getResources(id),
        getArtifacts(id),
        getTechniques(id),
        getChallenges(id),
        getComments(id),
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
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
                {isOwnSkill && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowProgressModal(true)}
                  >
                    <Ionicons name="add-circle" size={24} color={themeColors.accent} />
                  </TouchableOpacity>
                )}
              </View>
              {!skill.progressUpdates || skill.progressUpdates.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                  <Ionicons name="trending-up-outline" size={48} color={themeColors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: themeColors.text }]}>{t('noProgressUpdates')}</Text>
                </View>
              ) : (
                <View style={[styles.updatesCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                  <FlatList
                    data={[...(skill.progressUpdates || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                      // Check if notes contain level completion info
                      const hasLevelCompletion = item.notes && item.notes.includes('Level Completed');
                      const completionMatch = item.notes?.match(/(\w+) Level Completed/);
                      
                      return (
                        <View style={styles.updateItem}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text style={[styles.updateValue, { color: themeColors.text }]}>{item.progress}%</Text>
                              {hasLevelCompletion && completionMatch && (
                                <View style={{
                                  backgroundColor: themeColors.success + '20',
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                  borderRadius: 4,
                                  borderWidth: 1,
                                  borderColor: themeColors.success + '40',
                                }}>
                                  <Text style={{
                                    color: themeColors.success,
                                    fontSize: 10,
                                    fontWeight: '600',
                                  }}>
                                    ✓ {completionMatch[1]} Completed
                                  </Text>
                                </View>
                              )}
                            </View>
                            {item.notes && !hasLevelCompletion && (
                              <Text style={[styles.updateNotes, { color: themeColors.textSecondary }]} numberOfLines={2}>
                                {item.notes}
                              </Text>
                            )}
                            <Text style={[styles.updateDate, { color: themeColors.textSecondary }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                          </View>
                        </View>
                      );
                    }}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>

            {/* Diary Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('diaryEntries')}</Text>
                {isOwnSkill && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowDiaryModal(true)}
                  >
                    <Ionicons name="add-circle" size={24} color={themeColors.accent} />
                  </TouchableOpacity>
                )}
              </View>
              {!skill.entries || skill.entries.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                  <Ionicons name="document-text-outline" size={48} color={themeColors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: themeColors.text }]}>{t('noDiaryEntries')}</Text>
                </View>
              ) : (
                <View style={[styles.entriesCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                  <FlatList
                    data={[...(skill.entries || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
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
              {isOwnSkill && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowMilestoneModal(true)}
                >
                  <Ionicons name="add-circle" size={24} color={themeColors.accent} />
                </TouchableOpacity>
              )}
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
                {isOwnSkill && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowResourceModal(true)}
                  >
                    <Ionicons name="add-circle" size={24} color={themeColors.accent} />
                  </TouchableOpacity>
                )}
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
                {isOwnSkill && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowArtifactModal(true)}
                  >
                    <Ionicons name="add-circle" size={24} color={themeColors.accent} />
                  </TouchableOpacity>
                )}
              </View>
              {skillArtifacts.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                  <Ionicons name="image-outline" size={48} color={themeColors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No artifacts yet</Text>
                  <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>Add photos to showcase your progress</Text>
                </View>
              ) : (
                <View style={styles.artifactsGrid}>
                  {skillArtifacts.map(artifact => (
                    <TouchableOpacity 
                      key={artifact.id} 
                      style={styles.artifactCard}
                      onPress={() => {
                        setSelectedArtifact(artifact);
                        setShowArtifactViewModal(true);
                      }}
                    >
                      {artifact.thumbnail_url ? (
                        <Image 
                          source={{ uri: artifact.thumbnail_url }} 
                          style={styles.artifactImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.artifactPlaceholder}>
                          <Ionicons name="image" size={32} color={themeColors.textSecondary} />
                        </View>
                      )}
                      <Text style={styles.artifactTitle} numberOfLines={1}>
                        {artifact.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        );
      
      case 'techniques':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Techniques</Text>
              {isOwnSkill && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowTechniqueModal(true)}
                >
                  <Ionicons name="add-circle" size={24} color={themeColors.accent} />
                </TouchableOpacity>
              )}
            </View>
            {skillTechniques.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                <Ionicons name="construct-outline" size={48} color={themeColors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No techniques yet</Text>
              </View>
            ) : (
              skillTechniques.map(technique => (
                <TechniqueCard 
                  key={technique.id} 
                  technique={technique}
                  canEdit={isOwnSkill}
                  onUpdate={() => {
                    setEditingTechnique(technique);
                    setShowTechniqueModal(true);
                  }}
                  onDelete={handleRefresh}
                />
              ))
            )}
          </View>
        );
      
      case 'challenges':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Challenges</Text>
              {isOwnSkill && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowChallengeModal(true)}
                >
                  <Ionicons name="add-circle" size={24} color={themeColors.accent} />
                </TouchableOpacity>
              )}
            </View>
            {skillChallenges.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: themeColors.backgroundSecondary }]}>
                <Ionicons name="flag-outline" size={48} color={themeColors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No challenges yet</Text>
              </View>
            ) : (
              skillChallenges.map(challenge => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge}
                  canEdit={isOwnSkill}
                  onUpdate={() => {
                    setEditingChallenge(challenge);
                    setShowChallengeModal(true);
                  }}
                  onDelete={handleRefresh}
                />
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
          <View style={styles.tabsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabs}
            >
              {(['overview', 'milestones', 'resources', 'techniques', 'challenges', 'comments'] as TabType[]).map((tab) => (
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
            </ScrollView>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {renderTabContent()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals - Only show if user owns the skill */}
      {isOwnSkill && (
        <>
          <AddProgressModal
            visible={showProgressModal}
            onClose={() => setShowProgressModal(false)}
            skillId={skill.id}
            currentProgress={skill.progress}
            onSuccess={handleRefresh}
          />
          
          <AddDiaryEntryModal
            visible={showDiaryModal}
            onClose={() => setShowDiaryModal(false)}
            skillId={skill.id}
            onSuccess={handleRefresh}
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
          
          <AddTechniqueModal
            visible={showTechniqueModal}
            onClose={() => {
              setShowTechniqueModal(false);
              setEditingTechnique(null);
            }}
            skillId={skill.id}
            editingTechnique={editingTechnique}
            onSuccess={handleRefresh}
          />
          
          <AddChallengeModal
            visible={showChallengeModal}
            onClose={() => {
              setShowChallengeModal(false);
              setEditingChallenge(null);
            }}
            skillId={skill.id}
            editingChallenge={editingChallenge}
            onSuccess={handleRefresh}
          />
        </>
      )}

      {/* Artifact View Modal - Always visible if there's a selected artifact */}
      {selectedArtifact && (
        <ArtifactViewModal
          visible={showArtifactViewModal}
          artifact={selectedArtifact}
          onClose={() => {
            setShowArtifactViewModal(false);
            setSelectedArtifact(null);
          }}
          canDelete={isOwnSkill}
          onDelete={async () => {
            if (selectedArtifact) {
              await deleteArtifact(selectedArtifact.id);
              setShowArtifactViewModal(false);
              setSelectedArtifact(null);
              handleRefresh();
            }
          }}
        />
      )}
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
  tabsContainer: { marginBottom: Spacing.lg },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  tab: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', minWidth: 100 },
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
  emptySubtitle: { ...Typography.bodySmall, marginTop: Spacing.xs },
  updatesCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
  updateItem: { paddingVertical: Spacing.sm },
  updateValue: { ...Typography.body, fontWeight: '600' },
  updateNotes: { ...Typography.bodySmall, marginTop: 4 },
  updateDate: { ...Typography.bodySmall, marginTop: 4 },
  entriesCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
  artifactsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  artifactCard: { width: '48%', aspectRatio: 1, borderRadius: BorderRadius.md, overflow: 'hidden' },
  artifactImage: { width: '100%', height: '80%', backgroundColor: Colors.light.backgroundTertiary },
  artifactPlaceholder: { width: '100%', height: '80%', backgroundColor: Colors.light.backgroundTertiary, justifyContent: 'center', alignItems: 'center' },
  artifactTitle: { ...Typography.bodySmall, padding: Spacing.xs, textAlign: 'center' },
});