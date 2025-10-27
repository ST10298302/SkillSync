import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';

interface AddChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
  onSuccess?: () => void;
  editingChallenge?: any;
}

export const AddChallengeModal = ({ visible, onClose, skillId, onSuccess, editingChallenge }: AddChallengeModalProps) => {
  const { addChallenge, updateChallenge } = useEnhancedSkills();
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingChallenge) {
      setChallengeTitle(editingChallenge.challenge_title || '');
      setChallengeDescription(editingChallenge.challenge_description || '');
      setSolution(editingChallenge.solution || '');
    } else {
      // Reset form for new challenge
      setChallengeTitle('');
      setChallengeDescription('');
      setSolution('');
    }
  }, [editingChallenge, visible]);

  const handleSubmit = async () => {
    if (!challengeTitle.trim()) {
      Alert.alert('Error', 'Please enter a challenge title');
      return;
    }

    setLoading(true);
    try {
      if (editingChallenge) {
        // Update existing challenge
        await updateChallenge(editingChallenge.id, {
          challenge_title: challengeTitle.trim(),
          challenge_description: challengeDescription.trim() || undefined,
          solution: solution.trim() || undefined,
          is_resolved: solution.trim().length > 0,
        });
      } else {
        // Create new challenge
        await addChallenge({
          skill_id: skillId,
          challenge_title: challengeTitle.trim(),
          challenge_description: challengeDescription.trim() || undefined,
          solution: solution.trim() || undefined,
          is_resolved: solution.trim().length > 0,
        });
      }

      // Reset form
      setChallengeTitle('');
      setChallengeDescription('');
      setSolution('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save challenge:', error);
      Alert.alert('Error', `Failed to ${editingChallenge ? 'update' : 'add'} challenge. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{editingChallenge ? 'Edit Challenge' : 'Add Challenge'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.label}>Challenge Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Difficulty with blending colors"
              placeholderTextColor={Colors.light.textSecondary}
              value={challengeTitle}
              onChangeText={setChallengeTitle}
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the challenge you faced..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              value={challengeDescription}
              onChangeText={setChallengeDescription}
            />

            <Text style={styles.label}>Solution (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="How did you resolve this challenge?"
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              value={solution}
              onChangeText={setSolution}
            />
            <Text style={styles.hint}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.light.textSecondary} />{' '}
              Adding a solution will automatically mark this challenge as resolved
            </Text>

            <TouchableOpacity
              style={[styles.button, (!challengeTitle || loading) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!challengeTitle || loading}
            >
              <Text style={styles.buttonText}>{editingChallenge ? 'Update Challenge' : 'Add Challenge'}</Text>
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
  hint: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
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
