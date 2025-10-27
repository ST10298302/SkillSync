// Analytics Service
// Handles learning pattern analysis, velocity tracking, and insights

import { supabase } from '../utils/supabase';

export interface LearningPattern {
  skill_id: string;
  skill_name: string;
  current_velocity: number; // Progress per day
  avg_velocity: number;
  consistency: number; // Percentage of days with activity
  plateau_detected: boolean;
  plateau_duration_days?: number;
  optimal_learning_time?: string;
  recommended_actions: string[];
}

export interface WeeklyActivity {
  week_start: string;
  total_entries: number;
  total_hours: number;
  skills_worked: number;
}

export interface SkillComparison {
  skill_id: string;
  skill_name: string;
  progress: number;
  hours_logged: number;
  velocity: number;
  rank: number;
}

export class AnalyticsService {
  // ============================================
  // VELOCITY TRACKING
  // ============================================

  /**
   * Calculate current velocity for a skill (progress per day)
   */
  static async calculateVelocity(skillId: string): Promise<number> {
    const { data: skill } = await supabase
      .from('skills')
      .select('progress, created_at, last_updated')
      .eq('id', skillId)
      .single();

    if (!skill) return 0;

    const createdAt = new Date(skill.created_at).getTime();
    const now = Date.now();
    const daysElapsed = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24));

    return skill.progress / daysElapsed;
  }

  /**
   * Calculate average velocity across all skills
   */
  static async calculateAverageVelocity(userId: string): Promise<number> {
    const { data: skills } = await supabase
      .from('skills')
      .select('progress, created_at')
      .eq('user_id', userId);

    if (!skills || skills.length === 0) return 0;

    let totalVelocity = 0;
    const now = Date.now();

    for (const skill of skills) {
      const createdAt = new Date(skill.created_at).getTime();
      const daysElapsed = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24));
      totalVelocity += skill.progress / daysElapsed;
    }

    return totalVelocity / skills.length;
  }

  // ============================================
  // CONSISTENCY ANALYSIS
  // ============================================

  /**
   * Calculate learning consistency (percentage of days with activity)
   */
  static async calculateConsistency(skillId: string): Promise<number> {
    const { data: entries } = await supabase
      .from('skill_entries')
      .select('created_at')
      .eq('skill_id', skillId);

    if (!entries || entries.length === 0) return 0;

    // Get date range
    const dates = entries.map((e) => new Date(e.created_at));
    const firstDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const lastDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const totalDays =
      Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const uniqueDays = new Set(dates.map((d) => d.toDateString())).size;

    return Math.round((uniqueDays / totalDays) * 100);
  }

  /**
   * Calculate overall consistency across all skills
   */
  static async calculateOverallConsistency(userId: string): Promise<number> {
    const { data: skills } = await supabase
      .from('skills')
      .select('id')
      .eq('user_id', userId);

    if (!skills || skills.length === 0) return 0;

    let totalConsistency = 0;

    for (const skill of skills) {
      totalConsistency += await this.calculateConsistency(skill.id);
    }

    return Math.round(totalConsistency / skills.length);
  }

  // ============================================
  // PLATEAU DETECTION
  // ============================================

  /**
   * Detect if a skill has reached a plateau
   */
  static async detectPlateau(skillId: string): Promise<{
    detected: boolean;
    duration_days?: number;
    last_activity?: string;
  }> {
    const { data: skill } = await supabase
      .from('skills')
      .select('last_updated, progress')
      .eq('id', skillId)
      .single();

    if (!skill || !skill.last_updated) {
      return { detected: false };
    }

    const lastUpdate = new Date(skill.last_updated).getTime();
    const now = Date.now();
    const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);

    // Consider it a plateau if no activity for 7+ days and not complete
    const isPlateau = daysSinceUpdate >= 7 && skill.progress < 100;

    return {
      detected: isPlateau,
      duration_days: isPlateau ? Math.floor(daysSinceUpdate) : undefined,
      last_activity: skill.last_updated,
    };
  }

  /**
   * Detect plateaus across all skills
   */
  static async detectAllPlateaus(userId: string): Promise<string[]> {
    const { data: skills } = await supabase
      .from('skills')
      .select('id')
      .eq('user_id', userId);

    if (!skills) return [];

    const plateauedSkills: string[] = [];

    for (const skill of skills) {
      const plateauInfo = await this.detectPlateau(skill.id);
      if (plateauInfo.detected) {
        plateauedSkills.push(skill.id);
      }
    }

    return plateauedSkills;
  }

  // ============================================
  // LEARNING PATTERNS
  // ============================================

  /**
   * Analyze learning patterns for all skills
   */
  static async analyzeLearningPatterns(userId: string): Promise<LearningPattern[]> {
    const { data: skills } = await supabase
      .from('skills')
      .select('id, name, progress')
      .eq('user_id', userId);

    if (!skills) return [];

    const patterns = await Promise.all(
      skills.map(async (skill) => {
        const velocity = await this.calculateVelocity(skill.id);
        const consistency = await this.calculateConsistency(skill.id);
        const plateau = await this.detectPlateau(skill.id);

        // Calculate average velocity (simplified - could use historical data)
        const avgVelocity = velocity;

        // Determine optimal learning time (if we had time-of-day data)
        const optimal_learning_time = 'Morning'; // Placeholder

        // Generate recommendations
        const recommended_actions: string[] = [];
        if (plateau.detected) {
          recommended_actions.push('Try a different approach or break down into smaller milestones');
        }
        if (consistency < 50) {
          recommended_actions.push('Increase consistency by practicing more regularly');
        }
        if (velocity < 1) {
          recommended_actions.push('Increase learning intensity or time investment');
        }
        if (skill.progress > 80) {
          recommended_actions.push('Focus on mastery and completing remaining milestones');
        }

        return {
          skill_id: skill.id,
          skill_name: skill.name,
          current_velocity: Math.round(velocity * 100) / 100,
          avg_velocity: Math.round(avgVelocity * 100) / 100,
          consistency,
          plateau_detected: plateau.detected || false,
          plateau_duration_days: plateau.duration_days,
          optimal_learning_time,
          recommended_actions,
        };
      })
    );

    return patterns;
  }

  // ============================================
  // WEEKLY ACTIVITY
  // ============================================

  /**
   * Get weekly activity breakdown
   */
  static async getWeeklyActivity(userId: string, weeks: number = 12): Promise<WeeklyActivity[]> {
    const activities: WeeklyActivity[] = [];

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Get entries for this week
      const { data: entries } = await supabase
        .from('skill_entries')
        .select('skill_id, hours, created_at')
        .eq('skill_id', skills[0]?.id || '') // Would need to get all skill IDs
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString());

      const skillIds = new Set(entries?.map((e) => e.skill_id) || []);
      const totalHours = entries?.reduce((sum, e) => sum + (e.hours || 0), 0) || 0;

      activities.push({
        week_start: weekStart.toISOString().split('T')[0],
        total_entries: entries?.length || 0,
        total_hours: Math.round(totalHours * 100) / 100,
        skills_worked: skillIds.size,
      });
    }

    return activities.reverse();
  }

  // ============================================
  // SKILL COMPARISON
  // ============================================

  /**
   * Compare skills by progress and velocity
   */
  static async compareSkills(userId: string): Promise<SkillComparison[]> {
    const { data: skills } = await supabase
      .from('skills')
      .select('id, name, progress, total_hours')
      .eq('user_id', userId);

    if (!skills) return [];

    const comparisons = await Promise.all(
      skills.map(async (skill) => {
        const velocity = await this.calculateVelocity(skill.id);

        return {
          skill_id: skill.id,
          skill_name: skill.name,
          progress: skill.progress,
          hours_logged: skill.total_hours || 0,
          velocity: Math.round(velocity * 100) / 100,
          rank: 0, // Will be set after sorting
        };
      })
    );

    // Sort by velocity and assign ranks
    comparisons.sort((a, b) => b.velocity - a.velocity);
    comparisons.forEach((comp, index) => {
      comp.rank = index + 1;
    });

    return comparisons;
  }

  // ============================================
  // PERSONALIZED INSIGHTS
  // ============================================

  /**
   * Get personalized insights for the user
   */
  static async getPersonalizedInsights(userId: string): Promise<{
    insights: string[];
    recommendations: string[];
  }> {
    const velocity = await this.calculateAverageVelocity(userId);
    const consistency = await this.calculateOverallConsistency(userId);
    const plateauedSkills = await this.detectAllPlateaus(userId);
    const patterns = await this.analyzeLearningPatterns(userId);

    const insights: string[] = [];
    const recommendations: string[] = [];

    // Generate insights
    if (velocity > 2) {
      insights.push('You are making excellent progress! Keep up the momentum.');
    } else if (velocity < 0.5) {
      insights.push('Your learning pace could be increased. Consider practicing more frequently.');
      recommendations.push('Try to practice at least 3 times per week');
    }

    if (consistency > 70) {
      insights.push(`Great consistency! You're active ${consistency}% of days.`);
    } else {
      insights.push(`Your consistency is ${consistency}%. Regular practice leads to better results.`);
      recommendations.push('Set a daily reminder to practice your skills');
    }

    if (plateauedSkills.length > 0) {
      insights.push(`You have ${plateauedSkills.length} skill(s) that have been inactive for 7+ days.`);
      recommendations.push('Review and update your inactive skills to regain momentum');
    }

    // Find fastest and slowest skills
    const comparisons = await this.compareSkills(userId);
    if (comparisons.length >= 2) {
      const fastest = comparisons[0];
      const slowest = comparisons[comparisons.length - 1];
      insights.push(
        `Your fastest progress is on "${fastest.skill_name}" (${fastest.velocity}%/day). Apply similar techniques to "${slowest.skill_name}".`
      );
    }

    // Check for completion milestones
    const completedSkills = comparisons.filter((s) => s.progress >= 100);
    if (completedSkills.length > 0) {
      insights.push(`Congratulations! You've completed ${completedSkills.length} skill(s).`);
    }

    return { insights, recommendations };
  }

  // ============================================
  // PROGRESS TREND
  // ============================================

  /**
   * Calculate progress trend over time
   */
  static async getProgressTrend(skillId: string, days: number = 30): Promise<{
    date: string;
    progress: number;
  }[]> {
    const { data: updates } = await supabase
      .from('progress_updates')
      .select('progress, created_at')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: true });

    if (!updates) return [];

    return updates.map((u) => ({
      date: u.created_at.split('T')[0],
      progress: u.progress,
    }));
  }
}
