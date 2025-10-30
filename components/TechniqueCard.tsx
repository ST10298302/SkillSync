import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { TechniqueService } from '../services/techniqueService';
import { SkillTechnique } from '../utils/supabase-types';

interface TechniqueCardProps {
  technique: SkillTechnique;
  onUpdate?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export const TechniqueCard = ({ technique, onUpdate, onDelete, canEdit = false }: TechniqueCardProps) => {
  const themeColors = Colors.light;

  const handleDelete = async () => {
    Alert.alert(
      'Delete Technique',
      'Are you sure you want to delete this technique?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => { void (async () => {
            try {
              await TechniqueService.deleteTechnique(technique.id);
              onDelete?.();
            } catch (error) {
              console.error('Failed to delete technique:', error);
              Alert.alert('Error', 'Failed to delete technique');
            }
          })(); },
        },
      ]
    );
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return themeColors.success;
    if (level >= 50) return themeColors.warning;
    return themeColors.error;
  };

  const getMasteryLabel = (level: number) => {
    if (level >= 90) return 'Expert';
    if (level >= 70) return 'Advanced';
    if (level >= 50) return 'Intermediate';
    if (level >= 25) return 'Beginner';
    return 'Novice';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="code-outline" size={20} color={themeColors.accent} />
          <Text style={styles.title}>{technique.technique_name}</Text>
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

      {technique.description && (
        <Text style={styles.description}>{technique.description}</Text>
      )}

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="hourglass-outline" size={16} color={themeColors.textSecondary} />
          <Text style={styles.statText}>{technique.practice_hours || 0}h</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="star-outline" size={16} color={themeColors.textSecondary} />
          <Text style={styles.statText}>{getMasteryLabel(technique.mastery_level || 0)}</Text>
        </View>
      </View>

      <View style={styles.masterySection}>
        <View style={styles.masteryHeader}>
          <Text style={styles.masteryLabel}>Mastery</Text>
          <Text style={[styles.masteryValue, { color: getMasteryColor(technique.mastery_level || 0) }]}>
            {technique.mastery_level || 0}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${technique.mastery_level || 0}%`, backgroundColor: getMasteryColor(technique.mastery_level || 0) }]} />
        </View>
      </View>

      {technique.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{technique.notes}</Text>
        </View>
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
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  description: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  statText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  masterySection: {
    marginTop: Spacing.sm,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs / 2,
  },
  masteryLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  masteryValue: {
    ...Typography.caption,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  notesContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.sm,
  },
  notesLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs / 2,
  },
  notesText: {
    ...Typography.caption,
    color: Colors.light.text,
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
