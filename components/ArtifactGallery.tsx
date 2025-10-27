import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { SkillArtifact } from '../utils/supabase-types';
import { ArtifactCard } from './ArtifactCard';

interface ArtifactGalleryProps {
  artifacts: SkillArtifact[];
  onArtifactPress?: (artifact: SkillArtifact) => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

type ViewMode = 'grid' | 'list';

export const ArtifactGallery = ({
  artifacts,
  onArtifactPress,
  onDelete,
  canDelete = false,
}: ArtifactGalleryProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const themeColors = Colors.light;

  const renderGridItem = ({ item }: { item: SkillArtifact }) => (
    <View style={styles.gridItem}>
      <ArtifactCard
        artifact={item}
        onPress={() => onArtifactPress?.(item)}
        onDelete={onDelete}
        canDelete={canDelete}
      />
    </View>
  );

  const renderListItem = ({ item }: { item: SkillArtifact }) => (
    <ArtifactCard
      artifact={item}
      onPress={() => onArtifactPress?.(item)}
      onDelete={onDelete}
      canDelete={canDelete}
    />
  );

  if (artifacts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="image-outline" size={64} color={themeColors.textSecondary} />
        <Text style={styles.emptyTitle}>No Artifacts Yet</Text>
        <Text style={styles.emptySubtitle}>
          Add evidence, certificates, or project files to showcase your progress
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* View Toggle */}
      <View style={styles.header}>
        <Text style={styles.title}>Artifacts ({artifacts.length})</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewMode === 'list' ? themeColors.accent : themeColors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'grid' && styles.toggleButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons
              name="grid"
              size={20}
              color={viewMode === 'grid' ? themeColors.accent : themeColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Artifacts List */}
      <FlatList
        data={artifacts}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render on view mode change
        contentContainerStyle={styles.listContent}
        scrollEnabled={false} // Embed in parent scroll view
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    padding: 2,
    gap: 4,
  },
  toggleButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: Colors.light.accent + '20',
  },
  listContent: {
    paddingVertical: Spacing.xs,
  },
  gridItem: {
    flex: 1,
    margin: Spacing.xs / 2,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
});
