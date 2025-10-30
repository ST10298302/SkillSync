// Achievement Service
// Handles gamification, badges, and achievement tracking

import { supabase } from '../utils/supabase';
import {
  Achievement,
  AchievementCategory,
  UserAchievement
} from '../utils/supabase-types';

export class AchievementService {
  // ============================================
  // ACHIEVEMENT MANAGEMENT
  // ============================================
//code push
  /**
   * Get all available achievements
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('points', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get user's achievements
   */
  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement: achievement_id(*)')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement: achievement_id(*)')
      .eq('user_id', userId)
      .eq('is_unlocked', true)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get progress on all achievements for a user
   */
  static async getUserAchievementProgress(userId: string): Promise<UserAchievement[]> {
    // First ensure all achievements exist in user_achievements
    await this.initializeUserAchievements(userId);

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement: achievement_id(*)')
      .eq('user_id', userId)
      .order('is_unlocked', { ascending: false })
      .order('progress', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Initialize all achievements for a user
   */
  static async initializeUserAchievements(userId: string): Promise<void> {
    // Get all achievements
    const achievements = await this.getAllAchievements();
    const achievementIds = achievements.map((a) => a.id);

    // Get existing user achievements
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const existingIds = existing?.map((e) => e.achievement_id) || [];

    // Create missing achievements
    const missingAchievements = achievementIds.filter((id) => !existingIds.includes(id));

    if (missingAchievements.length > 0) {
      const newUserAchievements = missingAchievements.map((achievementId) => ({
        user_id: userId,
        achievement_id: achievementId,
        progress: 0,
        is_unlocked: false,
      }));

      await supabase.from('user_achievements').insert(newUserAchievements);
    }
  }

  /**
   * Update achievement progress
   */
  static async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number,
    autoUnlock: boolean = true
  ): Promise<void> {
    const { error } = await supabase
      .from('user_achievements')
      .update({ progress })
      .eq('user_id', userId)
      .eq('achievement_id', achievementId);

    if (error) throw error;

    // Check if should unlock
    if (autoUnlock) {
      await this.checkAndUnlockAchievement(userId, achievementId);
    }
  }

  /**
   * Check and unlock achievement if requirements met
   */
  static async checkAndUnlockAchievement(
    userId: string,
    achievementId: string
  ): Promise<boolean> {
    const { data: userAchievement } = await supabase
      .from('user_achievements')
      .select('*, achievement: achievement_id(*)')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (!userAchievement || userAchievement.is_unlocked) return false;

    // Check if progress meets requirements
    if (userAchievement.progress >= 100) {
      await this.unlockAchievement(userId, achievementId);
      return true;
    }

    return false;
  }

  /**
   * Manually unlock an achievement
   */
  static async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const { error } = await supabase
      .from('user_achievements')
      .update({
        is_unlocked: true,
        unlocked_at: new Date().toISOString(),
        progress: 100,
      })
      .eq('user_id', userId)
      .eq('achievement_id', achievementId);

    if (error) throw error;

    // Create notification
    await this.createAchievementNotification(userId, achievementId);
  }

  /**
   * Create notification for unlocked achievement
   */
  static async createAchievementNotification(userId: string, achievementId: string): Promise<void> {
    const { data: achievement } = await supabase
      .from('achievements')
      .select('name')
      .eq('id', achievementId)
      .single();

    if (!achievement) return;

    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `You unlocked: ${achievement.name}`,
      is_read: false,
    });
  }

  // ============================================
  // ACHIEVEMENT CHECKERS
  // ============================================

  /**
   * Check consistency achievements (streaks)
   */
  static async checkConsistencyAchievements(userId: string): Promise<void> {
    const { data: skills } = await supabase
      .from('skills')
      .select('streak')
      .eq('user_id', userId);

    const maxStreak = Math.max(...(skills?.map((s) => s.streak || 0) || [0]));

    // 7-day streak achievement
    if (maxStreak >= 7) {
      await this.updateProgressForAchievement(userId, AchievementCategory.CONSISTENCY, '7day', 100);
    }

    // 30-day streak achievement
    if (maxStreak >= 30) {
      await this.updateProgressForAchievement(userId, AchievementCategory.CONSISTENCY, '30day', 100);
    }

    // 100-day streak achievement
    if (maxStreak >= 100) {
      await this.updateProgressForAchievement(userId, AchievementCategory.CONSISTENCY, '100day', 100);
    }
  }

  /**
   * Check milestone achievements
   */
  static async checkMilestoneAchievements(userId: string): Promise<void> {
    // Count skills
    const { count: skillCount } = await supabase
      .from('skills')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 1st skill
    if (skillCount && skillCount >= 1) {
      await this.updateProgressForAchievement(userId, AchievementCategory.MILESTONE, 'first', 100);
    }

    // 10th skill
    if (skillCount && skillCount >= 10) {
      await this.updateProgressForAchievement(userId, AchievementCategory.MILESTONE, '10th', 100);
    }

    // 100 hours
    const { data: skills } = await supabase
      .from('skills')
      .select('total_hours')
      .eq('user_id', userId);

    const totalHours = skills?.reduce((sum, s) => sum + (s.total_hours || 0), 0) || 0;

    if (totalHours >= 100) {
      await this.updateProgressForAchievement(userId, AchievementCategory.MILESTONE, '100hours', 100);
    }
  }

  /**
   * Check mastery achievements (completed expert skills)
   */
  static async checkMasteryAchievements(userId: string): Promise<void> {
    const { count: expertSkills } = await supabase
      .from('skills')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('current_level', 'expert');

    if (expertSkills && expertSkills >= 1) {
      await this.updateProgressForAchievement(userId, AchievementCategory.MASTERY, 'expert', 100);
    }
  }

  /**
   * Check social achievements
   */
  static async checkSocialAchievements(userId: string): Promise<void> {
    // Check likes received
    const { data: skills } = await supabase
      .from('skills')
      .select('likes_count')
      .eq('user_id', userId);

    const totalLikes = skills?.reduce((sum, s) => sum + (s.likes_count || 0), 0) || 0;

    if (totalLikes >= 100) {
      await this.updateProgressForAchievement(userId, AchievementCategory.SOCIAL, 'likes', 100);
    }
  }

  /**
   * Check explorer achievements (different categories)
   */
  static async checkExplorerAchievements(userId: string): Promise<void> {
    const { data: skills } = await supabase
      .from('skills')
      .select('category_id')
      .eq('user_id', userId);

    const uniqueCategories = new Set(skills?.map((s) => s.category_id).filter(Boolean) || []);

    if (uniqueCategories.size >= 5) {
      await this.updateProgressForAchievement(userId, AchievementCategory.EXPLORER, '5categories', 100);
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Update progress for a specific achievement by category and key
   */
  static async updateProgressForAchievement(
    userId: string,
    category: AchievementCategory,
    key: string,
    progress: number
  ): Promise<void> {
    const { data: achievements } = await supabase
      .from('achievements')
      .select('id')
      .eq('category', category)
      .eq('requirements->>key', key)
      .limit(1);

    if (achievements && achievements.length > 0) {
      await this.updateAchievementProgress(userId, achievements[0].id, progress);
    }
  }

  /**
   * Run all achievement checks for a user
   */
  static async checkAllAchievements(userId: string): Promise<void> {
    await this.checkConsistencyAchievements(userId);
    await this.checkMilestoneAchievements(userId);
    await this.checkMasteryAchievements(userId);
    await this.checkSocialAchievements(userId);
    await this.checkExplorerAchievements(userId);
  }

  /**
   * Get user's achievement statistics
   */
  static async getUserAchievementStats(userId: string): Promise<{
    total_achievements: number;
    unlocked_achievements: number;
    progress_percentage: number;
    points_earned: number;
    recent_achievements: UserAchievement[];
  }> {
    const allAchievements = await this.getAllAchievements();
    const userAchievements = await this.getUserAchievements(userId);
    const unlocked = userAchievements.filter((ua) => ua.is_unlocked);

    const totalPoints = unlocked.reduce((sum, ua) => {
      const achievement = allAchievements.find((a) => a.id === ua.achievement_id);
      return sum + (achievement?.points || 0);
    }, 0);

    const recentAchievements = userAchievements
      .filter((ua) => ua.is_unlocked)
      .sort((a, b) => {
        const dateA = a.unlocked_at ? new Date(a.unlocked_at).getTime() : 0;
        const dateB = b.unlocked_at ? new Date(b.unlocked_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    return {
      total_achievements: allAchievements.length,
      unlocked_achievements: unlocked.length,
      progress_percentage: Math.round((unlocked.length / allAchievements.length) * 100),
      points_earned: totalPoints,
      recent_achievements: recentAchievements,
    };
  }
}
