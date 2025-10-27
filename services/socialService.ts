// Social Service
// Handles likes, comments, reactions, follows, and notifications

import { supabase } from '../utils/supabase';
import {
    AddReactionRequest,
    CreateCommentRequest,
    Notification,
    NotificationType,
    ReactionType,
    SkillComment,
    SkillReaction,
    UserFollow
} from '../utils/supabase-types';

export class SocialService {
  // ============================================
  // COMMENTS
  // ============================================

  /**
   * Get all comments for a skill
   */
  static async getSkillComments(skillId: string): Promise<SkillComment[]> {
    const { data, error } = await supabase
      .from('skill_comments')
      .select('*')
      .eq('skill_id', skillId)
      .eq('parent_comment_id', null) // Only top-level comments
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const replies = await this.getCommentReplies(comment.id);
        return { ...comment, replies };
      })
    );

    return commentsWithReplies || [];
  }

  /**
   * Get replies to a comment
   */
  static async getCommentReplies(commentId: string): Promise<SkillComment[]> {
    const { data, error } = await supabase
      .from('skill_comments')
      .select('*')
      .eq('parent_comment_id', commentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a comment
   */
  static async createComment(request: CreateCommentRequest): Promise<SkillComment> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('skill_comments')
      .insert({
        skill_id: request.skill_id,
        user_id: user.id,
        content: request.content,
        parent_comment_id: request.parent_comment_id,
        mentions: request.mentions || [],
      })
      .select('*')
      .single();

    if (error) throw error;

    // Create notifications for mentions
    if (request.mentions && request.mentions.length > 0) {
      await this.createMentionNotifications(
        user.id,
        request.skill_id,
        request.mentions
      );
    }

    // Create notification for skill owner if comment is on their skill
    const { data: skill } = await supabase
      .from('skills')
      .select('user_id')
      .eq('id', request.skill_id)
      .single();

    if (skill && skill.user_id !== user.id) {
      await this.createNotification(skill.user_id, {
        type: NotificationType.COMMENT,
        title: 'New comment on your skill',
        message: `${user.email} commented on your skill`,
        related_skill_id: request.skill_id,
        related_user_id: user.id,
      });
    }

    return data;
  }

  /**
   * Update a comment
   */
  static async updateComment(commentId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('skill_comments')
      .update({
        content,
        edited: true,
        edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId);

    if (error) throw error;
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string): Promise<void> {
    // First delete all replies
    await supabase
      .from('skill_comments')
      .delete()
      .eq('parent_comment_id', commentId);

    // Then delete the comment itself
    const { error } = await supabase
      .from('skill_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  }

  // ============================================
  // REACTIONS
  // ============================================

  /**
   * Add a reaction to a skill
   */
  static async addSkillReaction(
    request: Omit<AddReactionRequest, 'comment_id'>
  ): Promise<SkillReaction> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    if (!request.skill_id) throw new Error('skill_id is required');

    // Check if user already reacted
    const { data: existing } = await supabase
      .from('skill_reactions')
      .select('id')
      .eq('skill_id', request.skill_id)
      .eq('user_id', user.id)
      .single();

    let reaction;

    if (existing) {
      // Update existing reaction
      const { data, error } = await supabase
        .from('skill_reactions')
        .update({ reaction_type: request.reaction_type })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      reaction = data;
    } else {
      // Create new reaction
      const { data, error } = await supabase
        .from('skill_reactions')
        .insert({
          skill_id: request.skill_id,
          user_id: user.id,
          reaction_type: request.reaction_type,
        })
        .select()
        .single();

      if (error) throw error;
      reaction = data;

      // Create notification for skill owner
      const { data: skill } = await supabase
        .from('skills')
        .select('user_id')
        .eq('id', request.skill_id)
        .single();

      if (skill && skill.user_id !== user.id) {
        await this.createNotification(skill.user_id, {
          type: NotificationType.LIKE,
          title: 'Someone reacted to your skill',
          message: `${user.email} reacted to your skill`,
          related_skill_id: request.skill_id,
          related_user_id: user.id,
        });
      }
    }

    return reaction;
  }

  /**
   * Remove a reaction from a skill
   */
  static async removeSkillReaction(skillId: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('skill_reactions')
      .delete()
      .eq('skill_id', skillId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  /**
   * Get all reactions for a skill
   */
  static async getSkillReactions(skillId: string): Promise<SkillReaction[]> {
    const { data, error } = await supabase
      .from('skill_reactions')
      .select('*')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Add a reaction to a comment
   */
  static async addCommentReaction(commentId: string, reactionType: ReactionType): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Check if user already reacted
    const { data: existing } = await supabase
      .from('comment_reactions')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update existing reaction
      const { error } = await supabase
        .from('comment_reactions')
        .update({ reaction_type: reactionType })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Create new reaction
      const { error } = await supabase.from('comment_reactions').insert({
        comment_id: commentId,
        user_id: user.id,
        reaction_type: reactionType,
      });

      if (error) throw error;
    }
  }

  /**
   * Remove a reaction from a comment
   */
  static async removeCommentReaction(commentId: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // ============================================
  // FOLLOWS
  // ============================================

  /**
   * Follow a user
   */
  static async followUser(followingId: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    if (user.id === followingId) {
      throw new Error('Cannot follow yourself');
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single();

    if (existing) {
      throw new Error('Already following this user');
    }

    const { error } = await supabase.from('user_follows').insert({
      follower_id: user.id,
      following_id: followingId,
    });

    if (error) throw error;

    // Create notification for followed user
    await this.createNotification(followingId, {
      type: NotificationType.SYSTEM,
      title: 'New follower',
      message: `${user.email} started following you`,
      related_user_id: user.id,
    });
  }

  /**
   * Unfollow a user
   */
  static async unfollowUser(followingId: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId);

    if (error) throw error;
  }

  /**
   * Check if user is following another user
   */
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    return !!data;
  }

  /**
   * Get followers for a user
   */
  static async getFollowers(userId: string): Promise<UserFollow[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('*, follower: follower_id(*)')
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get users a user is following
   */
  static async getFollowing(userId: string): Promise<UserFollow[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('*, following: following_id(*)')
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  /**
   * Create a notification
   */
  static async createNotification(
    userId: string,
    notification: {
      type: NotificationType;
      title: string;
      message?: string;
      related_skill_id?: string;
      related_user_id?: string;
    }
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        related_skill_id: notification.related_skill_id,
        related_user_id: notification.related_user_id,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get notifications for a user
   */
  static async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Create notifications for mentioned users
   */
  static async createMentionNotifications(
    fromUserId: string,
    skillId: string,
    mentionUserIds: string[]
  ): Promise<void> {
    const { data: fromUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', fromUserId)
      .single();

    const notifications = mentionUserIds.map((mentionedUserId) => ({
      user_id: mentionedUserId,
      type: NotificationType.MENTION,
      title: 'You were mentioned',
      message: `${fromUser?.email || 'Someone'} mentioned you in a comment`,
      related_skill_id: skillId,
      related_user_id: fromUserId,
      is_read: false,
    }));

    await supabase.from('notifications').insert(notifications);
  }

  /**
   * Get user's activity feed (from users they follow)
   */
  static async getActivityFeed(userId: string, limit: number = 20): Promise<Notification[]> {
    // Get users that the current user follows
    const following = await this.getFollowing(userId);
    const followingIds = following.map((f) => f.following_id);

    if (followingIds.length === 0) return [];

    // Get recent activity from followed users
    const { data, error } = await supabase
      .from('notifications')
      .select('*, related_skill: related_skill_id(*), related_user: related_user_id(*)')
      .in('user_id', followingIds)
      .in('type', [
        NotificationType.COMMENT,
        NotificationType.LIKE,
        NotificationType.ACHIEVEMENT,
      ])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}
