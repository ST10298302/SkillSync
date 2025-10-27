import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
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
      
      // Filter out user's own skills by user_id, not just skill id
      if (user) {
        skills = skills.filter(skill => skill && skill.user_id !== user.id);
      }
      
      console.log('Public skills after filtering:', skills.length);
      
      setPublicSkills(skills);
      setFilteredSkills(skills);
      
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

  const handleFollowUser = async (userId: string, userName?: string) => {
    try {
      await SocialService.followUser(userId);
      setFollowingStatus(prev => ({ ...prev, [userId]: true }));
      // Reload followed users to show newly followed
      await loadFollowedUsers();
      // Show success message
    } catch (error) {
      console.error('Failed to follow user:', error);
      // Show error message
    }
  };

  const handleUnfollowUser = async (userId: string) => {
    try {
      await SocialService.unfollowUser(userId);
      setFollowingStatus(prev => ({ ...prev, [userId]: false }));
      // Reload followed users to remove unfollowed user
      await loadFollowedUsers();
      // Show success message
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      // Show error message
    }
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
      <View style={styles.skillContainer}>
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
          onPress={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          totalEntries={skill.skill_entries?.length || 0}
          streak={skill.streak || 0}
          current_level={skill.current_level}
          likes_count={skill.likes_count || 0}
          comments_count={skill.comments_count || 0}
          owner={(skill as any).owner || null}
        />
        <View style={styles.skillActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.commentButton]}
            onPress={() => {
              setSelectedSkillForComment(skill);
              setCommentModalVisible(true);
            }}
          >
            <Ionicons name="chatbubble-outline" size={16} color={themeColors.accent} />
            <Text style={[styles.actionText, { color: themeColors.accent }]}>
              Comment
            </Text>
          </TouchableOpacity>
          <ReactionButton
            skillId={skill.id}
            initialReaction={undefined}
            reactionCount={skill.likes_count || 0}
          />
        </View>
        <View style={styles.skillActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.followButton]}
            onPress={() => isFollowingOwner 
              ? handleUnfollowUser(skill.user_id)
              : handleFollowUser(skill.user_id, skill.user_id)
            }
          >
            <Ionicons
              name={isFollowingOwner ? 'person-check' as any : 'person-add' as any}
              size={16}
              color={themeColors.text}
            />
            <Text style={[styles.actionText, { color: themeColors.text }]}>
              {isFollowingOwner ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton, (isOwnSkill || skillAlreadyExists) && styles.addButtonDisabled]}
            onPress={() => !isOwnSkill && !skillAlreadyExists && handleAddSkillToCollection(skill)}
            disabled={isOwnSkill || skillAlreadyExists}
          >
            <Ionicons name="add-circle" size={16} color={(isOwnSkill || skillAlreadyExists) ? themeColors.textSecondary : themeColors.accent} />
            <Text style={[styles.actionText, { color: (isOwnSkill || skillAlreadyExists) ? themeColors.textSecondary : themeColors.accent }]}>
              Add to My Skills
            </Text>
          </TouchableOpacity>
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
        <Text style={[styles.title, { color: safeTheme === 'dark' ? '#ffffff' : '#000000' }]}>Community Skills</Text>
        <Text style={[styles.subtitle, { color: safeTheme === 'dark' ? '#ffffff' : '#000000' }]}>Discover and learn from others</Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: themeColors.background }]}>
          <Ionicons name="search" size={20} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search skills..."
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

        {/* Filter Buttons */}
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
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sub-tabs */}
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'skills' && styles.subTabActive]}
            onPress={() => setActiveSubTab('skills')}
          >
            <Ionicons name="library" size={20} color={activeSubTab === 'skills' ? themeColors.accent : themeColors.textSecondary} />
            <Text style={[styles.subTabText, { color: activeSubTab === 'skills' ? themeColors.accent : themeColors.textSecondary }]}>
              Community Skills
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'friends' && styles.subTabActive]}
            onPress={() => setActiveSubTab('friends')}
          >
            <Ionicons name="people" size={20} color={activeSubTab === 'friends' ? themeColors.accent : themeColors.textSecondary} />
            <Text style={[styles.subTabText, { color: activeSubTab === 'friends' ? themeColors.accent : themeColors.textSecondary }]}>
              My Friends
            </Text>
          </TouchableOpacity>
        </View>
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
                <View style={styles.friendContainer}>
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

const screenWidth = Dimensions.get('window').width;
const isMobile = screenWidth < 768;

const styles = StyleSheet.create({
  header: {
    paddingTop: isMobile ? Spacing.lg : Spacing.xl,
    paddingBottom: isMobile ? Spacing.md : Spacing.lg,
    paddingHorizontal: isMobile ? Spacing.md : Spacing.lg,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
    fontSize: isMobile ? 24 : 28,
  },
  subtitle: {
    ...Typography.body,
    opacity: 0.9,
    marginBottom: isMobile ? Spacing.md : Spacing.lg,
    fontSize: isMobile ? 13 : 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: isMobile ? Spacing.sm : Spacing.md,
    paddingVertical: isMobile ? 10 : Spacing.sm,
    marginBottom: isMobile ? Spacing.sm : Spacing.md,
    gap: isMobile ? 8 : Spacing.sm,
    minHeight: isMobile ? 44 : 48,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    fontSize: isMobile ? 15 : 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: isMobile ? 6 : Spacing.sm,
    marginBottom: isMobile ? Spacing.sm : 0,
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: isMobile ? Spacing.sm : Spacing.md,
    paddingVertical: isMobile ? 10 : Spacing.xs,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isMobile ? 36 : 32,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.accent,
  },
  filterText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  listContent: {
    padding: isMobile ? Spacing.md : Spacing.lg,
    paddingBottom: isMobile ? Spacing.xl + 20 : Spacing.xl,
  },
  skillContainer: {
    marginBottom: isMobile ? Spacing.md : Spacing.lg,
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
  skillActions: {
    flexDirection: 'row',
    gap: isMobile ? 8 : Spacing.sm,
    marginTop: -Spacing.md,
    paddingHorizontal: isMobile ? Spacing.sm : Spacing.md,
    marginBottom: isMobile ? Spacing.xs : 0,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isMobile ? 12 : Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: isMobile ? 6 : Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minHeight: isMobile ? 40 : 36,
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
    paddingHorizontal: isMobile ? Spacing.md : Spacing.lg,
    paddingVertical: isMobile ? Spacing.sm : Spacing.md,
    gap: isMobile ? Spacing.sm : Spacing.md,
    marginTop: isMobile ? Spacing.sm : 0,
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isMobile ? 12 : Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: isMobile ? 6 : Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minHeight: isMobile ? 44 : 40,
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
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  friendName: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
});
