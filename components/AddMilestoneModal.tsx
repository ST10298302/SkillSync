import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';
import { useTheme } from '../context/ThemeContext';

interface AddMilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
}

export const AddMilestoneModal = ({ visible, onClose, skillId }: AddMilestoneModalProps) => {
  const { createMilestone, milestones } = useEnhancedSkills();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate order_index based on existing milestones
  const getNextOrderIndex = () => {
    const skillMilestones = milestones.filter(m => m.skill_id === skillId);
    if (skillMilestones.length === 0) return 0;
    const maxOrder = Math.max(...skillMilestones.map(m => m.order_index));
    return maxOrder + 1;
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      await createMilestone({
        skill_id: skillId,
        title: title.trim(),
        description: description.trim() || undefined,
        order_index: getNextOrderIndex(),
      });
      setTitle('');
      setDescription('');
      setTargetDate(null);
      onClose();
    } catch (error) {
      console.error('Failed to add milestone:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: themeColors.background }]}>
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Add Milestone</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.label, { color: themeColors.text }]}>Title *</Text>
            <TextInput
              style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}
              placeholder="e.g., Complete first project"
              placeholderTextColor={themeColors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.label, { color: themeColors.text }]}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: themeColors.text, backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}
              placeholder="Add details about this milestone..."
              placeholderTextColor={themeColors.textSecondary}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={[styles.label, { color: themeColors.text }]}>Target Date (optional)</Text>
            {Platform.OS === 'web' ? (
              <TextInput
                style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}
                type="date"
                placeholder="YYYY-MM-DD"
                placeholderTextColor={themeColors.textSecondary}
                value={targetDate && !isNaN(targetDate.getTime()) ? targetDate.toISOString().split('T')[0] : ''}
                onChangeText={(text) => {
                  if (text) {
                    const date = new Date(text);
                    if (!isNaN(date.getTime())) {
                      setTargetDate(date);
                    }
                  } else {
                    setTargetDate(null);
                  }
                }}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.datePickerButton, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
                  <Text style={[styles.datePickerText, { color: targetDate ? themeColors.text : themeColors.textSecondary }]}>
                    {targetDate && !isNaN(targetDate.getTime()) ? targetDate.toLocaleDateString() : 'Select a date'}
                  </Text>
                  {targetDate && (
                    <TouchableOpacity
                      onPress={() => setTargetDate(null)}
                      style={styles.clearDateButton}
                    >
                      <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {showDatePicker && Platform.OS === 'ios' && (
                  <View style={[styles.datePickerContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                    <Text style={[styles.datePickerHint, { color: themeColors.textSecondary }]}>
                      {targetDate && !isNaN(targetDate.getTime()) ? 'Date: ' + targetDate.toLocaleDateString() : 'Select a date in MM/DD/YYYY format'}
                    </Text>
                    <TouchableOpacity
                      style={[styles.closeDatePickerButton, { backgroundColor: themeColors.accent }]}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={[styles.closeDatePickerText, { color: themeColors.text }]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.accent }, (!title || loading) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!title || loading}
            >
              <Text style={[styles.buttonText, { color: themeColors.text }]}>Add Milestone</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'transparent', // Will be set dynamically
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    ...Typography.h2,
  },
  content: {
    padding: Spacing.lg,
  },
  label: {
    ...Typography.body,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  input: {
    ...Typography.body,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.body,
    fontWeight: '600',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.sm,
  },
  datePickerText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  datePickerTextSelected: {
    color: Colors.light.text,
  },
  clearDateButton: {
    padding: Spacing.xs,
  },
  closeDatePickerButton: {
    backgroundColor: Colors.light.accent,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  closeDatePickerText: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
  },
  datePickerContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  datePickerHint: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
});
