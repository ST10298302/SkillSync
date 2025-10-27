import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useSkills } from '../context/SkillsContext';

interface AddProgressModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
  currentProgress: number;
  onSuccess?: () => void;
}

export const AddProgressModal = ({ visible, onClose, skillId, currentProgress, onSuccess }: AddProgressModalProps) => {
  const { addProgressUpdate } = useSkills();
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
          <View style={[styles.modal, { maxHeight: isSmall ? '70%' : '50%' }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Update Progress</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>Current Progress: {currentProgress}%</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Enter new progress (0-100)"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
                value={progress}
                onChangeText={setProgress}
                maxLength={3}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                blurOnSubmit={false}
              />

              <TouchableOpacity
                style={[styles.button, (!progress || loading) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!progress || loading}
              >
                <Text style={styles.buttonText}>Update Progress</Text>
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
    backgroundColor: Colors.light.background,
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
    borderBottomColor: Colors.light.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.light.text,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
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
