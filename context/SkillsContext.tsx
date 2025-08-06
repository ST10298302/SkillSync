import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DiaryEntry {
  id: string;
  text: string;
  date: string;
}

export interface ProgressUpdate {
  id: string;
  value: number; // numeric progress value (e.g. percentage or hours)
  date: string;
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
}

interface SkillsContextProps {
  skills: Skill[];
  addSkill: (skill: Omit<Skill, 'entries' | 'progress' | 'progressUpdates' | 'createdAt'>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  addEntry: (skillId: string, text: string) => Promise<void>;
  addProgressUpdate: (skillId: string, value: number) => Promise<void>;
}

const SkillsContext = createContext<SkillsContextProps | undefined>(undefined);

// Storage key for skills array
const SKILLS_KEY = 'skills';

export const SkillsProvider = ({ children }: { children: ReactNode }) => {
  const [skills, setSkills] = useState<Skill[]>([]);

  // Load skills from storage on mount
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await AsyncStorage.getItem(SKILLS_KEY);
        if (data) {
          setSkills(JSON.parse(data));
        }
      } catch (e) {
        console.error('Failed to load skills', e);
      }
    };
    loadSkills();
  }, []);

  // Persist skills whenever they change
  useEffect(() => {
    const saveSkills = async () => {
      try {
        await AsyncStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
      } catch (e) {
        console.error('Failed to save skills', e);
      }
    };
    saveSkills();
  }, [skills]);

  // Add a new skill with defaults
  const addSkill = async (
    skill: Omit<Skill, 'entries' | 'progress' | 'progressUpdates' | 'createdAt'>
  ) => {
    const newSkill: Skill = {
      ...skill,
      progress: 0,
      progressUpdates: [],
      entries: [],
      createdAt: new Date().toISOString(),
    };
    setSkills(prev => [...prev, newSkill]);
  };

  // Delete a skill by id
  const deleteSkill = async (id: string) => {
    setSkills(prev => prev.filter(skill => skill.id !== id));
  };

  // Add a diary entry to a skill
  const addEntry = async (skillId: string, text: string) => {
    const entry: DiaryEntry = {
      id: Date.now().toString(),
      text,
      date: new Date().toISOString(),
    };
    setSkills(prev =>
      prev.map(skill =>
        skill.id === skillId
          ? { ...skill, entries: [...skill.entries, entry] }
          : skill
      )
    );
  };

  // Add a progress update to a skill.  The current progress value
  // becomes the provided value.  We store updates in an array for
  // history and set the skill's progress accordingly.
  const addProgressUpdate = async (skillId: string, value: number) => {
    setSkills(prev =>
      prev.map(skill => {
        if (skill.id !== skillId) return skill;
        const update: ProgressUpdate = {
          id: Date.now().toString(),
          value,
          date: new Date().toISOString(),
        };
        const newUpdates = [...skill.progressUpdates, update];
        return {
          ...skill,
          progressUpdates: newUpdates,
          progress: value,
        };
      })
    );
  };

  return (
    <SkillsContext.Provider value={{ skills, addSkill, deleteSkill, addEntry, addProgressUpdate }}>
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