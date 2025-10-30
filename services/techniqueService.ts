import { supabase } from '../utils/supabase';
import { SkillTechnique } from '../utils/supabase-types';

export class TechniqueService {
  /**
   * Get all techniques for a skill
   */
  static async getTechniques(skillId: string): Promise<SkillTechnique[]> {
    const { data, error } = await supabase
      .from('skill_techniques')
      .select('*')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
//create techniqu
  /**
   * Create a new technique
   */
  static async createTechnique(data: {
    skill_id: string;
    technique_name: string;
    description?: string;
    practice_hours?: number;
    mastery_level?: number;
    notes?: string;
  }): Promise<SkillTechnique> {
    const { data: technique, error } = await supabase
      .from('skill_techniques')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return technique;
  }

  /**
   * Update a technique
   */
  static async updateTechnique(
    techniqueId: string,
    updates: Partial<{
      technique_name: string;
      description: string;
      practice_hours: number;
      mastery_level: number;
      notes: string;
    }>
  ): Promise<void> {
    const { error } = await supabase
      .from('skill_techniques')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', techniqueId);

    if (error) throw error;
  }

  /**
   * Delete a technique
   */
  static async deleteTechnique(techniqueId: string): Promise<void> {
    const { error } = await supabase
      .from('skill_techniques')
      .delete()
      .eq('id', techniqueId);

    if (error) throw error;
  }

  /**
   * Update mastery level
   */
  static async updateMasteryLevel(techniqueId: string, level: number): Promise<void> {
    if (level < 0 || level > 100) {
      throw new Error('Mastery level must be between 0 and 100');
    }

    const { error } = await supabase
      .from('skill_techniques')
      .update({ mastery_level: level, updated_at: new Date().toISOString() })
      .eq('id', techniqueId);

    if (error) throw error;
  }

  /**
   * Add practice hours
   */
  static async addPracticeHours(techniqueId: string, hours: number): Promise<void> {
    const { data: technique, error: fetchError } = await supabase
      .from('skill_techniques')
      .select('practice_hours')
      .eq('id', techniqueId)
      .single();

    if (fetchError) throw fetchError;

    const newHours = (technique.practice_hours || 0) + hours;

    const { error: updateError } = await supabase
      .from('skill_techniques')
      .update({ practice_hours: newHours, updated_at: new Date().toISOString() })
      .eq('id', techniqueId);

    if (updateError) throw updateError;
  }
}
