import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useLanguage } from '../../context/LanguageContext';
import { useSkills } from '../../context/SkillsContext';
import { useTheme } from '../../context/ThemeContext';
import { calculateUserStreak } from '../../utils/streakCalculator';

/**
 * Analytics page - Comprehensive learning progress insights and statistics
 * Features professional Material Design interface with data visualization and trend analysis
 */






export default function Analytics() {
  const { skills } = useSkills();
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  
  // Ensure we have valid colors even during initial render to prevent crashes
  const themeColors = Colors[safeTheme] || Colors.light;
  
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

  const getAnalytics = () => {
    const total = skills.length;
    const completed = skills.filter(s => s.progress >= 100).length;
    const inProgress = total - completed;
    const averageProgress = total > 0 ? Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / total) : 0;
    const totalEntries = skills.reduce((sum, s) => sum + (s.entries?.length || 0), 0);
    const totalHours = skills.reduce((sum, s) => {
      return sum + (s.totalHours || 0);
    }, 0);
    
    // Calculate learning streaks for motivation tracking
    const currentStreak = calculateUserStreak(skills);
    const maxStreak = Math.max(...skills.map(s => s.streak || 0), 0);
    
    // Calculate recent learning activity (last 7 days)
    const now = new Date();
    const lastWeek = skills.filter(skill => {
      const lastUpdate = skill.lastUpdated ? new Date(skill.lastUpdated) : null;
      if (!lastUpdate) return false;
      const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length;
    
    // Calculate progress distribution across different completion ranges
    const progressRanges = {
      '0-25%': skills.filter(s => s.progress >= 0 && s.progress <= 25).length,
      '26-50%': skills.filter(s => s.progress > 25 && s.progress <= 50).length,
      '51-75%': skills.filter(s => s.progress > 50 && s.progress <= 75).length,
      '76-99%': skills.filter(s => s.progress > 75 && s.progress < 100).length,
      '100%': skills.filter(s => s.progress === 100).length,
    };

    // Calculate top skills by time investment for priority insights
    const topSkillsByHours = skills
      .filter(s => s.totalHours && s.totalHours > 0)
      .sort((a, b) => (b.totalHours || 0) - (a.totalHours || 0))
      .slice(0, 5);
    
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
      topSkillsByHours,
    };
  };

  const analytics = getAnalytics();

  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: Platform.OS === 'ios' ? 120 : Spacing.xxl,
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 50 : Spacing.xxl,
      paddingBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    headerContent: {
      alignItems: 'center',
    },
    headerIconContainer: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.round,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    headerTitle: {
      ...Typography.h1,
      color: Colors[safeTheme].text,
      marginBottom: Spacing.sm,
      fontWeight: '700',
    },
    headerSubtitle: {
      ...Typography.body,
      color: Colors[safeTheme].textSecondary,
      textAlign: 'center',
      opacity: 0.9,
    },
    section: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      ...Typography.h2,
      color: Colors[safeTheme].text,
      marginBottom: Spacing.lg,
      fontWeight: '700',
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      width: '48%',
      backgroundColor: Colors[safeTheme].background,
      padding: Spacing.lg,
      borderRadius: BorderRadius.xl,
      marginBottom: Spacing.lg,
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: Colors[safeTheme].border,
    },
    statCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    statIcon: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
    },
    trendContainer: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statValue: {
      ...Typography.h2,
      color: Colors[safeTheme].text,
      fontWeight: '700',
      marginBottom: Spacing.xs,
    },
    statTitle: {
      ...Typography.bodySmall,
      color: Colors[safeTheme].text,
      fontWeight: '600',
    },
    statSubtitle: {
      ...Typography.caption,
      color: Colors[safeTheme].textSecondary,
      marginTop: Spacing.xs,
    },
    insightsCard: {
      backgroundColor: Colors[safeTheme].background,
      padding: Spacing.xl,
      borderRadius: BorderRadius.xl,
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: Colors[safeTheme].border,
    },
    insightRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors[safeTheme].borderSecondary,
    },
    insightLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    insightIcon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    insightTitle: {
      ...Typography.body,
      color: Colors[safeTheme].text,
      fontWeight: '500',
    },
    insightValue: {
      ...Typography.body,
      color: Colors[safeTheme].text,
      fontWeight: '700',
    },
    distributionCard: {
      backgroundColor: Colors[safeTheme].background,
      padding: Spacing.xl,
      borderRadius: BorderRadius.xl,
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: Colors[safeTheme].border,
    },
    rangeCard: {
      marginBottom: Spacing.lg,
    },
    rangeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    rangeTitle: {
      ...Typography.bodySmall,
      color: Colors[safeTheme].text,
      fontWeight: '600',
    },
    rangeCount: {
      ...Typography.caption,
      color: Colors[safeTheme].textSecondary,
      fontWeight: '500',
    },
    progressBarContainer: {
      width: '100%',
      height: 12,
      backgroundColor: Colors[safeTheme].backgroundTertiary,
      borderRadius: BorderRadius.round,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: BorderRadius.round,
    },
    recommendationsCard: {
      backgroundColor: Colors[safeTheme].background,
      padding: Spacing.xl,
      borderRadius: BorderRadius.xl,
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: Colors[safeTheme].border,
    },
    recommendationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.lg,
    },
    recommendationIcon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    recommendationText: {
      ...Typography.bodySmall,
      color: Colors[safeTheme].text,
      flex: 1,
      lineHeight: 22,
      fontWeight: '500',
    },
    topSkillsCard: {
      backgroundColor: Colors[safeTheme].background,
      padding: Spacing.xl,
      borderRadius: BorderRadius.xl,
      marginBottom: Spacing.lg,
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: Colors[safeTheme].border,
    },
    skillItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: Colors[safeTheme].borderSecondary,
    },
    skillName: {
      ...Typography.body,
      color: Colors[safeTheme].text,
      fontWeight: '500',
      flex: 1,
    },
    skillHours: {
      ...Typography.body,
      color: Colors[safeTheme].accent,
      fontWeight: '700',
    },
  });

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
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendContainer, { backgroundColor: trend === 'up' ? Colors[safeTheme].success + '15' : Colors[safeTheme].error + '15' }]}>
            <Ionicons 
              name={trend === 'up' ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={trend === 'up' ? Colors[safeTheme].success : Colors[safeTheme].error} 
            />
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const ProgressRangeCard = ({ range, count, total }: { range: string; count: number; total: number }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const getColor = (range: string) => {
      switch (range) {
        case '0-25%': return Colors[safeTheme].error;
        case '26-50%': return Colors[safeTheme].warning;
        case '51-75%': return Colors[safeTheme].info;
        case '76-99%': return Colors[safeTheme].accent;
        case '100%': return Colors[safeTheme].success;
        default: return Colors[safeTheme].textSecondary;
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
    <UniformLayout>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="analytics" size={40} color={themeColors.text} />
            </View>
            <Text style={styles.headerTitle}>{t('analytics')}</Text>
            <Text style={styles.headerSubtitle}>{t('learningInsights')}</Text>
          </View>
        </Animated.View>

        {/* Enhanced Key Metrics */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('progressOverview')}</Text>
          <View style={styles.metricsGrid}>
            <StatCard 
              title={t('totalSkills')} 
              value={analytics.total} 
              icon="library-outline" 
              color={Colors[safeTheme].accent}
              trend="up"
            />
            <StatCard 
              title={t('completed')} 
              value={analytics.completed} 
              subtitle={`${analytics.total > 0 ? Math.round((analytics.completed / analytics.total) * 100) : 0}% of total`}
              icon="checkmark-circle-outline" 
              color={Colors[safeTheme].success}
              trend="up"
            />
            <StatCard 
              title={t('averageProgress')} 
              value={`${analytics.averageProgress}%`} 
              icon="trending-up-outline" 
              color={Colors[safeTheme].warning}
              trend="up"
            />
            <StatCard 
              title={t('totalEntries')} 
              value={analytics.totalEntries} 
              icon="document-text-outline" 
              color={Colors[safeTheme].info}
              trend="up"
            />
          </View>
        </Animated.View>

        {/* Top Skills by Hours */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('mostActiveSkill')}</Text>
          <View style={styles.topSkillsCard}>
            {analytics.topSkillsByHours.map((skill, index) => (
              <View key={skill.id} style={styles.skillItem}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillHours}>{skill.totalHours}h</Text>
              </View>
            ))}
            {analytics.topSkillsByHours.length === 0 && (
              <Text style={[styles.skillName, { textAlign: 'center', opacity: 0.6 }]}>
                {t('noDataAvailable')}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Enhanced Activity Insights */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('recentActivity')}</Text>
          <View style={styles.insightsCard}>
            <View style={styles.insightRow}>
              <View style={styles.insightLeft}>
                <View style={[styles.insightIcon, { backgroundColor: Colors[safeTheme].accent + '15' }]}>
                  <Ionicons name="flame" size={20} color={Colors[safeTheme].accent} />
                </View>
                <Text style={styles.insightTitle}>Current Streak</Text>
              </View>
              <Text style={styles.insightValue}>{analytics.currentStreak} days</Text>
            </View>
            <View style={styles.insightRow}>
              <View style={styles.insightLeft}>
                <View style={[styles.insightIcon, { backgroundColor: Colors[safeTheme].warning + '15' }]}>
                  <Ionicons name="trophy" size={20} color={Colors[safeTheme].warning} />
                </View>
                <Text style={styles.insightTitle}>Best Streak</Text>
              </View>
              <Text style={styles.insightValue}>{analytics.maxStreak} days</Text>
            </View>
            <View style={styles.insightRow}>
              <View style={styles.insightLeft}>
                <View style={[styles.insightIcon, { backgroundColor: Colors[safeTheme].info + '15' }]}>
                  <Ionicons name="time" size={20} color={Colors[safeTheme].info} />
                </View>
                <Text style={styles.insightTitle}>{t('recentActivity')}</Text>
              </View>
              <Text style={styles.insightValue}>{analytics.lastWeek} skills updated</Text>
            </View>
            <View style={styles.insightRow}>
              <View style={styles.insightLeft}>
                <View style={[styles.insightIcon, { backgroundColor: Colors[safeTheme].accent + '15' }]}>
                  <Ionicons name="hourglass" size={20} color={Colors[safeTheme].accent} />
                </View>
                <Text style={styles.insightTitle}>{t('totalHours')}</Text>
              </View>
              <Text style={styles.insightValue}>{analytics.totalHours}h logged</Text>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Progress Distribution */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('skillBreakdown')}</Text>
          <View style={styles.distributionCard}>
            {Object.entries(analytics.progressRanges).map(([range, count]) => (
              <ProgressRangeCard 
                key={range} 
                range={range} 
                count={count} 
                total={analytics.total} 
              />
            ))}
          </View>
        </Animated.View>

        {/* Enhanced Recommendations */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationsCard}>
            {analytics.inProgress > 0 && (
              <View style={styles.recommendationItem}>
                <View style={[styles.recommendationIcon, { backgroundColor: Colors[safeTheme].warning + '15' }]}>
                  <Ionicons name="bulb" size={20} color={Colors[safeTheme].warning} />
                </View>
                <Text style={styles.recommendationText}>
                  Focus on completing your {analytics.inProgress} in-progress skills
                </Text>
              </View>
            )}
            {analytics.averageProgress < 50 && (
              <View style={styles.recommendationItem}>
                <View style={[styles.recommendationIcon, { backgroundColor: Colors[safeTheme].info + '15' }]}>
                  <Ionicons name="trending-up" size={20} color={Colors[safeTheme].info} />
                </View>
                <Text style={styles.recommendationText}>
                  Try to increase your average progress by setting smaller milestones
                </Text>
              </View>
            )}
            {analytics.lastWeek === 0 && (
              <View style={styles.recommendationItem}>
                <View style={[styles.recommendationIcon, { backgroundColor: Colors[safeTheme].accent + '15' }]}>
                  <Ionicons name="refresh" size={20} color={Colors[safeTheme].accent} />
                </View>
                <Text style={styles.recommendationText}>
                  Update your skills regularly to maintain momentum
                </Text>
              </View>
            )}
            {analytics.totalEntries < analytics.total * 2 && (
              <View style={styles.recommendationItem}>
                <View style={[styles.recommendationIcon, { backgroundColor: Colors[safeTheme].success + '15' }]}>
                  <Ionicons name="document-text" size={20} color={Colors[safeTheme].success} />
                </View>
                <Text style={styles.recommendationText}>
                  Add more diary entries to track your learning journey
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </UniformLayout>
  );
}
