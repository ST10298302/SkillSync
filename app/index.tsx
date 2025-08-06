import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Animated,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import SkillCard from '../components/SkillCard';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useSkills } from '../context/SkillsContext';

/**
 * Enhanced home screen with modern design, search, filtering, and rich interactions
 */
export default function Home() {
  const { skills, refreshSkills } = useSkills();
  const { user } = useAuth();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
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
  }, []);

  const handleAddSkill = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/skill/new');
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshSkills();
    setRefreshing(false);
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

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={Colors.light.gradient.background}
        style={styles.emptyCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="add-circle-outline" size={64} color={Colors.light.textSecondary} />
        <Text style={styles.emptyTitle}>No skills yet</Text>
        <Text style={styles.emptySubtitle}>
          Start your learning journey by adding your first skill
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleAddSkill}>
          <Text style={styles.emptyButtonText}>Add Your First Skill</Text>
        </TouchableOpacity>
      </LinearGradient>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      {/* Header */}
      <LinearGradient
        colors={Colors.light.gradient.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.split('@')[0] || 'User'}!</Text>
              <Text style={styles.subtitle}>Track your learning progress</Text>
            </View>
          </View>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Skills</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.averageProgress}%</Text>
              <Text style={styles.statLabel}>Avg Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <Animated.View style={[styles.searchContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search skills..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <FilterButton title="All" value="all" count={stats.total} />
          <FilterButton title="In Progress" value="in-progress" count={stats.inProgress} />
          <FilterButton title="Completed" value="completed" count={stats.completed} />
        </View>
      </Animated.View>

      {/* Skills List */}
      <FlatList
        data={filteredSkills}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SkillCard
            name={item.name}
            progress={item.progress}
            description={item.description}
            onPress={() => router.push(`/skill/${item.id}`)}
            lastUpdated={item.lastUpdated}
            totalEntries={item.entries?.length || 0}
            streak={item.streak || 0}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={EmptyState}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddSkill}>
        <LinearGradient
          colors={Colors.light.gradient.primary}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color={Colors.light.text} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: 'bold',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.light.background,
  },
  searchRow: {
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
    color: Colors.light.text,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  filterButtonText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.light.text,
  },
  filterBadge: {
    backgroundColor: Colors.light.backgroundTertiary,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    marginLeft: Spacing.xs,
  },
  filterBadgeActive: {
    backgroundColor: Colors.light.primaryLight,
  },
  filterBadgeText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  filterBadgeTextActive: {
    color: Colors.light.text,
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  emptyButtonText: {
    ...Typography.button,
    color: Colors.light.text,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    shadowColor: Colors.light.shadow.heavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
});