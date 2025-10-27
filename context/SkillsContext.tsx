import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { SupabaseService } from '../services/supabaseService';
import { shouldProgressLevel } from '../utils/skillProgression';
import { calculateSkillStreak } from '../utils/streakCalculator';
import { SkillEntry } from '../utils/supabase';
import { useAuth } from './AuthContext';

export interface DiaryEntry {
  id: string;
  text: string;
  date: string;
  hours?: number;
}

export interface ProgressUpdate {
  id: string;
  skill_id: string;
  progress: number;
  created_at: string;
  notes?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  startDate: string;
  progress: number;
  progressUpdates: ProgressUpdate[];
  entries: DiaryEntry[];
  createdAt: string;
  lastUpdated?: string;
  streak?: number;
  totalHours?: number;
  likes_count?: number;
  comments_count?: number;
  current_level?: string;
  user_id?: string; // Add user_id to track skill ownership
  completed_levels?: string[]; // Track which levels have been completed
}

interface SkillsContextProps {
  skills: Skill[];
  addSkill: (skill: Omit<Skill, 'entries' | 'progress' | 'progressUpdates' | 'createdAt'>) => Promise<void>;
  updateSkill: (id: string, updates: { name?: string; description?: string }) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  addEntry: (skillId: string, text: string, hours?: number) => Promise<void>;
  updateEntry: (skillId: string, entryId: string, text: string, hours?: number) => Promise<void>;
  deleteEntry: (skillId: string, entryId: string) => Promise<void>;
  addProgressUpdate: (skillId: string, value: number) => Promise<void>;
  refreshSkills: () => Promise<void>;
}

const SkillsContext = createContext<SkillsContextProps | undefined>(undefined);

export const SkillsProvider = ({ children }: { children: ReactNode }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const { user } = useAuth();

  const loadSkills = useCallback(async () => {
    if (!user || typeof window === 'undefined') return;
    
    try {
      const supabaseSkills = await SupabaseService.getSkills(user.id);
      const convertedSkills: Skill[] = await Promise.all(
        supabaseSkills.map(async (supabaseSkill) => {
          // Load progress updates for this skill
          const progressUpdates = await SupabaseService.getProgressUpdates(supabaseSkill.id);
          
          // Calculate streak for this skill
          const entries = (supabaseSkill.skill_entries || []).map((entry: SkillEntry) => ({
            id: entry.id,
            text: entry.content,
            date: entry.created_at,
            hours: entry.hours,
          }));
          
          const streak = calculateSkillStreak(entries, progressUpdates);
          
          // Calculate the most recent activity timestamp
          const allActivities = [
            ...entries.map((entry: DiaryEntry) => new Date(entry.date)),
            ...progressUpdates.map((update: ProgressUpdate) => new Date(update.created_at))
          ];
          
          let lastUpdated = supabaseSkill.last_updated;
          if (allActivities.length > 0) {
            const mostRecentActivity = new Date(Math.max(...allActivities.map(date => date.getTime())));
            lastUpdated = mostRecentActivity.toISOString();
          }
          
          return {
            id: supabaseSkill.id,
            name: supabaseSkill.name,
            description: supabaseSkill.description || '',
            startDate: supabaseSkill.created_at,
            progress: supabaseSkill.progress,
            progressUpdates: progressUpdates,
            entries: entries,
            createdAt: supabaseSkill.created_at,
            lastUpdated: lastUpdated,
            streak: supabaseSkill.streak || 0,
            totalHours: supabaseSkill.total_hours || 0,
            likes_count: supabaseSkill.likes_count || 0,
            comments_count: supabaseSkill.comments_count || 0,
            current_level: supabaseSkill.current_level || 'beginner',
            user_id: supabaseSkill.user_id, // Include user_id for ownership checks
            completed_levels: (supabaseSkill as any).completed_levels || [], // Track completed levels
          };
        })
      );
      setSkills(convertedSkills);
    } catch (e) {
      console.error('Failed to load skills', e);
    }
  }, [user]);

  // Load skills from Supabase on mount and when user changes
  useEffect(() => {
    // Only load skills in browser environment
    if (typeof window !== 'undefined' && user) {
      loadSkills();
    } else if (typeof window !== 'undefined') {
      setSkills([]);
    }
  }, [user, loadSkills]);

  const refreshSkills = async () => {
    if (typeof window !== 'undefined') {
      await loadSkills();
    }
  };

  // Add a new skill with defaults
  const addSkill = async (
    skill: Omit<Skill, 'entries' | 'progress' | 'progressUpdates' | 'createdAt'>
  ) => {
    if (!user || typeof window === 'undefined') return;

    try {
      const supabaseSkill = await SupabaseService.createSkill({
        name: skill.name,
        description: skill.description,
        progress: 0,
        user_id: user.id,
        total_hours: 0,
        streak: 0,
      });

      const newSkill: Skill = {
        id: supabaseSkill.id,
        name: supabaseSkill.name,
        description: supabaseSkill.description || '',
        startDate: supabaseSkill.created_at,
        progress: supabaseSkill.progress,
        progressUpdates: [],
        entries: [],
        createdAt: supabaseSkill.created_at,
        lastUpdated: supabaseSkill.last_updated,
        streak: supabaseSkill.streak || 0,
        totalHours: supabaseSkill.total_hours || 0,
        user_id: user.id, // Include user_id for ownership checks
      };
      setSkills(prev => [...prev, newSkill]);
    } catch (e) {
      console.error('Failed to add skill', e);
      throw e;
    }
  };

  // Delete a skill by id
  const updateSkill = async (id: string, updates: { name?: string; description?: string }) => {
    if (!user) return;
    
    try {
      await SupabaseService.updateSkill(id, updates);
      setSkills(prevSkills => 
        prevSkills.map(skill => 
          skill.id === id 
            ? { ...skill, ...updates }
            : skill
        )
      );
    } catch (e) {
      console.error('Failed to update skill', e);
      throw e;
    }
  };

  const deleteSkill = async (id: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      await SupabaseService.deleteSkill(id);
      setSkills(prev => prev.filter(skill => skill.id !== id));
    } catch (e) {
      console.error('Failed to delete skill', e);
      throw e;
    }
  };

  // Add a diary entry to a skill
  const addEntry = async (skillId: string, text: string, hours: number = 0) => {
    if (!user || typeof window === 'undefined') return;

    try {
      const entry = await SupabaseService.createSkillEntry({
        skill_id: skillId,
        content: text,
        hours: hours,
      });

      const diaryEntry: DiaryEntry = {
        id: entry.id,
        text: entry.content,
        date: entry.created_at,
        hours: entry.hours,
      };

      // Get the current skill to calculate new totals
      const currentSkill = skills.find(s => s.id === skillId);
      if (!currentSkill) return;

      // Calculate new total hours
      const newTotalHours = (currentSkill.entries?.reduce((sum, e) => sum + (e.hours || 0), 0) || 0) + hours;
      
      // Calculate new streak
      const newEntries = [...currentSkill.entries, diaryEntry];
      const newStreak = calculateSkillStreak(newEntries, currentSkill.progressUpdates);

      // Update the skill in the database with new totals
      await SupabaseService.updateSkill(skillId, {
        total_hours: newTotalHours,
        streak: newStreak,
        last_updated: entry.created_at,
      });

      setSkills(prev =>
        prev.map(skill => {
          if (skill.id !== skillId) return skill;
          
          return {
            ...skill,
            entries: newEntries,
            streak: newStreak,
            lastUpdated: entry.created_at,
            totalHours: newTotalHours,
          };
        })
      );
    } catch (e) {
      console.error('Failed to add entry', e);
      throw e;
    }
  };

  // Update a diary entry
  const updateEntry = async (skillId: string, entryId: string, text: string, hours: number = 0) => {
    if (!user || typeof window === 'undefined') return;

    try {
      await SupabaseService.updateSkillEntry(entryId, {
        content: text,
        hours: hours,
      });

      // Get the current skill to calculate new totals
      const currentSkill = skills.find(s => s.id === skillId);
      if (!currentSkill) return;

      // Update the entry in the local state
      const updatedEntries = currentSkill.entries.map(entry =>
        entry.id === entryId
          ? { ...entry, text, hours }
          : entry
      );

      // Calculate new total hours
      const newTotalHours = updatedEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
      
      // Calculate new streak
      const newStreak = calculateSkillStreak(updatedEntries, currentSkill.progressUpdates);

      // Update the skill in the database with new totals
      await SupabaseService.updateSkill(skillId, {
        total_hours: newTotalHours,
        streak: newStreak,
      });

      setSkills(prev =>
        prev.map(skill => {
          if (skill.id !== skillId) return skill;
          
          return {
            ...skill,
            entries: updatedEntries,
            streak: newStreak,
            totalHours: newTotalHours,
          };
        })
      );
    } catch (e) {
      console.error('Failed to update entry', e);
      throw e;
    }
  };

  // Delete a diary entry
  const deleteEntry = async (skillId: string, entryId: string) => {
    if (!user || typeof window === 'undefined') return;

    try {
      await SupabaseService.deleteSkillEntry(entryId);

      // Get the current skill to calculate new totals
      const currentSkill = skills.find(s => s.id === skillId);
      if (!currentSkill) return;

      // Remove the entry from local state
      const updatedEntries = currentSkill.entries.filter(entry => entry.id !== entryId);

      // Calculate new total hours
      const newTotalHours = updatedEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
      
      // Calculate new streak
      const newStreak = calculateSkillStreak(updatedEntries, currentSkill.progressUpdates);

      // Update the skill in the database with new totals
      await SupabaseService.updateSkill(skillId, {
        total_hours: newTotalHours,
        streak: newStreak,
      });

      setSkills(prev =>
        prev.map(skill => {
          if (skill.id !== skillId) return skill;
          
          return {
            ...skill,
            entries: updatedEntries,
            streak: newStreak,
            totalHours: newTotalHours,
          };
        })
      );
    } catch (e) {
      console.error('Failed to delete entry', e);
      throw e;
    }
  };

  // Add a progress update to a skill
  const addProgressUpdate = async (skillId: string, value: number) => {
    if (!user || typeof window === 'undefined') return;

    try {
      // Get the current skill
      const currentSkill = skills.find(s => s.id === skillId);
      if (!currentSkill) return;

      // Check if we should progress to the next level
      const currentLevel = (currentSkill.current_level || 'beginner') as 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'expert';
      console.log('Current level:', currentLevel, 'New progress:', value);
      
      const progressionResult = shouldProgressLevel(currentLevel, value);
      console.log('Progression result:', progressionResult);
      
      let newLevel = currentLevel;
      let newProgress = value;
      let levelUpMessage = '';

             // If we've reached 100% and can level up
       if (progressionResult) {
         newLevel = progressionResult.newLevel;
         if (progressionResult.progressReset) {
           newProgress = 0;
           levelUpMessage = progressionResult.message;
           console.log('LEVEL UP!', levelUpMessage);
           console.log('Updating skill:', { 
             id: skillId, 
             level: currentLevel, 
             newLevel, 
             currentProgress: value, 
             newProgress 
           });
           
           // Show a notification or alert (you might want to use your notification system here)
           // Alert is a placeholder - you should use your app's notification system
           if (typeof window !== 'undefined' && window.alert) {
             window.alert(levelUpMessage);
           }
         }
       }
       
       // Track completed levels
       const completedLevels: string[] = (currentSkill as any).completed_levels || [];
       if (!completedLevels.includes(currentLevel) && progressionResult && progressionResult.progressReset) {
         completedLevels.push(currentLevel);
       }

      // Create notes with level completion info
      let notes = `Progress updated to ${value}%`;
      if (progressionResult && progressionResult.progressReset) {
        const capitalizedLevel = currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1);
        notes += ` - ${capitalizedLevel} Level Completed!`;
      }
      if (levelUpMessage) {
        notes += '. ' + levelUpMessage;
      }

      const progressUpdate = await SupabaseService.createProgressUpdate({
        skill_id: skillId,
        progress: value,
        notes: notes,
      });

      // Calculate new streak
      const newProgressUpdates = [...currentSkill.progressUpdates, progressUpdate];
      const newStreak = calculateSkillStreak(currentSkill.entries, newProgressUpdates);

      // Update the skill's progress, level, and streak in the database
      const updateResult = await SupabaseService.updateSkill(skillId, { 
        progress: newProgress,
        current_level: newLevel,
        streak: newStreak,
        last_updated: progressUpdate.created_at,
        completed_levels: completedLevels,
      } as any);
      
      console.log('Skill update result:', updateResult);
      console.log('Completed levels:', completedLevels);

      setSkills(prev =>
        prev.map(skill => {
          if (skill.id !== skillId) return skill;
          
          return {
            ...skill,
            progress: newProgress,
            current_level: newLevel,
            progressUpdates: newProgressUpdates,
            streak: newStreak,
            lastUpdated: progressUpdate.created_at,
            completed_levels: completedLevels,
          } as any;
        })
      );
    } catch (e) {
      console.error('Failed to add progress update', e);
      throw e;
    }
  };

  return (
    <SkillsContext.Provider value={{ skills, addSkill, updateSkill, deleteSkill, addEntry, updateEntry, deleteEntry, addProgressUpdate, refreshSkills }}>
      {children}
    </SkillsContext.Provider>
  );
};

/**
 * Hook to access the SkillsContext.  Throws an error if used
 * outside a provider.
 */
export const useSkills = () => {
  const context = useContext(SkillsContext);
  if (context === undefined) {
    throw new Error('useSkills must be used within a SkillsProvider');
  }
  return context;
};