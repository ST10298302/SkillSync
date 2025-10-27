import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';
import { SkillMilestone } from '../utils/supabase-types';

const colors = {
  primary: '#60a5fa', // Using the accent color from Colors
};

interface MilestoneTrackerProps {
  skillId: string;
  milestones: SkillMilestone[];
  onRefresh?: () => void;
  hideTitle?: boolean;
}

export const MilestoneTracker = ({ skillId, milestones, onRefresh, hideTitle }: MilestoneTrackerProps) => {
  const { completeMilestone } = useEnhancedSkills();

  const handleCompleteMilestone = async (milestoneId: string) => {
    try {
      await completeMilestone(milestoneId);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to complete milestone:', error);
    }
  };

  return (
    <View style={styles.container}>
      {!hideTitle && <Text style={styles.title}>Milestones</Text>}
      {milestones.length === 0 ? (
        <Text style={styles.emptyText}>No milestones yet</Text>
      ) : (
        milestones.map((milestone, index) => (
          <View key={milestone.id} style={styles.milestoneItem}>
            <View style={styles.milestoneContent}>
              <View style={styles.milestoneHeader}>
                <Text style={styles.milestoneNumber}>{index + 1}</Text>
                <View style={styles.milestoneInfo}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  {milestone.description && (
                    <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                  )}
                </View>
              </View>
              {milestone.is_completed ? (
                <View style={[styles.statusBadge, styles.completedBadge]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.statusBadge, styles.pendingBadge]}
                  onPress={() => handleCompleteMilestone(milestone.id)}
                >
                  <Ionicons name="ellipse-outline" size={20} color={colors.primary} />
                  <Text style={styles.pendingText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
            {milestone.completed_at && (
              <Text style={styles.completedDate}>
                Completed on {new Date(milestone.completed_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
  },
  milestoneItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  milestoneContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  milestoneHeader: {
    flexDirection: 'row',
    flex: 1,
  },
  milestoneNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 12,
    minWidth: 24,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#aaa',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  completedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  completedText: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  pendingText: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  completedDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    marginLeft: 36,
  },
});
