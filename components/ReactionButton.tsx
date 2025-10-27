import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';
import { ReactionType } from '../utils/supabase-types';

const colors = {
  primary: '#60a5fa', // Using the accent color from Colors
};

interface ReactionButtonProps {
  skillId: string;
  initialReaction?: ReactionType;
  reactionCount: number;
  onReactionChange?: () => void;
}

const reactionTypes = [
  { type: 'like' as ReactionType, icon: 'thumbs-up', label: 'Like', emoji: '👍' },
  { type: 'love' as ReactionType, icon: 'heart', label: 'Love', emoji: '❤️' },
  { type: 'celebrate' as ReactionType, icon: 'flame', label: 'Celebrate', emoji: '🎉' },
  { type: 'insightful' as ReactionType, icon: 'bulb', label: 'Insightful', emoji: '💡' },
  { type: 'motivate' as ReactionType, icon: 'rocket', label: 'Motivate', emoji: '🚀' },
];

export const ReactionButton = ({ skillId, initialReaction, reactionCount, onReactionChange }: ReactionButtonProps) => {
  const { addReaction, removeReaction } = useEnhancedSkills();
  const [currentReaction, setCurrentReaction] = useState<ReactionType | undefined>(initialReaction);
  const [showPicker, setShowPicker] = useState(false);

  const handleReactionPress = async (reactionType: ReactionType) => {
    try {
      if (currentReaction === reactionType) {
        // Remove reaction
        await removeReaction(skillId);
        setCurrentReaction(undefined);
      } else {
        // Add or change reaction
        await addReaction(skillId, reactionType);
        setCurrentReaction(reactionType);
      }
      setShowPicker(false);
      onReactionChange?.();
    } catch (error) {
      console.error('Failed to update reaction:', error);
    }
  };

  const currentReactionConfig = reactionTypes.find(r => r.type === currentReaction);

  return (
    <>
      <TouchableOpacity
        style={styles.reactionButton}
        onPress={() => setShowPicker(true)}
      >
        <View style={styles.reactionContent}>
          {currentReactionConfig ? (
            <>
              <Text style={styles.emoji}>{currentReactionConfig.emoji}</Text>
              <Text style={styles.label}>{currentReactionConfig.label}</Text>
            </>
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addLabel}>React</Text>
            </>
          )}
          <Text style={styles.count}>{reactionCount}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Add Reaction</Text>
            <View style={styles.reactionsGrid}>
              {reactionTypes.map((reaction) => (
                <TouchableOpacity
                  key={reaction.type}
                  style={[
                    styles.reactionOption,
                    currentReaction === reaction.type && styles.reactionOptionActive,
                  ]}
                  onPress={() => handleReactionPress(reaction.type)}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={[
                    styles.reactionLabel,
                    currentReaction === reaction.type && styles.reactionLabelActive,
                  ]}>
                    {reaction.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  reactionButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
    marginRight: 6,
  },
  label: {
    color: colors.primary,
    fontWeight: '600',
    marginRight: 6,
  },
  addLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 6,
  },
  count: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  reactionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reactionOption: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  reactionOptionActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  reactionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  reactionLabel: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
  reactionLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
