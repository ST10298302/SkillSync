import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useSkills } from '../context/SkillsContext';
import { useTheme } from '../context/ThemeContext';

interface AddDiaryEntryModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
  onSuccess?: () => void;
}

export const AddDiaryEntryModal = ({ visible, onClose, skillId, onSuccess }: AddDiaryEntryModalProps) => {
  const { addEntry } = useSkills();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const [text, setText] = useState('');
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      await addEntry(skillId, text.trim(), Number.parseFloat(hours) || 0);
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: themeColors.background }]}>
            <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.title, { color: themeColors.text }]}>Add Diary Entry</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
            >
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
              returnKeyType="done"
              blurOnSubmit={true}
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

              <TouchableOpacity
                style={[
                  styles.button, 
                  { backgroundColor: themeColors.accent },
                  (!text || loading) && styles.buttonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!text || loading}
              >
                <Text style={[styles.buttonText, { color: themeColors.text }]}>Add Entry</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
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
    flexGrow: 1,
  },
  contentContainer: {
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
    minHeight: 100,
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
});
