import { supabase } from '../utils/supabase';
import { SkillChallenge } from '../utils/supabase-types';

export class ChallengeService {
  /**
   * Get all challenges for a skill
   */
  static async getChallenges(skillId: string): Promise<SkillChallenge[]> {
    const { data, error } = await supabase
      .from('skill_challenges')
      .select('*')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a new challenge
   */
  static async createChallenge(data: {
    skill_id: string;
    challenge_title: string;
    challenge_description?: string;
    solution?: string;
    is_resolved?: boolean;
  }): Promise<SkillChallenge> {
    const { data: challenge, error } = await supabase
      .from('skill_challenges')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return challenge;
  }

  /**
   * Update a challenge
   */
  static async updateChallenge(
    challengeId: string,
    updates: Partial<{
      challenge_title: string;
      challenge_description: string;
      solution: string;
      is_resolved: boolean;
    }>
  ): Promise<void> {
    const updateData: any = { ...updates };

    if (updates.is_resolved !== undefined) {
      updateData.is_resolved = updates.is_resolved;
      if (updates.is_resolved) {
        updateData.resolved_at = new Date().toISOString();
      } else {
        updateData.resolved_at = null;
      }
    }

    const { error } = await supabase
      .from('skill_challenges')
      .update(updateData)
      .eq('id', challengeId);

    if (error) throw error;
  }

  /**
   * Delete a challenge
   */
  static async deleteChallenge(challengeId: string): Promise<void> {
    const { error } = await supabase
      .from('skill_challenges')
      .delete()
      .eq('id', challengeId);

    if (error) throw error;
  }

  /**
   * Mark challenge as resolved with solution
   */
  static async markAsResolved(challengeId: string, solution?: string): Promise<void> {
    const updateData: any = {
      is_resolved: true,
      resolved_at: new Date().toISOString(),
    };

    if (solution) {
      updateData.solution = solution;
    }

    const { error } = await supabase
      .from('skill_challenges')
      .update(updateData)
      .eq('id', challengeId);

    if (error) throw error;
  }

  /**
   * Mark challenge as unresolved
   */
  static async markAsUnresolved(challengeId: string): Promise<void> {
    const { error } = await supabase
      .from('skill_challenges')
      .update({
        is_resolved: false,
        resolved_at: null,
      })
      .eq('id', challengeId);

    if (error) throw error;
  }
}
