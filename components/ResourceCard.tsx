import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ResourceType, SkillResource } from '../utils/supabase-types';

interface ResourceCardProps {
  resource: SkillResource;
}

const resourceTypeConfig = {
  link: { icon: 'link', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.2)' },
  document: { icon: 'document-text', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.2)' },
  video: { icon: 'play-circle', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.2)' },
  article: { icon: 'newspaper', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.2)' },
};

export const ResourceCard = ({ resource }: ResourceCardProps) => {
  const config = resourceTypeConfig[resource.resource_type as ResourceType] || resourceTypeConfig.link;

  const handlePress = () => {
    if (resource.url) {
      Linking.openURL(resource.url);
    } else if (resource.file_url) {
      Linking.openURL(resource.file_url);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon as any} size={24} color={config.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{resource.title}</Text>
        {resource.description && (
          <Text style={styles.description} numberOfLines={2}>
            {resource.description}
          </Text>
        )}
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
            <Text style={[styles.badgeText, { color: config.color }]}>
              {resource.resource_type}
            </Text>
          </View>
          <Text style={styles.date}>
            {new Date(resource.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
});
