import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create a custom storage adapter that only works in browser
const customStorage = isBrowser ? {
  getItem: (key: string) => {
    try {
      return AsyncStorage.getItem(key);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      return AsyncStorage.setItem(key, value);
    } catch {
      return Promise.resolve();
    }
  },
  removeItem: (key: string) => {
    try {
      return AsyncStorage.removeItem(key);
    } catch {
      return Promise.resolve();
    }
  }
} : undefined;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: isBrowser,
    persistSession: isBrowser,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Database types
export interface Skill {
  id: string;
  name: string;
  description?: string;
  progress: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  entries?: SkillEntry[];
  total_hours?: number;
  streak?: number;
  last_updated?: string;
}

export interface SkillEntry {
  id: string;
  skill_id: string;
  content: string;
  created_at: string;
  hours?: number;
}

export interface ProgressUpdate {
  id: string;
  skill_id: string;
  progress: number;
  created_at: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
  // Privacy settings
  profile_visibility?: 'public' | 'private' | 'friends';
  show_progress?: boolean;
  show_streaks?: boolean;
  allow_analytics?: boolean;
  // Security settings
  biometric_auth?: boolean;
  require_pin?: boolean;
  auto_lock?: boolean;
  session_timeout?: '1min' | '5min' | '15min' | '30min' | '1hour' | 'never';
  // Notification settings
  daily_reminders?: boolean;
  weekly_reports?: boolean;
  skill_completions?: boolean;
  streak_alerts?: boolean;
  tips_and_tricks?: boolean;
  marketing_emails?: boolean;
} 