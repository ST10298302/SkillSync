import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';
import { useTheme } from '../context/ThemeContext';
import { SkillComment } from '../utils/supabase-types';

interface CommentThreadProps {
  skillId: string;
  comments: SkillComment[];
  onRefresh?: () => void;
  hideInput?: boolean; // Hide input when used in modal
}

export const CommentThread = ({ skillId, comments, onRefresh, hideInput = false }: CommentThreadProps) => {
  const { createComment } = useEnhancedSkills();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  const insets = useSafeAreaInsets();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  console.log('[CommentThread] Render: skillId=', skillId, 'comments count=', comments.length, 'comments=', comments);

  useEffect(() => {
    console.log('[CommentThread] Comments prop changed:', comments.length, 'comments');
    console.log('[CommentThread] Comments data:', comments.map(c => ({ 
      id: c.id, 
      content: c.content?.substring(0, 50), 
      parent_id: c.parent_comment_id,
      user_id: c.user_id 
    })));
  }, [comments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;

    console.log('[CommentThread] handleSubmitComment: Creating comment for skillId:', skillId);
    try {
      setSubmitting(true);
      await createComment(skillId, newComment, replyingTo || undefined);
      console.log('[CommentThread] handleSubmitComment: Comment created successfully');
      setNewComment('');
      setReplyingTo(null);
      onRefresh?.();
    } catch (error) {
      console.error('[CommentThread] handleSubmitComment: Failed to create comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const getUserName = (comment: SkillComment) => {
    if (comment.user?.email) return comment.user.email;
    if (comment.user?.name) return comment.user.name;
    return `User ${comment.user_id.slice(0, 8)}`;
  };

  const getUserInitials = (comment: SkillComment) => {
    const name = comment.user?.email || comment.user?.name || 'U';
    return name.charAt(0).toUpperCase();
  };

  const renderComment = ({ item: comment }: { item: SkillComment }) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const repliesExpanded = expandedReplies.has(comment.id);

    return (
      <View style={[styles.commentContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
        <View style={styles.commentHeader}>
          <View style={[styles.avatar, { backgroundColor: themeColors.accent }]}>
            <Text style={styles.avatarText}>{getUserInitials(comment)}</Text>
          </View>
          <View style={styles.commentContent}>
            <View style={styles.commentMeta}>
              <Text style={[styles.username, { color: themeColors.text }]}>{getUserName(comment)}</Text>
              <Text style={[styles.timestamp, { color: themeColors.textSecondary }]}>
                {new Date(comment.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[styles.commentText, { color: themeColors.text }]}>{comment.content}</Text>
            <View style={styles.commentActions}>
              <TouchableOpacity 
                style={styles.replyButton}
                onPress={() => setReplyingTo(comment.id)}
              >
                <Ionicons name="chatbubble-outline" size={16} color={themeColors.accent} />
                <Text style={[styles.replyText, { color: themeColors.accent }]}>Reply</Text>
              </TouchableOpacity>
              {hasReplies && (
                <TouchableOpacity 
                  style={styles.toggleButton}
                  onPress={() => toggleReplies(comment.id)}
                >
                  <Ionicons 
                    name={repliesExpanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={themeColors.accent} 
                  />
                  <Text style={[styles.replyText, { color: themeColors.accent }]}>
                    {repliesExpanded ? 'Hide' : 'Show'} {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Render replies */}
        {hasReplies && repliesExpanded && (
          <View style={[styles.repliesContainer, { borderLeftColor: themeColors.accent + '40' }]}>
            {comment.replies?.map(reply => (
              <View key={reply.id} style={styles.replyContainer}>
                <View style={[styles.avatarSmall, { backgroundColor: themeColors.accent }]}>
                  <Text style={styles.avatarTextSmall}>{getUserInitials(reply)}</Text>
                </View>
                <View style={styles.replyContent}>
                  <View style={styles.commentMeta}>
                    <Text style={[styles.username, { color: themeColors.text }]}>{getUserName(reply)}</Text>
                    <Text style={[styles.timestamp, { color: themeColors.textSecondary }]}>
                      {new Date(reply.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.replyTextContent, { color: themeColors.text }]}>{reply.content}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Filter out replies - only count top-level comments
  const topLevelComments = comments.filter(c => !c.parent_comment_id);
  
  useEffect(() => {
    console.log('[CommentThread] Filtered top-level comments:', topLevelComments.length);
  }, [topLevelComments.length]);
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Text style={[styles.title, { color: themeColors.text }]}>
        Comments ({topLevelComments.length})
      </Text>

      <FlatList
        data={topLevelComments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        style={styles.commentsList}
        contentContainerStyle={styles.commentsListContent}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={themeColors.textSecondary} />
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              No comments yet. Be the first to comment!
            </Text>
          </View>
        }
      />

      {replyingTo && (
        <View style={[styles.replyingTo, { backgroundColor: themeColors.accent + '20' }]}>
          <Text style={[styles.replyingText, { color: themeColors.accent }]}>Replying to comment...</Text>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Ionicons name="close-circle" size={20} color={themeColors.accent} />
          </TouchableOpacity>
        </View>
      )}

      {/* Comment Input - Hidden when used in modal */}
      {!hideInput && (
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
              placeholder={replyingTo ? "Write a reply..." : "Write your comment..."}
              placeholderTextColor={themeColors.textSecondary}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              editable={!submitting}
            />
            <TouchableOpacity
              style={[
                styles.sendButton, 
                { backgroundColor: themeColors.accent }, 
                (!newComment.trim() || submitting) && styles.sendButtonDisabled
              ]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...Typography.h3,
    fontWeight: '600',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  commentContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    ...Typography.body,
    color: '#fff',
    fontWeight: '700',
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  username: {
    ...Typography.body,
    fontWeight: '600',
  },
  timestamp: {
    ...Typography.caption,
  },
  commentText: {
    ...Typography.body,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  replyText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: Spacing.sm,
    marginLeft: 52,
    paddingLeft: Spacing.md,
    borderLeftWidth: 2,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarTextSmall: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  replyContent: {
    flex: 1,
  },
  replyTextContent: {
    ...Typography.body,
    fontSize: 14,
  },
  replyingTo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  replyingText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  inputSection: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
