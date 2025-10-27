import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';

interface AddMilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
}

export const AddMilestoneModal = ({ visible, onClose, skillId }: AddMilestoneModalProps) => {
  const { createMilestone, milestones } = useEnhancedSkills();
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
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Milestone</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Complete first project"
              placeholderTextColor={Colors.light.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add details about this milestone..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Target Date (optional)</Text>
            {Platform.OS === 'web' ? (
              <TextInput
                style={styles.input}
                type="date"
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.light.textSecondary}
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
                   style={styles.datePickerButton}
                   onPress={() => setShowDatePicker(true)}
                 >
                   <Ionicons name="calendar-outline" size={20} color={Colors.light.textSecondary} />
                   <Text style={[styles.datePickerText, targetDate && styles.datePickerTextSelected]}>
                     {targetDate && !isNaN(targetDate.getTime()) ? targetDate.toLocaleDateString() : 'Select a date'}
                   </Text>
                   {targetDate && (
                     <TouchableOpacity
                       onPress={() => setTargetDate(null)}
                       style={styles.clearDateButton}
                     >
                       <Ionicons name="close-circle" size={20} color={Colors.light.textSecondary} />
                     </TouchableOpacity>
                   )}
                 </TouchableOpacity>

                                 {showDatePicker && Platform.OS === 'ios' && (
                   <View style={styles.datePickerContainer}>
                     {/* Simple iOS-style picker for iOS */}
                     <Text style={styles.datePickerHint}>
                       {targetDate && !isNaN(targetDate.getTime()) ? 'Date: ' + targetDate.toLocaleDateString() : 'Select a date in MM/DD/YYYY format'}
                     </Text>
                     <TouchableOpacity
                       style={styles.closeDatePickerButton}
                       onPress={() => setShowDatePicker(false)}
                     >
                       <Text style={styles.closeDatePickerText}>Done</Text>
                     </TouchableOpacity>
                   </View>
                 )}
              </>
            )}

            <TouchableOpacity
              style={[styles.button, (!title || loading) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!title || loading}
            >
              <Text style={styles.buttonText}>Add Milestone</Text>
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
    backgroundColor: Colors.light.background,
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
    borderBottomColor: Colors.light.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.light.text,
  },
  content: {
    padding: Spacing.lg,
  },
  label: {
    ...Typography.body,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  input: {
    ...Typography.body,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Colors.light.accent,
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
    color: Colors.light.text,
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
