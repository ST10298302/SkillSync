import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useSkills } from '../context/SkillsContext';

const { width } = Dimensions.get('window');

/**
 * Analytics page with detailed statistics and insights about learning progress
 */
export default function Analytics() {
  const { skills } = useSkills();
  
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

  const getAnalytics = () => {
    const total = skills.length;
    const completed = skills.filter(s => s.progress >= 100).length;
    const inProgress = total - completed;
    const averageProgress = total > 0 ? Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / total) : 0;
    const totalEntries = skills.reduce((sum, s) => sum + (s.entries?.length || 0), 0);
    const totalHours = skills.reduce((sum, s) => sum + (s.totalHours || 0), 0);
    
    // Calculate streaks
    const streaks = skills.map(skill => skill.streak || 0);
    const maxStreak = Math.max(...streaks, 0);
    const currentStreak = streaks.filter(s => s > 0).length;
    
    // Calculate recent activity
    const now = new Date();
    const lastWeek = skills.filter(skill => {
      const lastUpdate = skill.lastUpdated ? new Date(skill.lastUpdated) : null;
      if (!lastUpdate) return false;
      const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length;
    
    // Calculate progress distribution
    const progressRanges = {
      '0-25%': skills.filter(s => s.progress >= 0 && s.progress <= 25).length,
      '26-50%': skills.filter(s => s.progress > 25 && s.progress <= 50).length,
      '51-75%': skills.filter(s => s.progress > 50 && s.progress <= 75).length,
      '76-99%': skills.filter(s => s.progress > 75 && s.progress < 100).length,
      '100%': skills.filter(s => s.progress === 100).length,
    };
    
    return {
      total,
      completed,
      inProgress,
      averageProgress,
      totalEntries,
      totalHours,
      maxStreak,
      currentStreak,
      lastWeek,
      progressRanges,
    };
  };

  const analytics = getAnalytics();

  const ProgressBar = ({ percentage, color }: { percentage: number; color: string }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    icon: string; 
    color: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <LinearGradient
      colors={[color + '10', color + '05']}
      style={styles.statCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        {trend && (
          <Ionicons 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'} 
            size={16} 
            color={trend === 'up' ? Colors.light.success : trend === 'down' ? Colors.light.error : Colors.light.textSecondary} 
          />
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </LinearGradient>
  );

  const ProgressRangeCard = ({ range, count, total }: { range: string; count: number; total: number }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const getColor = (range: string) => {
      switch (range) {
        case '0-25%': return Colors.light.error;
        case '26-50%': return Colors.light.warning;
        case '51-75%': return Colors.light.info;
        case '76-99%': return Colors.light.primary;
        case '100%': return Colors.light.success;
        default: return Colors.light.secondary;
      }
    };
    
    return (
      <View style={styles.rangeCard}>
        <View style={styles.rangeHeader}>
          <Text style={styles.rangeTitle}>{range}</Text>
          <Text style={styles.rangeCount}>{count} skills</Text>
        </View>
        <ProgressBar percentage={percentage} color={getColor(range)} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={Colors.light.gradient.primary}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <Ionicons name="analytics" size={32} color={Colors.light.text} />
              <Text style={styles.headerTitle}>Analytics</Text>
              <Text style={styles.headerSubtitle}>Your learning insights</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Key Metrics */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <StatCard 
              title="Total Skills" 
              value={analytics.total} 
              icon="library-outline" 
              color={Colors.light.primary}
              trend="up"
            />
            <StatCard 
              title="Completed" 
              value={analytics.completed} 
              subtitle={`${analytics.total > 0 ? Math.round((analytics.completed / analytics.total) * 100) : 0}% of total`}
              icon="checkmark-circle-outline" 
              color={Colors.light.success}
              trend="up"
            />
            <StatCard 
              title="Avg Progress" 
              value={`${analytics.averageProgress}%`} 
              icon="trending-up-outline" 
              color={Colors.light.warning}
              trend="up"
            />
            <StatCard 
              title="Total Entries" 
              value={analytics.totalEntries} 
              icon="document-text-outline" 
              color={Colors.light.info}
              trend="up"
            />
          </View>
        </Animated.View>

        {/* Activity Insights */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Activity Insights</Text>
          <LinearGradient
            colors={Colors.light.gradient.background}
            style={styles.insightsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.insightRow}>
              <View style={styles.insightLeft}>
                <Ionicons name="flame" size={20} color={Colors.light.accent} />
                <Text style={styles.insightTitle}>Current Streak</Text>
              </View>
              <Text style={styles.insightValue}>{analytics.currentStreak} skills</Text>
            </View>
            <View style={styles.insightRow}>
              <View style={styles.insightLeft}>
                <Ionicons name="trophy" size={20} color={Colors.light.warning} />
                <Text style={styles.insightTitle}>Best Streak</Text>
              </View>
              <Text style={styles.insightValue}>{analytics.maxStreak} days</Text>
            </View>
            <View style={styles.insightRow}>
              <View style={styles.insightLeft}>
                <Ionicons name="time" size={20} color={Colors.light.info} />
                <Text style={styles.insightTitle}>Recent Activity</Text>
              </View>
              <Text style={styles.insightValue}>{analytics.lastWeek} skills updated</Text>
            </View>
            <View style={styles.insightRow}>
              <View style={styles.insightLeft}>
                <Ionicons name="hourglass" size={20} color={Colors.light.primary} />
                <Text style={styles.insightTitle}>Total Hours</Text>
              </View>
              <Text style={styles.insightValue}>{analytics.totalHours}h logged</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Progress Distribution */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Progress Distribution</Text>
          <LinearGradient
            colors={Colors.light.gradient.background}
            style={styles.distributionCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {Object.entries(analytics.progressRanges).map(([range, count]) => (
              <ProgressRangeCard 
                key={range} 
                range={range} 
                count={count} 
                total={analytics.total} 
              />
            ))}
          </LinearGradient>
        </Animated.View>

        {/* Recommendations */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <LinearGradient
            colors={Colors.light.gradient.background}
            style={styles.recommendationsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {analytics.inProgress > 0 && (
              <View style={styles.recommendationItem}>
                <Ionicons name="bulb" size={20} color={Colors.light.warning} />
                <Text style={styles.recommendationText}>
                  Focus on completing your {analytics.inProgress} in-progress skills
                </Text>
              </View>
            )}
            {analytics.averageProgress < 50 && (
              <View style={styles.recommendationItem}>
                <Ionicons name="trending-up" size={20} color={Colors.light.info} />
                <Text style={styles.recommendationText}>
                  Try to increase your average progress by setting smaller milestones
                </Text>
              </View>
            )}
            {analytics.lastWeek === 0 && (
              <View style={styles.recommendationItem}>
                <Ionicons name="refresh" size={20} color={Colors.light.primary} />
                <Text style={styles.recommendationText}>
                  Update your skills regularly to maintain momentum
                </Text>
              </View>
            )}
            {analytics.totalEntries < analytics.total * 2 && (
              <View style={styles.recommendationItem}>
                <Ionicons name="document-text" size={20} color={Colors.light.success} />
                <Text style={styles.recommendationText}>
                  Add more diary entries to track your learning journey
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
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
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.light.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  statTitle: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '600',
  },
  statSubtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  insightsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderSecondary,
  },
  insightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightTitle: {
    ...Typography.body,
    color: Colors.light.text,
    marginLeft: Spacing.sm,
  },
  insightValue: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
  },
  distributionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  rangeCard: {
    marginBottom: Spacing.md,
  },
  rangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rangeTitle: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '600',
  },
  rangeCount: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.light.backgroundTertiary,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.round,
  },
  recommendationsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  recommendationText: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
}); 