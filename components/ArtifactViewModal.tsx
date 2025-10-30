import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { MediaService } from '../services/mediaService';
import { SkillArtifact } from '../utils/supabase-types';

interface ArtifactViewModalProps {
  visible: boolean;
  artifact: SkillArtifact | null;
  onClose: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
}

export const ArtifactViewModal = ({ visible, artifact, onClose, canDelete = false, onDelete }: ArtifactViewModalProps) => {
  const [downloading, setDownloading] = useState(false);
  const themeColors = Colors.light;

  const handleDownload = async () => {
    if (!artifact || !artifact.file_url) return;

    setDownloading(true);
    try {
      if (Platform.OS === 'web') {
        // On web, open in new tab
        window.open(artifact.file_url, '_blank');
      } else {
        // On native, download the file
        const fileUri = (((FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory) ?? '') + artifact.title + '.' + artifact.file_type;
        const downloadResumable = FileSystem.createDownloadResumable(
          artifact.file_url,
          fileUri,
          {},
          (downloadProgress) => {
            const expected = (downloadProgress as any).totalBytesExpectedToWrite ?? 1;
            const progress = downloadProgress.totalBytesWritten / expected;
            console.log('Download progress:', progress);
          }
        );

        const result = await downloadResumable.downloadAsync();
        
        if (result) {
          Alert.alert(
            'Download Complete',
            'File saved to: ' + result.uri,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Error', 'Failed to download file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleView = async () => {
    if (!artifact || !artifact.file_url) return;

    try {
      if (Platform.OS === 'web') {
        // On web, open in new tab
        window.open(artifact.file_url, '_blank');
      } else {
        // On native, open with system viewer
        await WebBrowser.openBrowserAsync(artifact.file_url);
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      Alert.alert('Error', 'Failed to open file. Please try again.');
    }
  };

  if (!artifact) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{artifact.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Image Preview */}
            {artifact.thumbnail_url && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: artifact.thumbnail_url }} 
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Description */}
            {artifact.description && (
              <View style={styles.section}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.description}>{artifact.description}</Text>
              </View>
            )}

            {/* File Info */}
            <View style={styles.section}>
              <Text style={styles.label}>File Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type:</Text>
                <Text style={styles.infoValue}>{artifact.file_type}</Text>
              </View>
              {artifact.file_size && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Size:</Text>
                  <Text style={styles.infoValue}>{MediaService.formatFileSize(artifact.file_size)}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>
                  {new Date(artifact.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.viewButton]}
              onPress={handleView}
            >
              <Ionicons name="eye-outline" size={20} color={themeColors.text} />
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.downloadButton]}
              onPress={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator size="small" color={themeColors.accent} />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color={themeColors.accent} />
                  <Text style={[styles.buttonText, { color: themeColors.accent }]}>Download</Text>
                </>
              )}
            </TouchableOpacity>

            {canDelete && onDelete && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={onDelete}
              >
                <Ionicons name="trash-outline" size={20} color={themeColors.error} />
                <Text style={[styles.buttonText, { color: themeColors.error }]}>Delete</Text>
              </TouchableOpacity>
            )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.xl,
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.light.text,
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.light.backgroundTertiary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  viewButton: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  downloadButton: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.accent,
  },
  deleteButton: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  buttonText: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
  },
});
