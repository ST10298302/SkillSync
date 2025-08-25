
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';


import ProfilePicture from '../../components/ProfilePicture';
import RecentActivity from '../../components/RecentActivity';
import SkillCard from '../../components/SkillCard';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useSkills } from '../../context/SkillsContext';
import { useTheme } from '../../context/ThemeContext';
import { SupabaseService } from '../../services/supabaseService';

/**
 * Home screen with professional Material Design look and feel
 */
export default function Home() {
  const { skills, deleteSkill, refreshSkills } = useSkills();
  const { user } = useAuth();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  
  // Ensure we have valid colors even during initial render
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>();
  const [userName, setUserName] = useState<string>('User');

  // Load profile picture URL and user name
  const loadUserData = async () => {
    if (user?.id) {
      try {
        // Load profile picture URL
        const url = await SupabaseService.getProfilePictureUrl(user.id);
        console.log('🔄 Index: Loaded profile picture URL:', url);
        setProfilePictureUrl(url || undefined);

        // Load user name
        const userProfile = await SupabaseService.getUserProfile(user.id);
        if (userProfile?.name) {
          // Split on whitespace and take only the first name
          const firstName = userProfile.name.split(' ')[0];
          const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
          setUserName(capitalizedName);
        } else {
          // Fallback to email prefix with proper capitalization
          const emailPrefix = user.email?.split('@')[0] || 'User';
          const capitalizedEmail = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();
          setUserName(capitalizedEmail);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to email prefix with proper capitalization
        const emailPrefix = user.email?.split('@')[0] || 'User';
        const capitalizedEmail = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();
        setUserName(capitalizedEmail);
      }
    }
  };

  // Load user data on mount
  React.useEffect(() => {
    loadUserData();
  }, [user?.id]);

  // Reload user data when screen comes into focus (for profile picture updates)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Index: Screen focused, reloading user data...');
      loadUserData();
    }, [user?.id])
  );
  
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

  const handleAddSkill = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/skill/new');
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshSkills();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to refresh skills:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshSkills]);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (skill.description && skill.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filter === 'completed') return matchesSearch && skill.progress >= 100;
    if (filter === 'in-progress') return matchesSearch && skill.progress < 100;
    return matchesSearch;
  });

  const getStats = () => {
    const total = skills.length;
    const completed = skills.filter(s => s.progress >= 100).length;
    const inProgress = total - completed;
    const averageProgress = total > 0 ? Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / total) : 0;
    
    return { total, completed, inProgress, averageProgress };
  };

  const stats = getStats();
  
  // Get screen dimensions for responsive design
  const { height } = Dimensions.get('window');
  const isSmallScreen = height < 800; // iPhone 16 threshold
  const isVerySmallScreen = height < 750; // Very small screen threshold
  
  const styles = StyleSheet.create({
    headerListContainer: {
      paddingBottom: Spacing.lg,
      backgroundColor: 'transparent',
      width: '100%',
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 50 : Spacing.xxl,
      paddingBottom: isVerySmallScreen ? Spacing.xs : isSmallScreen ? Spacing.sm : Spacing.md,
      paddingHorizontal: 0,
      minHeight: isVerySmallScreen ? 80 : isSmallScreen ? 100 : 120,
      marginBottom: Spacing.md,
    },
    headerContent: {
      flex: 1,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: isVerySmallScreen ? Spacing.xs : Spacing.md,
    },
    greetingContainer: {
      flex: 1,
    },

    greeting: {
      ...Typography.h1,
      color: themeColors.text,
      marginBottom: Spacing.xs,
      fontWeight: '700',
      fontSize: isVerySmallScreen ? 18 : isSmallScreen ? 20 : Typography.h1.fontSize,
    },
    subtitle: {
      ...Typography.body,
      color: themeColors.textSecondary,
      opacity: 0.9,
      fontSize: isVerySmallScreen ? 12 : isSmallScreen ? 14 : Typography.body.fontSize,
    },
    profileButton: {
      marginLeft: Spacing.md,
    },
    profileContainer: {
      position: 'relative',
      padding: 3,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.backgroundSecondary,
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    editIconContainer: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: themeColors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 2,
      borderColor: themeColors.background,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: isVerySmallScreen ? Spacing.xs : Spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      padding: isVerySmallScreen ? 4 : isSmallScreen ? Spacing.xs : Spacing.sm,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      marginHorizontal: Spacing.xs,
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    statIconContainer: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.round,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    statNumber: {
      ...Typography.h3,
      color: themeColors.text,
      fontWeight: '700',
      marginBottom: 2,
      fontSize: isVerySmallScreen ? 14 : isSmallScreen ? 16 : Typography.h3.fontSize,
    },
    statLabel: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      fontSize: isVerySmallScreen ? 8 : isSmallScreen ? 10 : Typography.caption.fontSize,
    },
    searchContainer: {
      paddingHorizontal: 0,
      paddingBottom: Spacing.lg,
    },
    searchRow: {
      marginBottom: Spacing.lg,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.xl,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
      borderWidth: 0.5,
      borderColor: themeColors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: Spacing.md,
      ...Typography.body,
      color: themeColors.text,
      fontSize: 16,
      fontWeight: '400',
    },
    clearButton: {
      padding: Spacing.sm,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.md,
    },
    filterButton: {
      flex: 1,
      backgroundColor: themeColors.backgroundSecondary,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      shadowColor: themeColors.shadow.light,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 0.5,
      borderColor: themeColors.border,
    },
    filterButtonActive: {
      backgroundColor: themeColors.accent + '20',
      borderColor: themeColors.accent,
      shadowColor: themeColors.accent,
      shadowOpacity: 0.15,
      elevation: 2,
    },
    filterButtonText: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      fontWeight: '500',
      fontSize: 13,
    },
    filterButtonTextActive: {
      color: themeColors.text,
      fontWeight: '600',
    },
    filterBadge: {
      backgroundColor: themeColors.backgroundTertiary,
      borderRadius: BorderRadius.round,
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
      marginLeft: Spacing.xs,
      minWidth: 18,
      alignItems: 'center',
    },
    filterBadgeActive: {
      backgroundColor: themeColors.accent + '25',
    },
    filterBadgeText: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      fontWeight: '600',
      fontSize: 10,
    },
    filterBadgeTextActive: {
      color: themeColors.text,
    },
    listContainer: {
      // Use uniform page padding consistent with other tabs
      paddingHorizontal: Spacing.lg,
      paddingBottom: Platform.OS === 'ios' ? 120 : Spacing.xxl,
      paddingTop: Spacing.lg,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
    },
    emptyCard: {
      backgroundColor: themeColors.background,
      padding: Spacing.xl,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    emptyTitle: {
      ...Typography.h3,
      color: themeColors.text,
      marginBottom: Spacing.sm,
      textAlign: 'center',
      fontWeight: '700',
    },
    emptySubtitle: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.lg,
      lineHeight: 20,
    },
    emptyButton: {
      borderRadius: BorderRadius.lg,
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    emptyButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    emptyButtonText: {
      ...Typography.bodySmall,
      color: themeColors.text,
      marginLeft: Spacing.sm,
      fontWeight: '600',
    },
    quickActionsContainer: {
      paddingHorizontal: 0,
      paddingBottom: Spacing.md,
      marginBottom: Spacing.lg,
    },
    quickActionsRow: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    quickActionButton: {
      flex: 1,
      borderRadius: BorderRadius.lg,
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    quickActionGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
    },
    quickActionSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    quickActionText: {
      ...Typography.bodySmall,
      color: themeColors.text,
      marginLeft: Spacing.sm,
      fontWeight: '600',
    },
    // Ensure stats row has spacing from neighbors
    statsContainerSpaced: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.sm,
      marginBottom: Spacing.lg,
    },

  });

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="add-circle-outline" size={48} color={themeColors.accent} />
        </View>
        <Text style={styles.emptyTitle}>Start Your Learning Journey</Text>
        <Text style={styles.emptySubtitle}>
          Track your skills, monitor progress, and achieve your goals with SkillSync
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleAddSkill}>
          <LinearGradient
            colors={themeColors.gradient.primary}
            style={styles.emptyButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={16} color={themeColors.text} />
            <Text style={styles.emptyButtonText}>Add Your First Skill</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FilterButton = ({ title, value, count }: { title: string; value: string; count: number }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFilter(value as any);
      }}
    >
      <Text style={[styles.filterButtonText, filter === value && styles.filterButtonTextActive]}>
        {title}
      </Text>
      <View style={[styles.filterBadge, filter === value && styles.filterBadgeActive]}>
        <Text style={[styles.filterBadgeText, filter === value && styles.filterBadgeTextActive]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderListHeader = () => (
    <View style={styles.headerListContainer}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hello, {userName}!</Text>
              <Text style={styles.subtitle}>Track your learning progress</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
              <View style={styles.profileContainer}>
                <ProfilePicture
                  userId={user?.id || ''}
                  imageUrl={profilePictureUrl}
                  size={isVerySmallScreen ? 52 : isSmallScreen ? 60 : 72}
                  onImageUpdate={setProfilePictureUrl}
                  editable={false}
                />
                <View style={styles.editIconContainer}>
                  <Ionicons name="create-outline" size={14} color={themeColors.text} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View>
        <View style={[styles.statsContainerSpaced, { paddingHorizontal: Spacing.lg }]}> 
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="book-outline" size={16} color={themeColors.text} />
            </View>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Skills</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up-outline" size={16} color={themeColors.text} />
            </View>
            <Text style={styles.statNumber}>{stats.averageProgress}%</Text>
            <Text style={styles.statLabel}>Avg Progress</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={16} color={themeColors.text} />
            </View>
            <Text style={styles.statNumber}>{skills.reduce((sum, s) => sum + (s.totalHours || 0), 0)}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="document-text-outline" size={16} color={themeColors.text} />
            </View>
            <Text style={styles.statNumber}>{skills.reduce((sum, s) => sum + (s.entries?.length || 0), 0)}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleAddSkill}>
            <LinearGradient
              colors={themeColors.gradient.primary}
              style={styles.quickActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={20} color={themeColors.text} />
              <Text style={styles.quickActionText}>Add Skill</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/analytics')}>
            <View style={[styles.quickActionSecondary, { backgroundColor: themeColors.backgroundSecondary }]}> 
              <Ionicons name="analytics-outline" size={20} color={themeColors.accent} />
              <Text style={[styles.quickActionText, { color: themeColors.accent }]}>Analytics</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={themeColors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search skills..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={themeColors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>

        {/* Enhanced Filter Buttons */}
        <View style={styles.filterContainer}>
          <FilterButton title="All" value="all" count={stats.total} />
          <FilterButton title="In Progress" value="in-progress" count={stats.inProgress} />
          <FilterButton title="Completed" value="completed" count={stats.completed} />
        </View>
      </View>

      {/* Recent Activity is now shown below the skills list as a footer */}
    </View>
  );

  return (
    <UniformLayout>
      {/* Skills List */}
      <FlatList
        data={filteredSkills}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SkillCard
            id={item.id}
            name={item.name}
            progress={item.progress}
            description={item.description}
            onPress={() => router.push(`/skill/${item.id}`)}
            onEdit={(id) => router.push(`/skill/${id}/edit`)}
            onDelete={deleteSkill}
            lastUpdated={item.lastUpdated || item.createdAt}
            totalEntries={item.entries?.length || 0}
            streak={item.streak || 0}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={
          <RecentActivity
            skills={skills.map(s => ({ id: s.id, name: s.name, lastUpdated: s.lastUpdated, progress: s.progress, entries: s.entries }))}
            onSkillPress={(id) => router.push(`/skill/${id}`)}
          />
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={EmptyState}
      />
    </UniformLayout>
  );
}
