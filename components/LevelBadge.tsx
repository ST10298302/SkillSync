import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { SkillLevelType } from '../utils/supabase-types';

interface LevelBadgeProps {
  level: SkillLevelType;
  size?: 'small' | 'medium' | 'large';
}

const levelConfig = {
  beginner: { 
    icon: 'school-outline', 
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.2)',
  },
  novice: { 
    icon: 'flash-outline', 
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.2)',
  },
  intermediate: { 
    icon: 'trending-up-outline', 
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.2)',
  },
  advanced: { 
    icon: 'award-outline', 
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.2)',
  },
  expert: { 
    icon: 'trophy-outline', 
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.2)',
  },
};

export const LevelBadge = ({ level, size = 'medium' }: LevelBadgeProps) => {
  const { t } = useLanguage();
  const config = levelConfig[level];
  
  // Get translated label based on level
  const getLabel = () => {
    switch(level) {
      case 'beginner': return t('levelBeginner');
      case 'novice': return t('levelNovice');
      case 'intermediate': return t('levelIntermediate');
      case 'advanced': return t('levelAdvanced');
      case 'expert': return t('levelExpert');
      default: return level;
    }
  };
  
  const label = getLabel();
  
  const sizeConfig = {
    small: { fontSize: 10, iconSize: 14, padding: 4, minWidth: 60 },
    medium: { fontSize: 12, iconSize: 16, padding: 6, minWidth: 80 },
    large: { fontSize: 14, iconSize: 20, padding: 8, minWidth: 100 },
  };

  const { fontSize, iconSize, padding, minWidth } = sizeConfig[size];

  return (
    <View style={[styles.badge, { 
      backgroundColor: config.bgColor, 
      padding, 
      minWidth,
    }]}>
      <Ionicons name={config.icon as any} size={iconSize} color={config.color} />
      <Text style={[styles.label, { 
        fontSize, 
        color: config.color,
        marginLeft: 4,
      }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
  },
  label: {
    fontWeight: '600',
  },
});
