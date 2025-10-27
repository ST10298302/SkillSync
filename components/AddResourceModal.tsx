import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';
import { useTheme } from '../context/ThemeContext';
import { ResourceType } from '../utils/supabase-types';

interface AddResourceModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
}

export const AddResourceModal = ({ visible, onClose, skillId }: AddResourceModalProps) => {
  const { addResource } = useEnhancedSkills();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' || resolvedTheme === 'darker' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceType>(ResourceType.LINK);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !url.trim()) return;

    setLoading(true);
    try {
      await addResource({
        skill_id: skillId,
        title: title.trim(),
        url: url.trim(),
        resource_type: type,
      });
      setTitle('');
      setUrl('');
      onClose();
    } catch (error) {
      console.error('Failed to add resource:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: themeColors.background }]}>
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Add Learning Resource</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.label, { color: themeColors.text }]}>Resource Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { borderColor: themeColors.border },
                  type === ResourceType.LINK && [styles.typeButtonActive, 
                    { backgroundColor: themeColors.accent + '20', borderColor: themeColors.accent }]
                ]}
                onPress={() => setType(ResourceType.LINK)}
              >
                <Ionicons name="link" size={20} color={type === ResourceType.LINK ? themeColors.accent : themeColors.textSecondary} />
                <Text style={[styles.typeText, { color: type === ResourceType.LINK ? themeColors.accent : themeColors.textSecondary }]}>Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { borderColor: themeColors.border },
                  type === ResourceType.VIDEO && [styles.typeButtonActive,
                    { backgroundColor: themeColors.accent + '20', borderColor: themeColors.accent }]
                ]}
                onPress={() => setType(ResourceType.VIDEO)}
              >
                <Ionicons name="videocam" size={20} color={type === ResourceType.VIDEO ? themeColors.accent : themeColors.textSecondary} />
                <Text style={[styles.typeText, { color: type === ResourceType.VIDEO ? themeColors.accent : themeColors.textSecondary }]}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { borderColor: themeColors.border },
                  type === ResourceType.DOCUMENT && [styles.typeButtonActive,
                    { backgroundColor: themeColors.accent + '20', borderColor: themeColors.accent }]
                ]}
                onPress={() => setType(ResourceType.DOCUMENT)}
              >
                <Ionicons name="document-text" size={20} color={type === ResourceType.DOCUMENT ? themeColors.accent : themeColors.textSecondary} />
                <Text style={[styles.typeText, { color: type === ResourceType.DOCUMENT ? themeColors.accent : themeColors.textSecondary }]}>Document</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { borderColor: themeColors.border },
                  type === ResourceType.ARTICLE && [styles.typeButtonActive,
                    { backgroundColor: themeColors.accent + '20', borderColor: themeColors.accent }]
                ]}
                onPress={() => setType(ResourceType.ARTICLE)}
              >
                <Ionicons name="newspaper" size={20} color={type === ResourceType.ARTICLE ? themeColors.accent : themeColors.textSecondary} />
                <Text style={[styles.typeText, { color: type === ResourceType.ARTICLE ? themeColors.accent : themeColors.textSecondary }]}>Article</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: themeColors.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}
              placeholder="Resource title"
              placeholderTextColor={themeColors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.label, { color: themeColors.text }]}>
              {type === ResourceType.DOCUMENT ? 'File URL or Link' : 'URL'}
            </Text>
            <TextInput
              style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}
              placeholder="https://..."
              placeholderTextColor={themeColors.textSecondary}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.accent }, (!title || !url || loading) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!title || !url || loading}
            >
              <Text style={[styles.buttonText, { color: themeColors.text }]}>Add Resource</Text>
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
  typeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  typeButton: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  typeButtonActive: {
    // Dynamic colors applied inline
  },
  typeText: {
    ...Typography.bodySmall,
  },
  typeTextActive: {
    fontWeight: '600',
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
