import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { ChallengeService } from '../services/challengeService';
import { SkillChallenge } from '../utils/supabase-types';

interface ChallengeCardProps {
  challenge: SkillChallenge;
  onUpdate?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export const ChallengeCard = ({ challenge, onUpdate, onDelete, canEdit = false }: ChallengeCardProps) => {
  const themeColors = Colors.light;

  const handleDelete = async () => {
    Alert.alert(
      'Delete Challenge',
      'Are you sure you want to delete this challenge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ChallengeService.deleteChallenge(challenge.id);
              onDelete?.();
            } catch (error) {
              console.error('Failed to delete challenge:', error);
              Alert.alert('Error', 'Failed to delete challenge');
            }
          },
        },
      ]
    );
  };

  const handleToggleResolved = async () => {
    try {
      if (challenge.is_resolved) {
        await ChallengeService.markAsUnresolved(challenge.id);
      } else {
        await ChallengeService.markAsResolved(challenge.id);
      }
      onUpdate?.();
    } catch (error) {
      console.error('Failed to toggle resolution:', error);
      Alert.alert('Error', 'Failed to update challenge');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Ionicons 
              name={challenge.is_resolved ? "checkmark-circle" : "alert-circle-outline"} 
              size={20} 
              color={challenge.is_resolved ? themeColors.success : themeColors.error} 
            />
            <Text style={styles.title}>{challenge.challenge_title}</Text>
          </View>
          {challenge.is_resolved && (
            <View style={[styles.statusBadge, { backgroundColor: themeColors.success + '20' }]}>
              <Text style={[styles.statusText, { color: themeColors.success }]}>Resolved</Text>
            </View>
          )}
        </View>
        {canEdit && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onUpdate?.()} style={styles.editButton}>
              <Ionicons name="create-outline" size={18} color={themeColors.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={18} color={themeColors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {challenge.challenge_description && (
        <Text style={styles.description}>{challenge.challenge_description}</Text>
      )}

      {challenge.solution && (
        <View style={styles.solutionContainer}>
          <Text style={styles.solutionLabel}>
            <Ionicons name="bulb-outline" size={16} color={themeColors.success} /> Solution:
          </Text>
          <Text style={styles.solutionText}>{challenge.solution}</Text>
        </View>
      )}

      {challenge.is_resolved && challenge.resolved_at && (
        <Text style={styles.resolvedDate}>
          Resolved on {new Date(challenge.resolved_at).toLocaleDateString()}
        </Text>
      )}

      {canEdit && (
        <TouchableOpacity 
          style={[styles.toggleButton, { backgroundColor: challenge.is_resolved ? themeColors.error + '20' : themeColors.success + '20' }]} 
          onPress={handleToggleResolved}
        >
          <Ionicons 
            name={challenge.is_resolved ? "arrow-undo-outline" : "checkmark-circle-outline"} 
            size={18} 
            color={challenge.is_resolved ? themeColors.error : themeColors.success} 
          />
          <Text style={[styles.toggleButtonText, { color: challenge.is_resolved ? themeColors.error : themeColors.success }]}>
            {challenge.is_resolved ? 'Mark as Unresolved' : 'Mark as Resolved'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  titleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs / 2,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  description: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  solutionContainer: {
    backgroundColor: Colors.light.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  solutionLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.light.success,
    marginBottom: Spacing.xs / 2,
  },
  solutionText: {
    ...Typography.caption,
    color: Colors.light.text,
  },
  resolvedDate: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs / 2,
  },
  toggleButtonText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  editButton: {
    padding: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
});
