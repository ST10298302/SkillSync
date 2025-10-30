import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';
import { useSkills } from '../context/SkillsContext';

interface AddTechniqueModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
  onSuccess?: () => void;
  editingTechnique?: any;
}

export const AddTechniqueModal = ({ visible, onClose, skillId, onSuccess, editingTechnique }: AddTechniqueModalProps) => {
  const { addTechnique, updateTechnique } = useEnhancedSkills();
  const { addEntry } = useSkills();
  const [techniqueName, setTechniqueName] = useState('');
  const [description, setDescription] = useState('');
  const [practiceHours, setPracticeHours] = useState('');
  const [masteryLevel, setMasteryLevel] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingTechnique) {
      setTechniqueName(editingTechnique.technique_name || '');
      setDescription(editingTechnique.description || '');
      setPracticeHours(editingTechnique.practice_hours?.toString() || '0');
      setMasteryLevel(editingTechnique.mastery_level?.toString() || '0');
      setNotes(editingTechnique.notes || '');
    } else {
      // Reset form for new technique
      setTechniqueName('');
      setDescription('');
      setPracticeHours('');
      setMasteryLevel('0');
      setNotes('');
    }
  }, [editingTechnique, visible]);

  const handleSubmit = async () => {
    if (!techniqueName.trim()) {
      Alert.alert('Error', 'Please enter a technique name');
      return;
    }

    setLoading(true);
    try {
      const hours = Number.parseFloat(practiceHours) || 0;

      if (editingTechnique) {
        // Update existing technique
        await updateTechnique(editingTechnique.id, {
          technique_name: techniqueName.trim(),
          description: description.trim() || undefined,
          practice_hours: hours,
          mastery_level: Number.parseInt(masteryLevel) || 0,
          notes: notes.trim() || undefined,
        });
      } else {
        // Create new technique
        await addTechnique({
          skill_id: skillId,
          technique_name: techniqueName.trim(),
          description: description.trim() || undefined,
          practice_hours: hours,
          mastery_level: Number.parseInt(masteryLevel) || 0,
          notes: notes.trim() || undefined,
        });

        // Auto-create diary entry if hours were added
        if (hours > 0) {
          try {
            await addEntry(
              skillId,
              `Practiced "${techniqueName.trim()}" technique for ${hours} hour${hours !== 1 ? 's' : ''}`,
              hours
            );
          } catch (entryError) {
            console.error('Failed to create diary entry:', entryError);
            // Don't fail the whole operation if diary entry creation fails
          }
        }
      }

      // Reset form
      setTechniqueName('');
      setDescription('');
      setPracticeHours('');
      setMasteryLevel('0');
      setNotes('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save technique:', error);
      Alert.alert('Error', `Failed to ${editingTechnique ? 'update' : 'add'} technique. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{editingTechnique ? 'Edit Technique' : 'Add Technique'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.label}>Technique Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Fade technique"
              placeholderTextColor={Colors.light.textSecondary}
              value={techniqueName}
              onChangeText={setTechniqueName}
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe this technique..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Practice Hours</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.light.textSecondary}
                  keyboardType="decimal-pad"
                  value={practiceHours}
                  onChangeText={setPracticeHours}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>Mastery Level (0-100)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.light.textSecondary}
                  keyboardType="number-pad"
                  value={masteryLevel}
                  onChangeText={setMasteryLevel}
                  maxLength={3}
                />
              </View>
            </View>

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any additional notes..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity
              style={[styles.button, (!techniqueName || loading) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!techniqueName || loading}
            >
              <Text style={styles.buttonText}>{editingTechnique ? 'Update Technique' : 'Add Technique'}</Text>
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '85%',
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
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
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
});
