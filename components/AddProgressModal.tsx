import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useSkills } from '../context/SkillsContext';

interface AddProgressModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
  currentProgress: number;
}

export const AddProgressModal = ({ visible, onClose, skillId, currentProgress }: AddProgressModalProps) => {
  const { addProgressUpdate } = useSkills();
  const [progress, setProgress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const progressValue = parseInt(progress);
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      return;
    }

    setLoading(true);
    try {
      await addProgressUpdate(skillId, progressValue);
      setProgress('');
      onClose();
    } catch (error) {
      console.error('Failed to add progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Update Progress</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Current Progress: {currentProgress}%</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter new progress (0-100)"
              placeholderTextColor={Colors.light.textSecondary}
              keyboardType="numeric"
              value={progress}
              onChangeText={setProgress}
              maxLength={3}
            />

            <TouchableOpacity
              style={[styles.button, (!progress || loading) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!progress || loading}
            >
              <Text style={styles.buttonText}>Update Progress</Text>
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
    maxHeight: '50%',
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
  },
  input: {
    ...Typography.body,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  button: {
    backgroundColor: Colors.light.accent,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
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
