import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useSkills } from '../context/SkillsContext';

interface AddDiaryEntryModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
  onSuccess?: () => void;
}

export const AddDiaryEntryModal = ({ visible, onClose, skillId, onSuccess }: AddDiaryEntryModalProps) => {
  const { addEntry } = useSkills();
  const [text, setText] = useState('');
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      await addEntry(skillId, text.trim(), parseFloat(hours) || 0);
      setText('');
      setHours('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to add entry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Diary Entry</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>What did you learn?</Text>
                                <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Describe what you learned today..."
                      placeholderTextColor={Colors.light.textSecondary}
                      multiline
                      value={text}
                      onChangeText={setText}
                      maxLength={1000}
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />

            <Text style={styles.label}>Hours spent (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2.5"
              placeholderTextColor={Colors.light.textSecondary}
              keyboardType="decimal-pad"
              value={hours}
              onChangeText={setHours}
            />

            <TouchableOpacity
              style={[styles.button, (!text || loading) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!text || loading}
            >
              <Text style={styles.buttonText}>Add Entry</Text>
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
    minHeight: 100,
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
});
