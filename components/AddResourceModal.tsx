import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';
import { ResourceType } from '../utils/supabase-types';

interface AddResourceModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
}

export const AddResourceModal = ({ visible, onClose, skillId }: AddResourceModalProps) => {
  const { addResource } = useEnhancedSkills();
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
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Learning Resource</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Resource Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, type === ResourceType.LINK && styles.typeButtonActive]}
                onPress={() => setType(ResourceType.LINK)}
              >
                <Ionicons name="link" size={20} color={type === ResourceType.LINK ? Colors.light.accent : Colors.light.textSecondary} />
                <Text style={[styles.typeText, type === ResourceType.LINK && styles.typeTextActive]}>Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === ResourceType.VIDEO && styles.typeButtonActive]}
                onPress={() => setType(ResourceType.VIDEO)}
              >
                <Ionicons name="videocam" size={20} color={type === ResourceType.VIDEO ? Colors.light.accent : Colors.light.textSecondary} />
                <Text style={[styles.typeText, type === ResourceType.VIDEO && styles.typeTextActive]}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === ResourceType.DOCUMENT && styles.typeButtonActive]}
                onPress={() => setType(ResourceType.DOCUMENT)}
              >
                <Ionicons name="document-text" size={20} color={type === ResourceType.DOCUMENT ? Colors.light.accent : Colors.light.textSecondary} />
                <Text style={[styles.typeText, type === ResourceType.DOCUMENT && styles.typeTextActive]}>Document</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === ResourceType.ARTICLE && styles.typeButtonActive]}
                onPress={() => setType(ResourceType.ARTICLE)}
              >
                <Ionicons name="newspaper" size={20} color={type === ResourceType.ARTICLE ? Colors.light.accent : Colors.light.textSecondary} />
                <Text style={[styles.typeText, type === ResourceType.ARTICLE && styles.typeTextActive]}>Article</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Resource title"
              placeholderTextColor={Colors.light.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>
              {type === ResourceType.DOCUMENT ? 'File URL or Link' : 'URL'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor={Colors.light.textSecondary}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <TouchableOpacity
              style={[styles.button, (!title || !url || loading) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!title || !url || loading}
            >
              <Text style={styles.buttonText}>Add Resource</Text>
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
    borderColor: Colors.light.border,
    gap: Spacing.xs,
  },
  typeButtonActive: {
    backgroundColor: Colors.light.accent + '20',
    borderColor: Colors.light.accent,
  },
  typeText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },
  typeTextActive: {
    color: Colors.light.accent,
    fontWeight: '600',
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
