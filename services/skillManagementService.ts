// Advanced Skill Management Service
// Handles skill leveling, milestones, dependencies, and learning paths

import { supabase } from '../utils/supabase';
import {
    CreateMilestoneRequest,
    CreateResourceRequest,
    Skill,
    SkillDependency,
    SkillInsight,
    SkillLevel,
    SkillLevelType,
    SkillMilestone,
    SkillProgress,
    SkillResource,
    SkillVisibility
} from '../utils/supabase-types';

export class SkillManagementService {
  // ============================================
  // SKILL CRUD OPERATIONS
  // ============================================

  /**
   * Create a new skill
   */
  static async createSkill(skillData: {
    name: string;
    description?: string;
    visibility?: SkillVisibility;
    estimated_hours?: number;
    category_id?: string;
  }): Promise<Skill> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('skills')
      .insert({
        name: skillData.name,
        description: skillData.description,
        user_id: user.id,
        progress: 0,
        visibility: skillData.visibility || SkillVisibility.PRIVATE,
        estimated_hours: skillData.estimated_hours,
        category_id: skillData.category_id,
        total_hours: 0,
        streak: 0,
        current_level: 'beginner' as any,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a skill
   */
  static async updateSkill(skillId: string, updates: {
    name?: string;
    description?: string;
    visibility?: SkillVisibility;
    estimated_hours?: number;
    category_id?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('skills')
      .update(updates)
      .eq('id', skillId);

    if (error) throw error;
  }

  /**
   * Delete a skill
   */
  static async deleteSkill(skillId: string): Promise<void> {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', skillId);

    if (error) throw error;
  }

  // ============================================
  // SKILL LEVEL SYSTEM
  // ============================================

  /**
   * Get or create skill levels for a skill
   */
  static async getSkillLevels(skillId: string): Promise<SkillLevel[]> {
    const { data, error } = await supabase
      .from('skill_levels')
      .select('*')
      .eq('skill_id', skillId)
      .order('min_progress', { ascending: true });

    if (error) throw error;

    // If no levels exist, create default levels
    if (!data || data.length === 0) {
      return await this.createDefaultSkillLevels(skillId);
    }

    return data;
  }

  /**
   * Create default skill levels for a skill
   */
  static async createDefaultSkillLevels(skillId: string): Promise<SkillLevel[]> {
    const defaultLevels = [
      { name: 'Beginner', type: SkillLevelType.BEGINNER, min: 0, max: 20, hours: 0 },
      { name: 'Novice', type: SkillLevelType.NOVICE, min: 20, max: 40, hours: 5 },
      { name: 'Intermediate', type: SkillLevelType.INTERMEDIATE, min: 40, max: 70, hours: 20 },
      { name: 'Advanced', type: SkillLevelType.ADVANCED, min: 70, max: 90, hours: 50 },
      { name: 'Expert', type: SkillLevelType.EXPERT, min: 90, max: 100, hours: 100 },
    ];

    const levels = [];

    for (const level of defaultLevels) {
      const { data, error } = await supabase
        .from('skill_levels')
        .insert({
          skill_id: skillId,
          level_type: level.type,
          name: level.name,
          min_progress: level.min,
          max_progress: level.max,
          required_hours: level.hours,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) levels.push(data);
    }

    return levels;
  }

  /**
   * Calculate current skill level based on progress and hours
   */
  static async calculateSkillLevel(skillId: string): Promise<SkillLevelType> {
    const { data: skill } = await supabase
      .from('skills')
      .select('progress, total_hours')
      .eq('id', skillId)
      .single();

    if (!skill) throw new Error('Skill not found');

    const levels = await this.getSkillLevels(skillId);

    // Find the appropriate level
    for (const level of levels.reverse()) {
      if (skill.progress >= level.min_progress) {
        return level.level_type;
      }
    }

    return SkillLevelType.BEGINNER;
  }

  /**
   * Update skill's current level
   */
  static async updateSkillLevel(skillId: string): Promise<void> {
    const currentLevel = await this.calculateSkillLevel(skillId);

    const { error } = await supabase
      .from('skills')
      .update({ current_level: currentLevel })
      .eq('id', skillId);

    if (error) throw error;
  }

  /**
   * Get level-up suggestions based on current progress
   */
  static async getLevelUpSuggestions(skillId: string): Promise<{
    next_level: SkillLevel | null;
    hours_needed: number;
    progress_needed: number;
  }> {
    const levels = await this.getSkillLevels(skillId);
    const { data: skill } = await supabase
      .from('skills')
      .select('progress, total_hours')
      .eq('id', skillId)
      .single();

    if (!skill) throw new Error('Skill not found');

    // Find next level
    const currentLevelIndex = levels.findIndex(
      l => skill.progress >= l.min_progress && skill.progress < l.max_progress
    );

    if (currentLevelIndex === -1 || currentLevelIndex === levels.length - 1) {
      return { next_level: null, hours_needed: 0, progress_needed: 0 };
    }

    const nextLevel = levels[currentLevelIndex + 1];

    return {
      next_level: nextLevel,
      hours_needed: Math.max(0, nextLevel.required_hours - skill.total_hours),
      progress_needed: nextLevel.min_progress - skill.progress,
    };
  }

  // ============================================
  // MILESTONE MANAGEMENT
  // ============================================

  /**
   * Get all milestones for a skill
   */
  static async getMilestones(skillId: string): Promise<SkillMilestone[]> {
    const { data, error } = await supabase
      .from('skill_milestones')
      .select('*')
      .eq('skill_id', skillId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a new milestone
   */
  static async createMilestone(request: CreateMilestoneRequest): Promise<SkillMilestone> {
    const { data, error } = await supabase
      .from('skill_milestones')
      .insert({
        skill_id: request.skill_id,
        title: request.title,
        description: request.description,
        order_index: request.order_index,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update milestone completion status
   */
  static async completeMilestone(milestoneId: string): Promise<void> {
    const { error } = await supabase
      .from('skill_milestones')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        completed_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', milestoneId);

    if (error) throw error;

    // Update skill progress based on completed milestones
    await this.updateProgressFromMilestones(
      (await supabase.from('skill_milestones').select('skill_id').eq('id', milestoneId).single()).data?.skill_id
    );
  }

  /**
   * Revert milestone completion
   */
  static async revertMilestone(milestoneId: string): Promise<void> {
    const { error } = await supabase
      .from('skill_milestones')
      .update({
        is_completed: false,
        completed_at: null,
        completed_by: null,
      })
      .eq('id', milestoneId);

    if (error) throw error;
  }

  /**
   * Delete a milestone
   */
  static async deleteMilestone(milestoneId: string): Promise<void> {
    const { error } = await supabase
      .from('skill_milestones')
      .delete()
      .eq('id', milestoneId);

    if (error) throw error;
  }

  /**
   * Update skill progress based on milestone completion
   */
  static async updateProgressFromMilestones(skillId?: string): Promise<void> {
    if (!skillId) return;

    const milestones = await this.getMilestones(skillId);
    const completedCount = milestones.filter(m => m.is_completed).length;
    const totalCount = milestones.length;

    if (totalCount === 0) return;

    const newProgress = Math.round((completedCount / totalCount) * 100);

    await supabase
      .from('skills')
      .update({ progress: newProgress })
      .eq('id', skillId);
  }

  // ============================================
  // SKILL DEPENDENCIES
  // ============================================

  /**
   * Get all dependencies for a skill
   */
  static async getDependencies(skillId: string): Promise<SkillDependency[]> {
    const { data, error } = await supabase
      .from('skill_dependencies')
      .select('*, prerequisite_skill:prerequisite_skill_id(*)')
      .eq('skill_id', skillId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Add a dependency to a skill
   */
  static async addDependency(
    skillId: string,
    prerequisiteSkillId: string,
    isRequired: boolean = true
  ): Promise<void> {
    const { error } = await supabase.from('skill_dependencies').insert({
      skill_id: skillId,
      prerequisite_skill_id: prerequisiteSkillId,
      is_required: isRequired,
    });

    if (error) throw error;
  }

  /**
   * Remove a dependency
   */
  static async removeDependency(skillId: string, prerequisiteSkillId: string): Promise<void> {
    const { error } = await supabase
      .from('skill_dependencies')
      .delete()
      .eq('skill_id', skillId)
      .eq('prerequisite_skill_id', prerequisiteSkillId);

    if (error) throw error;
  }

  /**
   * Check if all required prerequisites are met
   */
  static async arePrerequisitesMet(skillId: string): Promise<boolean> {
    const dependencies = await this.getDependencies(skillId);
    const requiredDeps = dependencies.filter(d => d.is_required);

    if (requiredDeps.length === 0) return true;

    // Check each required prerequisite
    for (const dep of requiredDeps) {
      const { data: prerequisiteSkill } = await supabase
        .from('skills')
        .select('progress')
        .eq('id', dep.prerequisite_skill_id)
        .single();

      // Consider prerequisites met if they are at least 80% complete
      if (!prerequisiteSkill || prerequisiteSkill.progress < 80) {
        return false;
      }
    }

    return true;
  }

  // ============================================
  // RESOURCE MANAGEMENT
  // ============================================

  /**
   * Get all resources for a skill
   */
  static async getResources(skillId: string): Promise<SkillResource[]> {
    const { data, error } = await supabase
      .from('skill_resources')
      .select('*')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Add a resource to a skill
   */
  static async addResource(request: CreateResourceRequest): Promise<SkillResource> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('skill_resources')
      .insert({
        skill_id: request.skill_id,
        title: request.title,
        description: request.description,
        resource_type: request.resource_type,
        url: request.url,
        file_url: request.file_url,
        added_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a resource
   */
  static async deleteResource(resourceId: string): Promise<void> {
    const { error } = await supabase
      .from('skill_resources')
      .delete()
      .eq('id', resourceId);

    if (error) throw error;
  }

  // ============================================
  // PROGRESS AND INSIGHTS
  // ============================================

  /**
   * Get comprehensive progress information for a skill
   */
  static async getSkillProgress(skillId: string): Promise<SkillProgress> {
    const { data: skill } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (!skill) throw new Error('Skill not found');

    const milestones = await this.getMilestones(skillId);
    const completedMilestones = milestones.filter(m => m.is_completed).length;

    const levels = await this.getSkillLevels(skillId);
    const currentLevel = levels.find(
      l => skill.progress >= l.min_progress && skill.progress < l.max_progress
    );

    return {
      skill_id: skillId,
      progress: skill.progress,
      level: currentLevel?.level_type || SkillLevelType.BEGINNER,
      milestones_completed: completedMilestones,
      milestones_total: milestones.length,
      hours_logged: skill.total_hours || 0,
      estimated_hours: skill.estimated_hours || 0,
      completion_percentage: skill.progress,
    };
  }

  /**
   * Get insights for a skill
   */
  static async getSkillInsights(skillId: string): Promise<SkillInsight> {
    const { data: skill } = await supabase
      .from('skills')
      .select('progress, total_hours, created_at, last_updated')
      .eq('id', skillId)
      .single();

    if (!skill) throw new Error('Skill not found');

    // Calculate velocity (progress per day)
    const createdAt = new Date(skill.created_at).getTime();
    const daysActive = Math.max(1, (Date.now() - createdAt) / (1000 * 60 * 60 * 24));
    const velocity = skill.progress / daysActive;

    // Get entries to calculate consistency
    const { data: entries } = await supabase
      .from('skill_entries')
      .select('created_at')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false })
      .limit(30);

    const daysWithActivity = new Set(
      entries?.map(e => new Date(e.created_at).toDateString()) || []
    ).size;

    const consistency = daysWithActivity / daysActive;

    // Check for plateau (no progress in last 7 days)
    const lastUpdate = skill.last_updated ? new Date(skill.last_updated) : null;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const plateau_detected = lastUpdate ? lastUpdate < sevenDaysAgo : false;

    // Get next milestone
    const milestones = await this.getMilestones(skillId);
    const nextMilestone = milestones.find(m => !m.is_completed);

    return {
      skill_id: skillId,
      velocity,
      consistency,
      plateau_detected,
      optimal_learning_time: undefined, // Could be calculated from entry timestamps
      next_milestone: nextMilestone,
    };
  }

  /**
   * Calculate estimated time to completion
   */
  static async calculateEstimatedCompletion(skillId: string): Promise<number | null> {
    const insights = await this.getSkillInsights(skillId);
    const { data: skill } = await supabase
      .from('skills')
      .select('progress, estimated_hours, total_hours')
      .eq('id', skillId)
      .single();

    if (!skill) return null;

    // If velocity is too low, use estimated hours instead
    if (insights.velocity < 1) {
      const remainingHours = (skill.estimated_hours || 0) - (skill.total_hours || 0);
      return remainingHours;
    }

    // Calculate days to completion based on velocity
    const remainingProgress = 100 - skill.progress;
    const daysToComplete = remainingProgress / insights.velocity;

    return daysToComplete;
  }
}
