import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

interface RecentActivityProps {
  skills: Array<{
    id: string;
    name: string;
    lastUpdated?: string;
    progress: number;
    entries: Array<{ date: string; text: string }>; // minimal shape
  }>;
  onSkillPress: (skillId: string) => void;
}

export default function RecentActivity({ skills, onSkillPress }: RecentActivityProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[theme] || Colors.light;

  const recentActivities = React.useMemo(() => {
    const now = new Date();
    return skills
      .filter((s) => !!s.lastUpdated)
      .map((s) => {
        const d = new Date(s.lastUpdated as string);
        const daysAgo = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        return { ...s, daysAgo };
      })
      .sort((a, b) => a.daysAgo - b.daysAgo)
      .slice(0, 3);
  }, [skills]);

  const formatTimeAgo = (daysAgo: number) => {
    if (daysAgo <= 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return `${Math.floor(daysAgo / 30)} months ago`;
  };

  if (recentActivities.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Recent Activity</Text>
        <Ionicons name="time-outline" size={20} color={themeColors.textSecondary} />
      </View>

      {recentActivities.map((activity) => (
        <TouchableOpacity
          key={activity.id}
          style={[styles.activityItem, { borderColor: themeColors.border, backgroundColor: themeColors.backgroundSecondary }]}
          onPress={() => onSkillPress(activity.id)}
          activeOpacity={0.8}
        >
          <View style={styles.activityContent}>
            <Text style={[styles.skillName, { color: themeColors.text }]} numberOfLines={1}>
              {activity.name}
            </Text>
            <Text style={[styles.activityTime, { color: themeColors.textSecondary }]}>
              {formatTimeAgo(activity.daysAgo)}
            </Text>
          </View>
          <View style={styles.progressIndicator}>
            <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>{activity.progress}%</Text>
            <View style={[styles.progressTrack, { backgroundColor: themeColors.backgroundTertiary }]}>
              <View style={[styles.progressBar, { width: `${activity.progress}%`, backgroundColor: themeColors.accent }]} />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Align with list padding; parent provides horizontal padding
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h4,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    // Match card elevation style
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  activityContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  skillName: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    ...Typography.caption,
  },
  progressIndicator: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  progressText: {
    ...Typography.caption,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressTrack: {
    height: 6,
    width: 80,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.round,
  },
});


