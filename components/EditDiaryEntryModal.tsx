import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { DiaryEntry, useSkills } from '../context/SkillsContext';
import { useTheme } from '../context/ThemeContext';

interface EditDiaryEntryModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
  entry: DiaryEntry | null;
}

export const EditDiaryEntryModal = ({ visible, onClose, skillId, entry }: EditDiaryEntryModalProps) => {
  const { updateEntry, deleteEntry } = useSkills();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const [text, setText] = useState('');
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entry) {
      setText(entry.text);
      setHours(entry.hours?.toString() || '');
    }
  }, [entry]);

  const handleSubmit = async () => {
    if (!text.trim() || !entry) return;

    setLoading(true);
    try {
      await updateEntry(skillId, entry.id, text.trim(), parseFloat(hours) || 0);
      onClose();
    } catch (error) {
      console.error('Failed to update entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;

    setLoading(true);
    try {
      await deleteEntry(skillId, entry.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: themeColors.background }]}>
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Edit Diary Entry</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.label, { color: themeColors.text }]}>What did you learn?</Text>
            <TextInput
              style={[styles.input, styles.textArea, { 
                color: themeColors.text,
                backgroundColor: themeColors.backgroundSecondary,
                borderColor: themeColors.border
              }]}
              placeholder="Describe what you learned today..."
              placeholderTextColor={themeColors.textSecondary}
              multiline
              value={text}
              onChangeText={setText}
              maxLength={1000}
            />

            <Text style={[styles.label, { color: themeColors.text }]}>Hours spent (optional)</Text>
            <TextInput
              style={[styles.input, { 
                color: themeColors.text,
                backgroundColor: themeColors.backgroundSecondary,
                borderColor: themeColors.border
              }]}
              placeholder="e.g., 2.5"
              placeholderTextColor={themeColors.textSecondary}
              keyboardType="decimal-pad"
              value={hours}
              onChangeText={setHours}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.deleteButton, { 
                  backgroundColor: themeColors.error,
                  borderColor: themeColors.error
                }]}
                onPress={handleDelete}
                disabled={loading}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { 
                  backgroundColor: themeColors.accent,
                  borderColor: themeColors.accent
                }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <Text style={styles.buttonText}>Saving...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingTop: Spacing.xl,
    maxHeight: '90%',
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
    ...Typography.h3,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  label: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  buttonText: {
    ...Typography.body,
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  deleteButtonText: {
    ...Typography.body,
    color: '#fff',
    fontWeight: '600',
  },
});

