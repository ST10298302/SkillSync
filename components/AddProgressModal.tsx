import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useSkills } from '../context/SkillsContext';
import { useTheme } from '../context/ThemeContext';

interface AddProgressModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
  currentProgress: number;
  onSuccess?: () => void;
}

export const AddProgressModal = ({ visible, onClose, skillId, currentProgress, onSuccess }: AddProgressModalProps) => {
  const { addProgressUpdate } = useSkills();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const [progress, setProgress] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Responsive sizing
  const screenWidth = Dimensions.get('window').width;
  const isSmall = screenWidth < 375;

  const handleSubmit = async () => {
    const progressValue = parseInt(progress);
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      return;
    }

    setLoading(true);
    try {
      await addProgressUpdate(skillId, progressValue);
      setProgress('');
      onSuccess?.();
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
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={[styles.modal, { backgroundColor: themeColors.background, maxHeight: isSmall ? '70%' : '50%' }]}>
            <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.title, { color: themeColors.text }]}>Update Progress</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.label, { color: themeColors.text }]}>Current Progress: {currentProgress}%</Text>
              
              <TextInput
                style={[styles.input, { 
                  color: themeColors.text, 
                  backgroundColor: themeColors.backgroundSecondary, 
                  borderColor: themeColors.border 
                }]}
                placeholder="Enter new progress (0-100)"
                placeholderTextColor={themeColors.textSecondary}
                keyboardType="numeric"
                value={progress}
                onChangeText={setProgress}
                maxLength={3}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                blurOnSubmit={false}
              />

              <TouchableOpacity
                style={[
                  styles.button, 
                  { backgroundColor: themeColors.accent }, 
                  (!progress || loading) && styles.buttonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!progress || loading}
              >
                <Text style={[styles.buttonText, { color: themeColors.text }]}>Update Progress</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'transparent', // Will be set dynamically
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
  },
  scrollView: {
    flexGrow: 1,
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
    paddingBottom: Spacing.xl,
  },
  label: {
    ...Typography.body,
    marginBottom: Spacing.sm,
  },
  input: {
    ...Typography.body,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  button: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.body,
    fontWeight: '600',
  },
});
