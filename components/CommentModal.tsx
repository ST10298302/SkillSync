import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';
import { SocialService } from '../services/socialService';
import { CommentThread } from './CommentThread';
import { SkillComment } from '../utils/supabase-types';

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
  const insets = useSafeAreaInsets();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<SkillComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const loadComments = useCallback(async () => {
    if (!skillId) {
      console.log('[CommentModal] loadComments: No skillId provided');
      return;
    }
    console.log('[CommentModal] loadComments: Starting to load comments for skillId:', skillId);
    try {
      setLoadingComments(true);
      console.log('[CommentModal] loadComments: Calling SocialService.getSkillComments...');
      // Use SocialService directly since getComments from context doesn't return data
      const fetchedComments = await SocialService.getSkillComments(skillId);
      console.log('[CommentModal] loadComments: Received comments:', fetchedComments);
      console.log('[CommentModal] loadComments: Comments count:', fetchedComments?.length || 0);
      setComments(fetchedComments || []);
      console.log('[CommentModal] loadComments: Comments state updated');
    } catch (error) {
      console.error('[CommentModal] loadComments: Failed to load comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
      console.log('[CommentModal] loadComments: Loading complete');
    }
  }, [skillId]); // Removed getComments from dependencies

  useEffect(() => {
    console.log('[CommentModal] useEffect: visible=', visible, 'skillId=', skillId);
    if (visible && skillId) {
      console.log('[CommentModal] useEffect: Modal visible, loading comments...');
      loadComments();
    } else {
      console.log('[CommentModal] useEffect: Modal closed or no skillId, resetting state');
      // Reset state when modal closes
      setComments([]);
      setComment('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, skillId]); // Removed loadComments from dependencies to prevent infinite loop

  useEffect(() => {
    console.log('[CommentModal] Comments state changed:', comments.length, 'comments', comments);
  }, [comments]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    console.log('[CommentModal] handleSubmit: Submitting comment for skillId:', skillId);
    console.log('[CommentModal] handleSubmit: Comment content:', comment.trim());
    try {
      setLoading(true);
      await SocialService.createComment({
        skill_id: skillId,
        content: comment.trim(),
      });
      console.log('[CommentModal] handleSubmit: Comment created successfully');
      setComment('');
      console.log('[CommentModal] handleSubmit: Reloading comments...');
      await loadComments(); // Reload comments after posting
      onCommentAdded?.();
    } catch (error) {
      console.error('[CommentModal] handleSubmit: Failed to create comment:', error);
      Alert.alert('Error', 'Failed to create comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: themeColors.background }]}>
            {/* Header */}
            <View style={[styles.header, { 
              borderBottomColor: themeColors.border,
              paddingTop: Math.max(insets.top, Spacing.md)
            }]}>
              <Text style={[styles.headerTitle, { color: themeColors.text }]}>Comments</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <View style={styles.commentsContainer}>
              {loadingComments ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={themeColors.accent} />
                  <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
                    Loading comments...
                  </Text>
                </View>
              ) : (
                <CommentThread
                  skillId={skillId}
                  comments={comments}
                  onRefresh={loadComments}
                />
              )}
            </View>

            {/* Input Section - Fixed at bottom */}
            <View style={[styles.inputSection, { 
              backgroundColor: themeColors.background, 
              borderTopColor: themeColors.border,
              paddingBottom: Math.max(insets.bottom, Spacing.md)
            }]}>
              <View style={[styles.inputContainer, { 
                backgroundColor: themeColors.backgroundSecondary,
                borderColor: themeColors.border 
              }]}>
                <TextInput
                  style={[styles.input, { color: themeColors.text }]}
                  placeholder="Write your comment..."
                  placeholderTextColor={themeColors.textSecondary}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  editable={!loading}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton, 
                    { backgroundColor: themeColors.accent }, 
                    (!comment.trim() || loading) && styles.sendButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={!comment.trim() || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    flex: 1,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: '600',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  commentsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  loadingText: {
    ...Typography.body,
  },
  inputSection: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    minHeight: 50,
  },
  input: {
    flex: 1,
    ...Typography.body,
    padding: Spacing.sm,
    maxHeight: 100,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
