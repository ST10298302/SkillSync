import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { OptimizedSupabaseService } from '../services/optimizedSupabaseService';
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
}

interface OptimizedSkillsContextProps {
  skills: Skill[];
  loading: boolean;
  error: string | null;
  addSkill: (skill: Omit<Skill, 'entries' | 'progress' | 'progressUpdates' | 'createdAt'>) => Promise<void>;
  updateSkill: (id: string, updates: { name?: string; description?: string }) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  addEntry: (skillId: string, text: string, hours?: number) => Promise<void>;
  addProgressUpdate: (skillId: string, value: number) => Promise<void>;
  refreshSkills: () => Promise<void>;
  // New optimized methods
  getSkillsPaginated: (page: number, limit: number) => Promise<Skill[]>;
  getSkillsMinimal: () => Promise<Skill[]>;
  getSkillEntriesPaginated: (skillId: string, page: number, limit: number) => Promise<DiaryEntry[]>;
  // Performance monitoring
  getPerformanceMetrics: () => any;
  clearCache: () => void;
}

const OptimizedSkillsContext = createContext<OptimizedSkillsContextProps | undefined>(undefined);

export const OptimizedSkillsProvider = ({ children }: { children: ReactNode }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const { user } = useAuth();

  // Memoized skill operations to prevent unnecessary re-renders
  const skillOperations = useMemo(() => ({
    addSkill: async (skill: Omit<Skill, 'entries' | 'progress' | 'progressUpdates' | 'createdAt'>) => {
      if (!user) return;

      setLoading(true);
      setError(null);
      
      try {
        const supabaseSkill = await OptimizedSupabaseService.createSkill({
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
        };
        
        setSkills(prev => [newSkill, ...prev]);
      } catch (e) {
        console.error('Failed to add skill', e);
        setError(e instanceof Error ? e.message : 'Failed to add skill');
        throw e;
      } finally {
        setLoading(false);
      }
    },

    updateSkill: async (id: string, updates: { name?: string; description?: string }) => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        await OptimizedSupabaseService.updateSkill(id, updates);
        setSkills(prevSkills => 
          prevSkills.map(skill => 
            skill.id === id 
              ? { ...skill, ...updates }
              : skill
          )
        );
      } catch (e) {
        console.error('Failed to update skill', e);
        setError(e instanceof Error ? e.message : 'Failed to update skill');
        throw e;
      } finally {
        setLoading(false);
      }
    },

    deleteSkill: async (id: string) => {
      setLoading(true);
      setError(null);
      
      try {
        await OptimizedSupabaseService.deleteSkill(id);
        setSkills(prev => prev.filter(skill => skill.id !== id));
      } catch (e) {
        console.error('Failed to delete skill', e);
        setError(e instanceof Error ? e.message : 'Failed to delete skill');
        throw e;
      } finally {
        setLoading(false);
      }
    },

    addEntry: async (skillId: string, text: string, hours: number = 0) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const entry = await OptimizedSupabaseService.createSkillEntry({
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
        await OptimizedSupabaseService.updateSkill(skillId, {
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
        setError(e instanceof Error ? e.message : 'Failed to add entry');
        throw e;
      } finally {
        setLoading(false);
      }
    },

    addProgressUpdate: async (skillId: string, value: number) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const progressUpdate = await OptimizedSupabaseService.createProgressUpdate({
          skill_id: skillId,
          progress: value,
          notes: `Progress updated to ${value}%`,
        });

        // Get the current skill to calculate new streak
        const currentSkill = skills.find(s => s.id === skillId);
        if (!currentSkill) return;

        // Calculate new streak
        const newProgressUpdates = [...currentSkill.progressUpdates, progressUpdate];
        const newStreak = calculateSkillStreak(currentSkill.entries, newProgressUpdates);

        // Update the skill's progress and streak in the database
        await OptimizedSupabaseService.updateSkill(skillId, { 
          progress: value,
          streak: newStreak,
          last_updated: progressUpdate.created_at,
        });

        setSkills(prev =>
          prev.map(skill => {
            if (skill.id !== skillId) return skill;
            
            return {
              ...skill,
              progress: value,
              progressUpdates: newProgressUpdates,
              streak: newStreak,
              lastUpdated: progressUpdate.created_at,
            };
          })
        );
      } catch (e) {
        console.error('Failed to add progress update', e);
        setError(e instanceof Error ? e.message : 'Failed to add progress update');
        throw e;
      } finally {
        setLoading(false);
      }
    }
  }), [user, skills]);

  // Optimized load skills with pagination
  const loadSkills = useCallback(async (page: number = 0, reset: boolean = false) => {
    if (!user || typeof window === 'undefined') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const supabaseSkills = await OptimizedSupabaseService.getSkillsPaginated(user.id, page, 20);
      
      if (reset) {
        setSkills([]);
        setCurrentPage(0);
      }
      
      const convertedSkills: Skill[] = await Promise.all(
        supabaseSkills.map(async (supabaseSkill) => {
          // Load progress updates for this skill
          const progressUpdates = await OptimizedSupabaseService.getProgressUpdates(supabaseSkill.id);
          
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
          };
        })
      );
      
      if (reset) {
        setSkills(convertedSkills);
      } else {
        setSkills(prev => [...prev, ...convertedSkills]);
      }
      
      setCurrentPage(page);
      setHasMore(convertedSkills.length === 20);
    } catch (e) {
      console.error('Failed to load skills', e);
      setError(e instanceof Error ? e.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load skills on mount and when user changes
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      loadSkills(0, true);
    } else if (typeof window !== 'undefined') {
      setSkills([]);
    }
  }, [user, loadSkills]);

  // Optimized refresh
  const refreshSkills = useCallback(async () => {
    if (typeof window !== 'undefined') {
      await loadSkills(0, true);
    }
  }, [loadSkills]);

  // New optimized methods
  const getSkillsPaginated = useCallback(async (page: number, limit: number) => {
    if (!user) return [];
    
    try {
      const supabaseSkills = await OptimizedSupabaseService.getSkillsPaginated(user.id, page, limit);
      return supabaseSkills.map(skill => ({
        id: skill.id,
        name: skill.name,
        description: skill.description || '',
        startDate: skill.created_at,
        progress: skill.progress,
        progressUpdates: [],
        entries: (skill.skill_entries || []).map((entry: SkillEntry) => ({
          id: entry.id,
          text: entry.content,
          date: entry.created_at,
          hours: entry.hours,
        })),
        createdAt: skill.created_at,
        lastUpdated: skill.last_updated,
        streak: skill.streak || 0,
        totalHours: skill.total_hours || 0,
      }));
    } catch (e) {
      console.error('Failed to get paginated skills', e);
      return [];
    }
  }, [user]);

  const getSkillsMinimal = useCallback(async () => {
    if (!user) return [];
    
    try {
      const supabaseSkills = await OptimizedSupabaseService.getSkillsMinimal(user.id);
      return supabaseSkills.map(skill => ({
        id: skill.id,
        name: skill.name,
        description: '',
        startDate: skill.created_at,
        progress: skill.progress,
        progressUpdates: [],
        entries: [],
        createdAt: skill.created_at,
        lastUpdated: skill.last_updated,
        streak: skill.streak || 0,
        totalHours: skill.total_hours || 0,
      }));
    } catch (e) {
      console.error('Failed to get minimal skills', e);
      return [];
    }
  }, [user]);

  const getSkillEntriesPaginated = useCallback(async (skillId: string, page: number, limit: number) => {
    try {
      const entries = await OptimizedSupabaseService.getSkillEntriesPaginated(skillId, page, limit);
      return entries.map(entry => ({
        id: entry.id,
        text: entry.content,
        date: entry.created_at,
        hours: entry.hours,
      }));
    } catch (e) {
      console.error('Failed to get paginated entries', e);
      return [];
    }
  }, []);

  const getPerformanceMetrics = useCallback(() => {
    return {
      cache: OptimizedSupabaseService.getCacheStats(),
      queries: OptimizedSupabaseService.getQueryMetrics(),
    };
  }, []);

  const clearCache = useCallback(() => {
    OptimizedSupabaseService.clearAllCache();
  }, []);

  return (
    <OptimizedSkillsContext.Provider 
      value={{ 
        skills, 
        loading, 
        error,
        addSkill: skillOperations.addSkill,
        updateSkill: skillOperations.updateSkill,
        deleteSkill: skillOperations.deleteSkill,
        addEntry: skillOperations.addEntry,
        addProgressUpdate: skillOperations.addProgressUpdate,
        refreshSkills,
        getSkillsPaginated,
        getSkillsMinimal,
        getSkillEntriesPaginated,
        getPerformanceMetrics,
        clearCache
      }}
    >
      {children}
    </OptimizedSkillsContext.Provider>
  );
};

/**
 * Hook to access the OptimizedSkillsContext. Throws an error if used
 * outside a provider.
 */
export const useOptimizedSkills = () => {
  const context = useContext(OptimizedSkillsContext);
  if (context === undefined) {
    throw new Error('useOptimizedSkills must be used within an OptimizedSkillsProvider');
  }
  return context;
};
