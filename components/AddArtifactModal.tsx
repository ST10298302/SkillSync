import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';
import { useTheme } from '../context/ThemeContext';
import { MediaService } from '../services/mediaService';
import { ArtifactFileType } from '../utils/supabase-types';

interface AddArtifactModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
}

export const AddArtifactModal = ({ visible, onClose, skillId }: AddArtifactModalProps) => {
  const { getResources } = useEnhancedSkills();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileType, setFileType] = useState<ArtifactFileType>(ArtifactFileType.IMAGE);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setFileType(ArtifactFileType.IMAGE);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your camera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setFileType(ArtifactFileType.IMAGE);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !selectedImage) return;

    setLoading(true);
    try {
      // Upload image with compression
      const { url, thumbnailUrl } = await MediaService.uploadImage(selectedImage);
      
      // Get file size
      const fileSize = await MediaService.getFileSize(url);
      
      // Create artifact record
      await MediaService.createArtifact(
        skillId,
        title.trim(),
        description.trim() || undefined,
        url,
        fileType,
        thumbnailUrl,
        fileSize
      );

      // Refresh resources to show artifacts
      await getResources(skillId);

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedImage(null);
      onClose();
    } catch (error) {
      console.error('Failed to add artifact:', error);
      Alert.alert('Error', 'Failed to upload artifact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Artifact',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: themeColors.background }]}>
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Add Evidence/Artifact</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={[styles.label, { color: themeColors.text }]}>Title *</Text>
            <TextInput
              style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}
              placeholder="e.g., Project screenshot, certificate, etc."
              placeholderTextColor={themeColors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.label, { color: themeColors.text }]}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: themeColors.text, backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}
              placeholder="Add details about this evidence..."
              placeholderTextColor={themeColors.textSecondary}
              multiline
              value={description}
              onChangeText={setDescription}
              maxLength={500}
            />

            <Text style={[styles.label, { color: themeColors.text }]}>Image/Photo *</Text>
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity style={[styles.changeButton, { borderColor: themeColors.accent }]} onPress={showImageOptions}>
                  <Text style={[styles.changeButtonText, { color: themeColors.accent }]}>Change Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.imagePicker, { borderColor: themeColors.border }]} onPress={showImageOptions}>
                <Ionicons name="image-outline" size={48} color={themeColors.textSecondary} />
                <Text style={[styles.imagePickerText, { color: themeColors.text }]}>Add Photo</Text>
                <Text style={[styles.imagePickerHint, { color: themeColors.textSecondary }]}>Take a photo or choose from library</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.accent }, (!title || !selectedImage || loading) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!title || !selectedImage || loading}
            >
              <Text style={[styles.buttonText, { color: themeColors.text }]}>
                {loading ? 'Uploading...' : 'Upload Artifact'}
              </Text>
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
    backgroundColor: 'transparent', // Will be set dynamically
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  imagePickerText: {
    ...Typography.body,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
  imagePickerHint: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  imageContainer: {
    marginBottom: Spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  changeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  changeButtonText: {
    ...Typography.body,
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
