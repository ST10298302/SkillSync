import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEnhancedSkills } from '../context/EnhancedSkillsContext';
import { SkillComment } from '../utils/supabase-types';

const colors = {
  primary: '#60a5fa', // Using the accent color from Colors
};

interface CommentThreadProps {
  skillId: string;
  comments: SkillComment[];
  onRefresh?: () => void;
}

export const CommentThread = ({ skillId, comments, onRefresh }: CommentThreadProps) => {
  const { createComment } = useEnhancedSkills();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment(skillId, newComment, replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to create comment:', error);
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
      <View style={styles.commentContainer}>
        <View style={styles.commentHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getUserInitials(comment)}</Text>
          </View>
          <View style={styles.commentContent}>
            <View style={styles.commentMeta}>
              <Text style={styles.username}>{getUserName(comment)}</Text>
              <Text style={styles.timestamp}>
                {new Date(comment.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.commentText}>{comment.content}</Text>
            <View style={styles.commentActions}>
              <TouchableOpacity 
                style={styles.replyButton}
                onPress={() => setReplyingTo(comment.id)}
              >
                <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
                <Text style={styles.replyText}>Reply</Text>
              </TouchableOpacity>
              {hasReplies && (
                <TouchableOpacity 
                  style={styles.toggleButton}
                  onPress={() => toggleReplies(comment.id)}
                >
                  <Ionicons 
                    name={repliesExpanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={colors.primary} 
                  />
                  <Text style={styles.replyText}>
                    {repliesExpanded ? 'Hide' : 'Show'} {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Render replies */}
        {hasReplies && repliesExpanded && (
          <View style={styles.repliesContainer}>
            {comment.replies?.map(reply => (
              <View key={reply.id} style={styles.replyContainer}>
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarTextSmall}>{getUserInitials(reply)}</Text>
                </View>
                <View style={styles.replyContent}>
                  <View style={styles.commentMeta}>
                    <Text style={styles.username}>{getUserName(reply)}</Text>
                    <Text style={styles.timestamp}>
                      {new Date(reply.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.replyText}>{reply.content}</Text>
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
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Comments ({topLevelComments.length})
      </Text>

      <FlatList
        data={topLevelComments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        style={styles.commentsList}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
        }
      />

      {replyingTo && (
        <View style={styles.replyingTo}>
          <Text style={styles.replyingText}>Replying to comment...</Text>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Ionicons name="close-circle" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor="#666"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSubmitComment}
          disabled={!newComment.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={newComment.trim() ? colors.primary : '#666'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
  },
  commentsList: {
    maxHeight: 400,
    marginBottom: 12,
  },
  commentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  commentText: {
    color: '#ddd',
    marginBottom: 8,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyText: {
    color: colors.primary,
    fontSize: 14,
    marginLeft: 4,
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 48,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(99, 102, 241, 0.3)',
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  replyContent: {
    flex: 1,
  },
  replyingTo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingText: {
    color: colors.primary,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    maxHeight: 100,
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});
