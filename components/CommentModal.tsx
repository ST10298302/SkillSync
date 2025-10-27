import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { SocialService } from '../services/socialService';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string;
  onCommentAdded?: () => void;
}

export default function CommentModal({ visible, onClose, skillId, onCommentAdded }: CommentModalProps) {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      setLoading(true);
      await SocialService.createComment({
        skill_id: skillId,
        content: comment.trim(),
      });
      setComment('');
      onCommentAdded?.();
      onClose();
    } catch (error) {
      console.error('Failed to create comment:', error);
      Alert.alert('Error', 'Failed to create comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    keyboardAvoid: {
      flex: 1,
    },
    modal: {
      backgroundColor: themeColors.background,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: '80%',
      paddingTop: Spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    headerTitle: {
      ...Typography.h3,
      color: themeColors.text,
      fontWeight: '600',
    },
    closeButton: {
      padding: Spacing.xs,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: Spacing.lg,
    },
    inputContainer: {
      marginBottom: Spacing.md,
    },
    input: {
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      ...Typography.body,
      color: themeColors.text,
      minHeight: 100,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    submitButton: {
      backgroundColor: themeColors.accent,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonText: {
      ...Typography.button,
      color: '#fff',
      fontWeight: '600',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add Comment</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Write your comment..."
                  placeholderTextColor={themeColors.textSecondary}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Posting...' : 'Post Comment'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

