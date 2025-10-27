import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

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

export default function CommunityScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addSkill } = useSkills();
  const { followUser, isFollowing, getPublicSkills } = useEnhancedSkills();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [publicSkills, setPublicSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'popular' | 'recent'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPublicSkills();
  }, [filterType]);

  useEffect(() => {
    filterSkills();
  }, [searchQuery, publicSkills]);

  const loadPublicSkills = async () => {
    try {
      setLoading(true);
      const skills = await getPublicSkills();
      setPublicSkills(skills);
      setFilteredSkills(skills);
      
      // Check following status for each skill owner
      if (user) {
        const statuses: Record<string, boolean> = {};
        for (const skill of skills) {
          const isUserFollowing = await SocialService.isFollowing(user.id, skill.user_id);
          statuses[skill.user_id] = isUserFollowing;
        }
        setFollowingStatus(statuses);
      }
    } catch (error) {
      console.error('Failed to load public skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = () => {
    let filtered = [...publicSkills];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        skill =>
          skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'popular':
        filtered = filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case 'recent':
        filtered = filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      default:
        break;
    }

    setFilteredSkills(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPublicSkills();
    setRefreshing(false);
  };

  const handleFollowUser = async (userId: string, userName?: string) => {
    try {
      await SocialService.followUser(userId);
      setFollowingStatus(prev => ({ ...prev, [userId]: true }));
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
      // Show success message
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      // Show error message
    }
  };

  const handleAddSkillToCollection = async (skill: Skill) => {
    try {
      const newSkill = await SkillManagementService.createSkill({
        name: skill.name,
        description: skill.description,
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
    const isFollowingOwner = followingStatus[skill.user_id] || false;
    
    return (
      <View style={styles.skillContainer}>
        <SkillCard
          id={skill.id}
          name={skill.name}
          progress={skill.progress}
          description={skill.description}
          onPress={() => router.push(`/skill/${skill.id}`)}
          onEdit={() => {}}
          onDelete={() => {}}
          totalEntries={skill.entries?.length || 0}
          streak={skill.streak}
          current_level={skill.current_level}
          likes_count={skill.likes_count}
          comments_count={skill.comments_count}
        />
        <View style={styles.skillActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.followButton]}
            onPress={() => isFollowingOwner 
              ? handleUnfollowUser(skill.user_id)
              : handleFollowUser(skill.user_id, skill.user_id)
            }
          >
            <Ionicons
              name={isFollowingOwner ? 'person-check' : 'person-add'}
              size={16}
              color={themeColors.text}
            />
            <Text style={[styles.actionText, { color: themeColors.text }]}>
              {isFollowingOwner ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={() => handleAddSkillToCollection(skill)}
          >
            <Ionicons name="add-circle" size={16} color={themeColors.accent} />
            <Text style={[styles.actionText, { color: themeColors.accent }]}>
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
        <Text style={styles.title}>Community Skills</Text>
        <Text style={styles.subtitle}>Discover and learn from others</Text>

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
              <Text style={styles.filterText}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

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
    </UniformLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.accent,
  },
  filterText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.light.text,
  },
  listContent: {
    padding: Spacing.lg,
  },
  skillContainer: {
    marginBottom: Spacing.lg,
  },
  skillActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: -Spacing.md,
    paddingHorizontal: Spacing.md,
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
});
