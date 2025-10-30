import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import CommentModal from '../../components/CommentModal';
import { ReactionButton } from '../../components/ReactionButton';
import SkillCard from '../../components/SkillCard';
import { Toast } from '../../components/Toast';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useEnhancedSkills } from '../../context/EnhancedSkillsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSkills } from '../../context/SkillsContext';
import { useTheme } from '../../context/ThemeContext';
import { SkillManagementService } from '../../services/skillManagementService';
import { SocialService } from '../../services/socialService';
import { Skill, SkillVisibility } from '../../utils/supabase-types';

type CommunityTab = 'skills' | 'friends';

export default function CommunityScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { skills: userSkills, addSkill } = useSkills();
  const { followUser, isFollowing, getPublicSkills } = useEnhancedSkills();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [activeSubTab, setActiveSubTab] = useState<CommunityTab>('skills');
  const [publicSkills, setPublicSkills] = useState<Skill[]>([]);
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'popular' | 'recent'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [selectedSkillForComment, setSelectedSkillForComment] = useState<Skill | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  // Track reaction counts per skill to avoid reloading
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadPublicSkills();
    loadFollowedUsers();
  }, [filterType]);

  useEffect(() => {
    filterSkills();
  }, [searchQuery, publicSkills]);

  const loadPublicSkills = async () => {
    try {
      setLoading(true);
      let skills = await getPublicSkills() || [];
      
      console.log('Total public skills found:', skills.length);
      console.log('User ID:', user?.id);
      console.log('User skills IDs:', userSkills.map(s => s.id));
      
      // Log owner information
      skills.forEach((skill, index) => {
        console.log(`Skill ${index + 1} owner:`, (skill as any).owner);
      });
      
      // Filter out user's own skills by user_id, not just skill id
      if (user) {
        skills = skills.filter(skill => skill && skill.user_id !== user.id);
      }
      
      console.log('Public skills after filtering:', skills.length);
      
      setPublicSkills(skills);
      setFilteredSkills(skills);
      
      // Initialize reaction counts from loaded skills
      const counts: Record<string, number> = {};
      skills.forEach(skill => {
        if (skill && skill.id) {
          counts[skill.id] = skill.likes_count || 0;
        }
      });
      setReactionCounts(prev => ({ ...prev, ...counts }));
      
      // Check following status for each skill owner
      if (user) {
        const statuses: Record<string, boolean> = {};
        for (const skill of skills) {
          if (skill && skill.user_id) {
            try {
              const isUserFollowing = await SocialService.isFollowing(user.id, skill.user_id);
              statuses[skill.user_id] = isUserFollowing;
            } catch (err) {
              console.error('Error checking follow status:', err);
              statuses[skill.user_id] = false;
            }
          }
        }
        setFollowingStatus(statuses);
      }
    } catch (error) {
      console.error('Failed to load public skills:', error);
      setPublicSkills([]);
      setFilteredSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = () => {
    let filtered = [...publicSkills].filter(skill => skill != null);

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        skill =>
          (skill.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (skill.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'popular':
        filtered = filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case 'recent':
        filtered = filtered.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      default:
        break;
    }

    setFilteredSkills(filtered);
  };

  const loadFollowedUsers = async () => {
    if (!user) {
      console.log('No user, skipping loadFollowedUsers');
      return;
    }
    
    try {
      console.log('Loading followed users for user:', user.id);
      const follows = await SocialService.getFollowing(user.id);
      console.log('Follows found:', follows.length);
      
      const userIds = follows.map(f => f.following_id);
      console.log('Following user IDs:', userIds);
      
      // Get user details for followed users
      if (userIds.length > 0) {
        const { supabase } = await import('../../utils/supabase');
        const { data: users, error } = await supabase
          .from('users')
          .select('id, name, email, profile_picture_url')
          .in('id', userIds);
        
        if (error) {
          console.error('Error fetching user details:', error);
        } else {
          console.log('Followed users loaded:', users?.length || 0);
          setFollowedUsers(users || []);
        }
      } else {
        console.log('No follows found, setting empty array');
        setFollowedUsers([]);
      }
    } catch (error) {
      console.error('Failed to load followed users:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPublicSkills(), loadFollowedUsers()]);
    setRefreshing(false);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleFollowUser = async (userId: string, userName?: string) => {
    try {
      await SocialService.followUser(userId);
      setFollowingStatus(prev => ({ ...prev, [userId]: true }));
      // Reload followed users to show newly followed
      await loadFollowedUsers();
      // Show success toast
      showToast('You are now following this user', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to follow user:', error);
      // Show error toast
      showToast('Failed to follow user. Please try again.', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleUnfollowUser = async (userId: string) => {
    try {
      await SocialService.unfollowUser(userId);
      setFollowingStatus(prev => ({ ...prev, [userId]: false }));
      // Reload followed users to remove unfollowed user
      await loadFollowedUsers();
      // Show success toast
      showToast('You have unfollowed this user', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      // Show error toast
      showToast('Failed to unfollow user. Please try again.', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleReactionChange = (skillId: string, increment: number) => {
    // Update the reaction count locally without reloading
    setReactionCounts(prev => ({
      ...prev,
      [skillId]: Math.max(0, (prev[skillId] || 0) + increment)
    }));
  };

  const handleAddSkillToCollection = async (skill: Skill) => {
    try {
      // Only copy name and description - NOT progress, diary entries, etc.
      const newSkill = await SkillManagementService.createSkill({
        name: `Copy of ${skill.name}`, // Add "Copy of" to distinguish
        description: skill.description || '',
        visibility: SkillVisibility.PRIVATE,
      });
      // Show success message
      router.push(`/skill/${newSkill.id}`);
    } catch (error) {
      console.error('Failed to add skill to collection:', error);
      // Show error message
    }
  };

  const renderSkillCard = ({ item: skill }: { item: Skill }) => {
    if (!skill || !skill.user_id) return null;
    
    const isFollowingOwner = followingStatus[skill.user_id] || false;
    const isOwnSkill = user?.id === skill.user_id;
    const skillAlreadyExists = userSkills.some(s => s.name.toLowerCase() === skill.name.toLowerCase());
    
    return (
             <View style={[styles.skillContainer, { backgroundColor: themeColors.background }]}>
         {(isOwnSkill || skillAlreadyExists) && (
           <View style={[styles.ownSkillBadge, { backgroundColor: themeColors.accent + '20' }]}>
             <Ionicons name="checkmark-circle" size={16} color={themeColors.accent} />
             <Text style={[styles.ownSkillText, { color: themeColors.accent }]}>Your Skill</Text>
           </View>
         )}
          <SkillCard
            id={skill.id}
            name={skill.name || 'Unnamed Skill'}
            progress={skill.progress || 0}
            description={skill.description || ''}
            onPress={() => router.push(`/skill/${skill.id}`)}
            onEdit={() => {}}
            onDelete={() => {}}
            totalEntries={skill.skill_entries?.length || 0}
            streak={skill.streak || 0}
            current_level={skill.current_level}
            likes_count={skill.likes_count || 0}
            comments_count={skill.comments_count || 0}
            owner={(skill as any).owner || null}
            transparent={true}
            isCommunityCard={true}
          />
          <View style={styles.skillActionsContainer}>
            <View style={styles.skillActionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.commentButton]}
                onPress={() => {
                  setSelectedSkillForComment(skill);
                  setCommentModalVisible(true);
                }}
              >
                <Ionicons name="chatbubble-outline" size={16} color={themeColors.accent} />
                <Text style={[styles.actionText, { color: themeColors.accent }]}>
                  {t('comment')}
                </Text>
              </TouchableOpacity>
              <ReactionButton
                skillId={skill.id}
                initialReaction={undefined}
                reactionCount={reactionCounts[skill.id] ?? skill.likes_count ?? 0}
                onReactionChange={(increment) => handleReactionChange(skill.id, increment)}
              />
            </View>
            <View style={styles.skillActionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.followButton]}
                onPress={() => isFollowingOwner 
                  ? handleUnfollowUser(skill.user_id)
                  : handleFollowUser(skill.user_id, skill.user_id)
                }
              >
                <Ionicons
                  name={isFollowingOwner ? 'people-circle' : 'person-add'}
                  size={16}
                  color={themeColors.text}
                />
                <Text style={[styles.actionText, { color: themeColors.text }]}>
                  {isFollowingOwner ? t('following') : t('follow')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.addButton, (isOwnSkill || skillAlreadyExists) && styles.addButtonDisabled]}
                onPress={() => !isOwnSkill && !skillAlreadyExists && handleAddSkillToCollection(skill)}
                disabled={isOwnSkill || skillAlreadyExists}
              >
                <Ionicons name="add-circle" size={16} color={(isOwnSkill || skillAlreadyExists) ? themeColors.textSecondary : themeColors.accent} />
                <Text style={[styles.actionText, { color: (isOwnSkill || skillAlreadyExists) ? themeColors.textSecondary : themeColors.accent }]}>
                  {t('addToMySkills')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
    );
  };

  return (
    <UniformLayout>
      <LinearGradient
        colors={themeColors.gradient.primary as any}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
                 <Text style={[styles.title, { color: safeTheme === 'dark' ? '#ffffff' : '#000000' }]}>
           {activeSubTab === 'skills' ? t('communitySkills') : t('myFriends')}
         </Text>

         {/* Sub-tabs */}
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'skills' && styles.subTabActive]}
            onPress={() => setActiveSubTab('skills')}
          >
            <Ionicons name="library" size={20} color={activeSubTab === 'skills' ? themeColors.accent : themeColors.textSecondary} />
            <Text style={[styles.subTabText, { color: activeSubTab === 'skills' ? themeColors.accent : themeColors.textSecondary }]}>
              {t('communitySkills')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'friends' && styles.subTabActive]}
            onPress={() => setActiveSubTab('friends')}
          >
            <Ionicons name="people" size={20} color={activeSubTab === 'friends' ? themeColors.accent : themeColors.textSecondary} />
            <Text style={[styles.subTabText, { color: activeSubTab === 'friends' ? themeColors.accent : themeColors.textSecondary }]}>
              {t('myFriends')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: themeColors.background }]}>
          <Ionicons name="search" size={20} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder={activeSubTab === 'skills' ? t('searchSkills') : t('searchFriends')}
            placeholderTextColor={themeColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons - Only show on Community Skills tab */}
        {activeSubTab === 'skills' && (
          <View style={styles.filterContainer}>
            {(['all', 'popular', 'recent'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  filterType === filter && styles.filterButtonActive,
                  { backgroundColor: filterType === filter ? themeColors.accent : 'rgba(255,255,255,0.2)' }
                ]}
                onPress={() => setFilterType(filter)}
              >
                <Text style={[styles.filterText, { color: safeTheme === 'dark' ? '#ffffff' : (filterType === filter ? '#ffffff' : '#000000') }]}>
                  {t(filter as 'all' | 'popular' | 'recent')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </LinearGradient>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'skills' ? (
        <>
          {/* Skills List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.accent} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            Loading community skills...
          </Text>
        </View>
      ) : filteredSkills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={themeColors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
            No public skills found
          </Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            {searchQuery
              ? 'Try a different search term'
              : 'Be the first to share your skills with the community'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSkills}
          renderItem={renderSkillCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={themeColors.accent} />
          }
        />
      )}
        </>
      ) : (
        <>
          {/* Friends List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.accent} />
              <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
                Loading friends...
              </Text>
            </View>
          ) : followedUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={themeColors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
                No friends yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
                Start following users to see their skills here
              </Text>
            </View>
          ) : (
            <FlatList
              data={followedUsers}
              renderItem={({ item }) => (
                <View style={[styles.friendContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                  <Text style={[styles.friendName, { color: themeColors.text }]}>{item.name || item.email}</Text>
                  {/* Add more friend details */}
                </View>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={themeColors.accent} />
              }
            />
          )}
        </>
      )}
      
      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
      
      {/* Comment Modal */}
      {selectedSkillForComment && (
        <CommentModal
          visible={commentModalVisible}
          onClose={() => {
            setCommentModalVisible(false);
            setSelectedSkillForComment(null);
          }}
          skillId={selectedSkillForComment.id}
          onCommentAdded={() => {
            loadPublicSkills();
          }}
        />
      )}
    </UniformLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.md,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.light.accent,
  },
  filterText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 120 : Spacing.xxl,
  },
  skillContainer: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  ownSkillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.xs,
    alignSelf: 'flex-start',
  },
  ownSkillText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  skillActionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  skillActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  followButton: {
    // Styled via backgroundColor in actionButton
  },
  addButton: {
    // Styled via backgroundColor in actionButton
  },
  commentButton: {
    // Styled via backgroundColor in actionButton
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  actionText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
  subTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  subTabActive: {
    backgroundColor: Colors.light.accent,
  },
  subTabText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  friendContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  friendName: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
});
