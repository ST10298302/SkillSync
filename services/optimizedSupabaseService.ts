import * as FileSystem from 'expo-file-system/legacy';
import { ProgressUpdate, Skill, SkillEntry, supabase, User } from '../utils/supabase';

// Cache interface for storing query results
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Simple in-memory cache
class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Connection pooling and query optimization
class ConnectionManager {
  private static instance: ConnectionManager;
  private connectionPool: Map<string, any> = new Map();
  private queryMetrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  // Track query performance
  trackQuery(queryName: string, duration: number) {
    const existing = this.queryMetrics.get(queryName) || { count: 0, totalTime: 0, avgTime: 0 };
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    this.queryMetrics.set(queryName, existing);
  }

  getQueryMetrics() {
    return Object.fromEntries(this.queryMetrics);
  }
}

export class OptimizedSupabaseService {
  private static cache = new QueryCache();
  private static connectionManager = ConnectionManager.getInstance();

  // Helper methods
  private static getContentType(fileExt: string): string {
    const ext = fileExt.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  // Optimized query execution with caching and metrics
  private static async executeQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    cacheKey?: string,
    ttl?: number
  ): Promise<T> {
    const startTime = performance.now();

    // Check cache first
    if (cacheKey) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        console.log(`Cache hit for ${queryName}`);
        return cached;
      }
    }

    try {
      const result = await queryFn();
      
      // Cache the result
      if (cacheKey && result) {
        this.cache.set(cacheKey, result, ttl);
      }

      const duration = performance.now() - startTime;
      this.connectionManager.trackQuery(queryName, duration);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.connectionManager.trackQuery(`${queryName}_error`, duration);
      throw error;
    }
  }

  // Batch operations for better performance
  static async batchCreateSkills(skills: Omit<Skill, 'id' | 'created_at' | 'updated_at'>[]) {
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase
        .from('skills')
        .insert(skills)
        .select();

      if (error) throw error;

      const duration = performance.now() - startTime;
      this.connectionManager.trackQuery('batch_create_skills', duration);
      
      // Invalidate skills cache
      this.cache.invalidate('skills');
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Optimized skills retrieval with pagination
  static async getSkillsPaginated(
    userId: string, 
    page: number = 0, 
    limit: number = 20,
    orderBy: string = 'created_at',
    ascending: boolean = false
  ) {
    const cacheKey = `skills_${userId}_${page}_${limit}_${orderBy}_${ascending}`;
    
    return this.executeQuery(
      'get_skills_paginated',
      async () => {
        const { data, error } = await supabase
          .from('skills')
          .select(`
            *,
            skill_entries (*)
          `)
          .eq('user_id', userId)
          .order(orderBy, { ascending })
          .range(page * limit, (page + 1) * limit - 1);

        if (error) throw error;
        return data || [];
      },
      cacheKey,
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  // Optimized single skill retrieval
  static async getSkill(skillId: string) {
    const cacheKey = `skill_${skillId}`;
    
    return this.executeQuery(
      'get_skill',
      async () => {
        const { data, error } = await supabase
          .from('skills')
          .select(`
            *,
            skill_entries (*),
            progress_updates (*)
          `)
          .eq('id', skillId)
          .single();

        if (error) throw error;
        return data;
      },
      cacheKey,
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  // Optimized skills retrieval with minimal data
  static async getSkillsMinimal(userId: string) {
    const cacheKey = `skills_minimal_${userId}`;
    
    return this.executeQuery(
      'get_skills_minimal',
      async () => {
        const { data, error } = await supabase
          .from('skills')
          .select('id, name, progress, streak, total_hours, last_updated, created_at')
          .eq('user_id', userId)
          .order('last_updated', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      cacheKey,
      3 * 60 * 1000 // 3 minutes cache
    );
  }

  // Optimized analytics with aggregated data
  static async getSkillsAnalyticsOptimized(userId: string) {
    const cacheKey = `analytics_${userId}`;
    
    return this.executeQuery(
      'get_analytics_optimized',
      async () => {
        // Get aggregated data in a single query
        const { data, error } = await supabase
          .from('skills')
          .select(`
            id,
            name,
            progress,
            streak,
            total_hours,
            created_at,
            last_updated,
            skill_entries!inner(count),
            progress_updates!inner(count)
          `)
          .eq('user_id', userId);

        if (error) throw error;
        return data || [];
      },
      cacheKey,
      10 * 60 * 1000 // 10 minutes cache
    );
  }

  // Optimized skill entries with pagination
  static async getSkillEntriesPaginated(
    skillId: string,
    page: number = 0,
    limit: number = 50
  ) {
    const cacheKey = `entries_${skillId}_${page}_${limit}`;
    
    return this.executeQuery(
      'get_skill_entries_paginated',
      async () => {
        const { data, error } = await supabase
          .from('skill_entries')
          .select('*')
          .eq('skill_id', skillId)
          .order('created_at', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        if (error) throw error;
        return data || [];
      },
      cacheKey,
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  // Batch operations for better performance
  static async batchCreateSkillEntries(entries: Omit<SkillEntry, 'id' | 'created_at'>[]) {
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase
        .from('skill_entries')
        .insert(entries)
        .select();

      if (error) throw error;

      const duration = performance.now() - startTime;
      this.connectionManager.trackQuery('batch_create_entries', duration);
      
      // Invalidate related caches
      entries.forEach(entry => {
        this.cache.invalidate(`entries_${entry.skill_id}`);
        this.cache.invalidate(`skill_${entry.skill_id}`);
      });
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Optimized progress updates with batching
  static async batchCreateProgressUpdates(updates: Omit<ProgressUpdate, 'id' | 'created_at'>[]) {
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase
        .from('progress_updates')
        .insert(updates)
        .select();

      if (error) throw error;

      const duration = performance.now() - startTime;
      this.connectionManager.trackQuery('batch_create_progress', duration);
      
      // Invalidate related caches
      updates.forEach(update => {
        this.cache.invalidate(`skill_${update.skill_id}`);
      });
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Cache management methods
  static invalidateUserCache(userId: string): void {
    this.cache.invalidate(`skills_${userId}`);
    this.cache.invalidate(`analytics_${userId}`);
    this.cache.invalidate(`skills_minimal_${userId}`);
  }

  static invalidateSkillCache(skillId: string): void {
    this.cache.invalidate(`skill_${skillId}`);
    this.cache.invalidate(`entries_${skillId}`);
  }

  static clearAllCache(): void {
    this.cache.clear();
  }

  static getCacheStats() {
    return this.cache.getStats();
  }

  static getQueryMetrics() {
    return this.connectionManager.getQueryMetrics();
  }

  // Real-time subscriptions with connection pooling
  static subscribeToSkills(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`skills_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'skills',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Invalidate cache on changes
          this.invalidateUserCache(userId);
          callback(payload);
        }
      )
      .subscribe();

    return channel;
  }

  // Optimized file upload with compression
  static async uploadProfilePictureOptimized(userId: string, imageUri: string): Promise<string> {
    try {
      // Check if file exists and get its size
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // For large files, we might want to compress them
      const shouldCompress = fileInfo.size && fileInfo.size > 1024 * 1024; // 1MB threshold
      
      let base64: string;
      // Read file as base64 using legacy API
      base64 = await FileSystem.readAsStringAsync(imageUri, { 
        encoding: FileSystem.EncodingType.Base64
      });

      // Generate unique filename
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Convert base64 to Uint8Array for direct upload
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        const cp = binaryString.codePointAt(i) ?? 0;
        bytes[i] = cp & 0xff;
      }

      // Upload to Supabase Storage with optimized settings
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, bytes, {
          contentType: this.getContentType(fileExt),
          upsert: true,
          cacheControl: '3600', // Cache for 1 hour
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update user profile with new image URL
      await this.updateUserProfile(userId, { profile_picture_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      throw error;
    }
  }

  // Delegate to original service for methods not yet optimized
  static async signUp(email: string, password: string, name?: string) {
    return this.executeQuery('sign_up', async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: name || data.user.user_metadata?.name || email.split('@')[0]
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw profileError;
          }
        } catch (profileError) {
          console.error('Failed to create user profile:', profileError);
        }
      }

      return data;
    });
  }

  static async signIn(email: string, password: string) {
    return this.executeQuery('sign_in', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Ensure user profile exists
      if (data.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name || email.split('@')[0]
              });

            if (createError) {
              console.error('Failed to create user profile:', createError);
            }
          } else if (profileError) {
            console.error('Profile check error:', profileError);
          }
        } catch (profileError) {
          console.error('Profile check/create error:', profileError);
        }
      }

      return data;
    });
  }

  static async signOut() {
    return this.executeQuery('sign_out', async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear cache on sign out
      this.clearAllCache();
    });
  }

  static async getCurrentUser() {
    return this.executeQuery('get_current_user', async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return null;
      return user;
    });
  }

  static async updateUserProfile(userId: string, updates: Partial<User>) {
    return this.executeQuery('update_user_profile', async () => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  // Delegate other methods to original service for now
  static async getUserProfile(userId: string) {
    return this.executeQuery('get_user_profile', async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    });
  }

  static async createSkill(skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>) {
    return this.executeQuery('create_skill', async () => {
      const { data, error } = await supabase
        .from('skills')
        .insert(skill)
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate cache
      this.cache.invalidate(`skills_${skill.user_id}`);
      
      return data;
    });
  }

  static async updateSkill(skillId: string, updates: Partial<Skill>) {
    return this.executeQuery('update_skill', async () => {
      const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', skillId)
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate cache
      this.invalidateSkillCache(skillId);
      
      return data;
    });
  }

  static async deleteSkill(skillId: string) {
    return this.executeQuery('delete_skill', async () => {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
      
      // Invalidate cache
      this.invalidateSkillCache(skillId);
    });
  }

  static async createSkillEntry(entry: Omit<SkillEntry, 'id' | 'created_at'>) {
    return this.executeQuery('create_skill_entry', async () => {
      const { data, error } = await supabase
        .from('skill_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate cache
      this.cache.invalidate(`entries_${entry.skill_id}`);
      this.cache.invalidate(`skill_${entry.skill_id}`);
      
      return data;
    });
  }

  static async updateSkillEntry(entryId: string, updates: Partial<SkillEntry>) {
    return this.executeQuery('update_skill_entry', async () => {
      const { data, error } = await supabase
        .from('skill_entries')
        .update(updates)
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  static async deleteSkillEntry(entryId: string) {
    return this.executeQuery('delete_skill_entry', async () => {
      const { error } = await supabase
        .from('skill_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
    });
  }

  static async createProgressUpdate(update: Omit<ProgressUpdate, 'id' | 'created_at'>) {
    return this.executeQuery('create_progress_update', async () => {
      const { data, error } = await supabase
        .from('progress_updates')
        .insert(update)
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate cache
      this.cache.invalidate(`skill_${update.skill_id}`);
      
      return data;
    });
  }

  static async getProgressUpdates(skillId: string) {
    const cacheKey = `progress_${skillId}`;
    
    return this.executeQuery('get_progress_updates', async () => {
      const { data, error } = await supabase
        .from('progress_updates')
        .select('*')
        .eq('skill_id', skillId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }, cacheKey, 2 * 60 * 1000);
  }

  static async getSkills(userId: string) {
    const cacheKey = `skills_${userId}`;
    
    return this.executeQuery('get_skills', async () => {
      const { data, error } = await supabase
        .from('skills')
        .select(`
          *,
          skill_entries (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }, cacheKey, 3 * 60 * 1000);
  }

  static async getSkillsAnalytics(userId: string) {
    return this.getSkillsAnalyticsOptimized(userId);
  }

  static subscribeToSkillEntries(skillId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`skill_entries_${skillId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'skill_entries',
          filter: `skill_id=eq.${skillId}`
        },
        (payload) => {
          // Invalidate cache on changes
          this.cache.invalidate(`entries_${skillId}`);
          this.cache.invalidate(`skill_${skillId}`);
          callback(payload);
        }
      )
      .subscribe();
  }
}
