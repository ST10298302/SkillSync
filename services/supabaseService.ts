import * as FileSystem from 'expo-file-system/legacy';
import { ProgressUpdate, Skill, SkillEntry, supabase, User } from '../utils/supabase';

export class SupabaseService {
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

  // Auth methods
  static async signUp(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      console.error('Sign up auth error:', error);
      throw error;
    }

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
        // Don't throw here, as the auth user was created successfully
        // The profile can be created later during first sign in
      }
    }

    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in auth error:', error);
      throw error;
    }

    // Ensure user profile exists
    if (data.user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.name || email.split('@')[0]
            });

          if (createError) {
            console.error('Failed to create user profile:', createError);
            // Don't throw, as the user is still authenticated
          }
        } else if (profileError) {
          console.error('Profile check error:', profileError);
        }
      } catch (profileError) {
        console.error('Profile check/create error:', profileError);
        // Don't throw, as the user is still authenticated
      }
    }

    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('SupabaseService: Sign out error:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        return null;
      }

      if (user) {
        // Ensure user profile exists
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email!,
                name: user.user_metadata?.name || user.email?.split('@')[0]
              });

            if (createError) {
              console.error('Failed to create user profile:', createError);
            }
          }
        } catch (profileError) {
          console.error('Profile check/create error:', profileError);
        }
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  // User methods
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Profile picture methods
  static async uploadProfilePicture(userId: string, imageUri: string): Promise<string> {
    try {
      // Convert image to base64 using legacy API
      const base64 = await FileSystem.readAsStringAsync(imageUri, { 
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
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, bytes, {
          contentType: this.getContentType(fileExt),
          upsert: true,
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

  static async removeProfilePicture(userId: string): Promise<void> {
    try {
      // Get current user to find existing image (don't use .single() to avoid error if no rows)
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('profile_picture_url')
        .eq('id', userId);

      if (userError) {
        console.error('Error fetching user:', userError);
        throw userError;
      }

      // Check if user exists and has a profile picture
      const user = users && users.length > 0 ? users[0] : null;
      
      if (user?.profile_picture_url) {
        try {
          // Extract file path from URL
          const url = new URL(user.profile_picture_url);
          const filePath = url.pathname.split('/').slice(-2).join('/'); // Get last two parts of path

          // Delete from storage
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([filePath]);

          if (deleteError) {
            console.error('Storage delete error:', deleteError);
            // Don't throw here, continue to update user profile
          }
        } catch (urlError) {
          console.error('Error parsing profile picture URL:', urlError);
          // Continue to update user profile even if URL parsing fails
        }
      }

      // Update user profile to remove image URL
      await this.updateUserProfile(userId, { profile_picture_url: undefined });
    } catch (error) {
      console.error('Profile picture removal failed:', error);
      throw error;
    }
  }

  static async getProfilePictureUrl(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('profile_picture_url')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.profile_picture_url || null;
    } catch (error) {
      console.error('Error fetching profile picture URL:', error);
      return null;
    }
  }

  // Privacy and Security Settings
  static async getPrivacySettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('profile_visibility, show_progress, show_streaks, allow_analytics')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return {
        profileVisibility: data?.profile_visibility || 'public',
        showProgress: data?.show_progress ?? true,
        showStreaks: data?.show_streaks ?? true,
        allowAnalytics: data?.allow_analytics ?? true,
      };
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      return {
        profileVisibility: 'public',
        showProgress: true,
        showStreaks: true,
        allowAnalytics: true,
      };
    }
  }

  static async updatePrivacySettings(userId: string, settings: {
    profileVisibility?: 'public' | 'private' | 'friends';
    showProgress?: boolean;
    showStreaks?: boolean;
    allowAnalytics?: boolean;
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          profile_visibility: settings.profileVisibility,
          show_progress: settings.showProgress,
          show_streaks: settings.showStreaks,
          allow_analytics: settings.allowAnalytics,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  static async getSecuritySettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('biometric_auth, require_pin, auto_lock, session_timeout')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return {
        biometricAuth: data?.biometric_auth ?? false,
        requirePin: data?.require_pin ?? false,
        autoLock: data?.auto_lock ?? true,
        sessionTimeout: data?.session_timeout || '30min',
      };
    } catch (error) {
      console.error('Error fetching security settings:', error);
      return {
        biometricAuth: false,
        requirePin: false,
        autoLock: true,
        sessionTimeout: '30min',
      };
    }
  }

  static async updateSecuritySettings(userId: string, settings: {
    biometricAuth?: boolean;
    requirePin?: boolean;
    autoLock?: boolean;
    sessionTimeout?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          biometric_auth: settings.biometricAuth,
          require_pin: settings.requirePin,
          auto_lock: settings.autoLock,
          session_timeout: settings.sessionTimeout,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  static async exportUserData(userId: string) {
    try {
      // Get all user data
      const [userData, skillsData] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('skills').select(`
          *,
          skill_entries (*),
          progress_updates (*)
        `).eq('user_id', userId)
      ]);

      if (userData.error) throw userData.error;
      if (skillsData.error) throw skillsData.error;

      const exportData = {
        user: userData.data,
        skills: skillsData.data,
        exported_at: new Date().toISOString(),
        version: '1.0'
      };

      return exportData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  static async deleteUserAccount(userId: string) {
    try {
      // First, get all skill IDs for this user
      const { data: userSkills, error: skillsError } = await supabase
        .from('skills')
        .select('id')
        .eq('user_id', userId);

      if (skillsError) {
        console.error('Error fetching user skills:', skillsError);
        throw skillsError;
      }

      const skillIds = userSkills?.map(skill => skill.id) || [];

      // Delete all user data in order (due to foreign key constraints)
      const deleteOperations = [];

      // Delete progress updates for user's skills
      if (skillIds.length > 0) {
        deleteOperations.push(
          supabase.from('progress_updates').delete().in('skill_id', skillIds)
        );
        // Delete skill entries for user's skills
        deleteOperations.push(
          supabase.from('skill_entries').delete().in('skill_id', skillIds)
        );
      }

      // Delete skills
      deleteOperations.push(
        supabase.from('skills').delete().eq('user_id', userId)
      );

      // Delete user profile
      deleteOperations.push(
        supabase.from('users').delete().eq('id', userId)
      );

      // Execute deletions
      for (const operation of deleteOperations) {
        const { error } = await operation;
        if (error) {
          console.error('Error in delete operation:', error);
          // Continue with other deletions even if one fails
        }
      }

      // Remove PIN from secure storage
      try {
        const { PinService } = await import('./pinService');
        await PinService.removePin();
        console.log('PIN removed from secure storage');
      } catch (error) {
        console.error('Error removing PIN:', error);
      }

      // Call the Edge Function to delete the auth user
      try {
        console.log('Starting Edge Function call for user deletion...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session found');
        }

        const endpoint = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/swift-endpoint`;
        console.log('Calling Edge Function at:', endpoint);
        console.log('User ID:', userId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ userId }),
        });

        console.log('Edge Function response status:', response.status);
        console.log('Edge Function response ok:', response.ok);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Edge Function error response:', errorData);
          throw new Error(errorData.error || 'Failed to delete auth user');
        }

        const result = await response.json();
        console.log('Auth user deleted successfully:', result);
      } catch (edgeFunctionError) {
        console.error('Error calling delete-user Edge Function:', edgeFunctionError);
        // User data is still deleted, but auth user remains
        console.warn('User data deleted but auth user could not be removed via Edge Function.');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  }

  // Skills methods
  static async getSkills(userId: string) {
    const { data, error } = await supabase
      .from('skills')
      .select(`
        *,
        skill_entries (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Include enhanced fields with defaults if they don't exist
    const skillsWithDefaults = (data || []).map((skill: any) => ({
      ...skill,
      likes_count: skill.likes_count || 0,
      comments_count: skill.comments_count || 0,
      current_level: skill.current_level || 'beginner',
      visibility: skill.visibility || 'private',
      category_id: skill.category_id || null,
    }));
    
    return skillsWithDefaults;
  }

  static async getSkill(skillId: string) {
    const { data, error } = await supabase
      .from('skills')
      .select(`
        *,
        skill_entries (*)
      `)
      .eq('id', skillId)
      .single();

    if (error) throw error;
    return data;
  }

  static async createSkill(skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'> & { visibility?: string }) {
    const { data, error } = await supabase
      .from('skills')
      .insert(skill)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSkill(skillId: string, updates: Partial<Skill>) {
    const { data, error } = await supabase
      .from('skills')
      .update(updates)
      .eq('id', skillId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteSkill(skillId: string) {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', skillId);

    if (error) throw error;
  }

  // Skill entries methods
  static async getSkillEntries(skillId: string) {
    const { data, error } = await supabase
      .from('skill_entries')
      .select('*')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createSkillEntry(entry: Omit<SkillEntry, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('skill_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSkillEntry(entryId: string, updates: Partial<SkillEntry>) {
    const { data, error } = await supabase
      .from('skill_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteSkillEntry(entryId: string) {
    const { error } = await supabase
      .from('skill_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
  }

  // Progress updates methods
  static async getProgressUpdates(skillId: string) {
    const { data, error } = await supabase
      .from('progress_updates')
      .select('*')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createProgressUpdate(update: Omit<ProgressUpdate, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('progress_updates')
      .insert(update)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics methods
  static async getSkillsAnalytics(userId: string) {
    const { data, error } = await supabase
      .from('skills')
      .select(`
        *,
        skill_entries (*),
        progress_updates (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  // Real-time subscriptions
  static subscribeToSkills(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('skills')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'skills',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToSkillEntries(skillId: string, callback: (payload: any) => void) {
    return supabase
      .channel('skill_entries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'skill_entries',
          filter: `skill_id=eq.${skillId}`
        },
        callback
      )
      .subscribe();
  }

  /**
   * Get notification settings for a user
   */
  static async getNotificationSettings(userId: string): Promise<Partial<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          daily_reminders,
          weekly_reports,
          skill_completions,
          streak_alerts,
          tips_and_tricks,
          marketing_emails
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching notification settings:', error);
        throw error;
      }

      return data || {};
    } catch (error) {
      console.error('Notification settings fetch failed:', error);
      throw error;
    }
  }

  /**
   * Update notification settings for a user
   */
  static async updateNotificationSettings(userId: string, settings: Partial<User>): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          daily_reminders: settings.daily_reminders,
          weekly_reports: settings.weekly_reports,
          skill_completions: settings.skill_completions,
          streak_alerts: settings.streak_alerts,
          tips_and_tricks: settings.tips_and_tricks,
          marketing_emails: settings.marketing_emails,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating notification settings:', error);
        throw error;
      }
    } catch (error) {
      console.error('Notification settings update failed:', error);
      throw error;
    }
  }
} 