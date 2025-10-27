import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { MediaService } from '../services/mediaService';
import { ArtifactFileType, SkillArtifact } from '../utils/supabase-types';

interface ArtifactCardProps {
  artifact: SkillArtifact;
  onDelete?: () => void;
  onPress?: () => void;
  canDelete?: boolean;
}

const fileTypeIcons: Record<ArtifactFileType, string> = {
  image: 'image-outline',
  pdf: 'document-text-outline',
  document: 'document-outline',
  video: 'videocam-outline',
};

export const ArtifactCard = ({ artifact, onDelete, onPress, canDelete = false }: ArtifactCardProps) => {
  const themeColors = Colors.light;

  const handleDelete = async () => {
    try {
      await MediaService.deleteArtifact(artifact.id);
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete artifact:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {artifact.thumbnail_url ? (
          <Image source={{ uri: artifact.thumbnail_url }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name={fileTypeIcons[artifact.file_type] as any}
              size={32}
              color={themeColors.textSecondary}
            />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {artifact.title}
        </Text>
        
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: themeColors.backgroundSecondary }]}>
            <Ionicons
              name={fileTypeIcons[artifact.file_type] as any}
              size={12}
              color={themeColors.textSecondary}
            />
            <Text style={[styles.badgeText, { color: themeColors.textSecondary }]}>
              {artifact.file_type}
            </Text>
          </View>
          
          {artifact.file_size && (
            <Text style={styles.fileSize}>
              {MediaService.formatFileSize(artifact.file_size)}
            </Text>
          )}
        </View>

        {artifact.description && (
          <Text style={styles.description} numberOfLines={2}>
            {artifact.description}
          </Text>
        )}
      </View>

      {canDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color={themeColors.error} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: Spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
  },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  badgeText: {
    ...Typography.caption,
    textTransform: 'capitalize',
  },
  fileSize: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  description: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  deleteButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
