import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

interface PerformanceMetrics {
  cache: {
    size: number;
    keys: string[];
  };
  queries: {
    [key: string]: {
      count: number;
      totalTime: number;
      avgTime: number;
    };
  };
}

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
  onClearCache: () => void;
  onRefresh: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  metrics,
  onClearCache,
  onRefresh
}) => {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data? This may temporarily slow down the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            onClearCache();
            setRefreshKey(prev => prev + 1);
          }
        }
      ]
    );
  }, [onClearCache]);

  const handleRefresh = useCallback(() => {
    onRefresh();
    setRefreshKey(prev => prev + 1);
  }, [onRefresh]);

  const getPerformanceScore = useCallback(() => {
    const totalQueries = Object.values(metrics.queries).reduce((sum, query) => sum + query.count, 0);
    const avgQueryTime = Object.values(metrics.queries).reduce((sum, query) => sum + query.avgTime, 0) / Object.keys(metrics.queries).length || 0;
    
    // Calculate performance score (0-100)
    let score = 100;
    
    // Penalize for slow queries
    if (avgQueryTime > 100) score -= 20;
    if (avgQueryTime > 500) score -= 30;
    if (avgQueryTime > 1000) score -= 40;
    
    // Penalize for too many queries (inefficient caching)
    if (totalQueries > 100) score -= 10;
    if (totalQueries > 500) score -= 20;
    
    // Bonus for good cache utilization
    if (metrics.cache.size > 0 && totalQueries > 0) {
      const cacheHitRatio = metrics.cache.size / totalQueries;
      if (cacheHitRatio > 0.5) score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }, [metrics]);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return themeColors.success;
    if (score >= 60) return themeColors.warning || themeColors.accent;
    return themeColors.error;
  }, [themeColors]);

  const getScoreLabel = useCallback((score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }, []);

  const performanceScore = getPerformanceScore();
  const scoreColor = getScoreColor(performanceScore);
  const scoreLabel = getScoreLabel(performanceScore);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColors.background,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      margin: Spacing.sm,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    title: {
      ...Typography.h4,
      color: themeColors.text,
      fontWeight: '600',
    },
    toggleButton: {
      padding: Spacing.sm,
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    scoreCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.sm,
    },
    scoreText: {
      ...Typography.h3,
      fontWeight: '700',
    },
    scoreLabel: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
    },
    metricsContainer: {
      marginTop: Spacing.sm,
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderSecondary,
    },
    metricLabel: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
    },
    metricValue: {
      ...Typography.bodySmall,
      color: themeColors.text,
      fontWeight: '500',
    },
    querySection: {
      marginTop: Spacing.md,
    },
    queryHeader: {
      ...Typography.h4,
      color: themeColors.text,
      marginBottom: Spacing.sm,
    },
    queryItem: {
      backgroundColor: themeColors.backgroundSecondary,
      padding: Spacing.sm,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.xs,
    },
    queryName: {
      ...Typography.bodySmall,
      color: themeColors.text,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    queryStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    queryStat: {
      alignItems: 'center',
    },
    queryStatLabel: {
      ...Typography.caption,
      color: themeColors.textSecondary,
    },
    queryStatValue: {
      ...Typography.caption,
      color: themeColors.text,
      fontWeight: '600',
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: themeColors.borderSecondary,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.sm,
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.sm,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    actionButtonText: {
      ...Typography.bodySmall,
      color: themeColors.text,
      marginLeft: Spacing.xs,
    },
    cacheKeysContainer: {
      marginTop: Spacing.sm,
    },
    cacheKey: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      backgroundColor: themeColors.backgroundSecondary,
      padding: Spacing.xs,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Dashboard</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={themeColors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { backgroundColor: scoreColor + '20' }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>
            {performanceScore}
          </Text>
        </View>
        <View>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>
            {scoreLabel}
          </Text>
          <Text style={styles.scoreLabel}>
            Performance Score
          </Text>
        </View>
      </View>

      {isExpanded && (
        <ScrollView style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Cache Size</Text>
            <Text style={styles.metricValue}>{metrics.cache.size} items</Text>
          </View>
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Queries</Text>
            <Text style={styles.metricValue}>
              {Object.values(metrics.queries).reduce((sum, query) => sum + query.count, 0)}
            </Text>
          </View>
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Average Query Time</Text>
            <Text style={styles.metricValue}>
              {Object.values(metrics.queries).length > 0 
                ? `${(Object.values(metrics.queries).reduce((sum, query) => sum + query.avgTime, 0) / Object.keys(metrics.queries).length).toFixed(2)}ms`
                : '0ms'
              }
            </Text>
          </View>

          {Object.keys(metrics.queries).length > 0 && (
            <View style={styles.querySection}>
              <Text style={styles.queryHeader}>Query Performance</Text>
              {Object.entries(metrics.queries).map(([queryName, stats]) => (
                <View key={queryName} style={styles.queryItem}>
                  <Text style={styles.queryName}>{queryName}</Text>
                  <View style={styles.queryStats}>
                    <View style={styles.queryStat}>
                      <Text style={styles.queryStatValue}>{stats.count}</Text>
                      <Text style={styles.queryStatLabel}>Count</Text>
                    </View>
                    <View style={styles.queryStat}>
                      <Text style={styles.queryStatValue}>{stats.avgTime.toFixed(2)}ms</Text>
                      <Text style={styles.queryStatLabel}>Avg Time</Text>
                    </View>
                    <View style={styles.queryStat}>
                      <Text style={styles.queryStatValue}>{stats.totalTime.toFixed(2)}ms</Text>
                      <Text style={styles.queryStatLabel}>Total Time</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {metrics.cache.keys.length > 0 && (
            <View style={styles.cacheKeysContainer}>
              <Text style={styles.queryHeader}>Cache Keys</Text>
              {metrics.cache.keys.slice(0, 10).map((key, index) => (
                <Text key={index} style={styles.cacheKey}>{key}</Text>
              ))}
              {metrics.cache.keys.length > 10 && (
                <Text style={styles.cacheKey}>
                  ... and {metrics.cache.keys.length - 10} more
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={16} color={themeColors.text} />
          <Text style={styles.actionButtonText}>Refresh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleClearCache}
        >
          <Ionicons name="trash" size={16} color={themeColors.error} />
          <Text style={[styles.actionButtonText, { color: themeColors.error }]}>
            Clear Cache
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PerformanceDashboard;
