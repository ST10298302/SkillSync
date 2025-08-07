import * as FileSystem from 'expo-file-system';
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
    console.log('🔧 Starting sign up process...', { email, name });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      console.error('❌ Sign up auth error:', error);
      throw error;
    }

    console.log('✅ Auth sign up successful, user ID:', data.user?.id);

    // Create user profile
    if (data.user) {
      try {
        console.log('🔄 Creating user profile...');
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: name || data.user.user_metadata?.name || email.split('@')[0]
          });

        if (profileError) {
          console.error('❌ Profile creation error:', profileError);
          throw profileError;
        }
        
        console.log('✅ User profile created successfully');
      } catch (profileError) {
        console.error('❌ Failed to create user profile:', profileError);
        // Don't throw here, as the auth user was created successfully
        // The profile can be created later during first sign in
      }
    }

    return data;
  }

  static async signIn(email: string, password: string) {
    console.log('🔧 Starting sign in process...', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Sign in auth error:', error);
      throw error;
    }

    console.log('✅ Auth sign in successful, user ID:', data.user?.id);

    // Ensure user profile exists
    if (data.user) {
      try {
        console.log('🔄 Checking user profile...');
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('🔄 User profile not found, creating...');
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.name || email.split('@')[0]
            });

          if (createError) {
            console.error('❌ Failed to create user profile:', createError);
            // Don't throw, as the user is still authenticated
          } else {
            console.log('✅ User profile created successfully');
          }
        } else if (profileError) {
          console.error('❌ Profile check error:', profileError);
        } else {
          console.log('✅ User profile exists');
        }
      } catch (profileError) {
        console.error('❌ Profile check/create error:', profileError);
        // Don't throw, as the user is still authenticated
      }
    }

    return data;
  }

  static async signOut() {
    console.log('🔧 SupabaseService: Starting sign out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ SupabaseService: Sign out error:', error);
      throw error;
    }
    console.log('✅ SupabaseService: Sign out successful');
  }

  static async getCurrentUser() {
    try {
      console.log('🔧 Getting current user...');
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.log('Auth session error:', error.message);
        return null;
      }

      if (user) {
        console.log('✅ Current user found:', user.id);
        
        // Ensure user profile exists
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            console.log('🔄 Creating missing user profile...');
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email!,
                name: user.user_metadata?.name || user.email?.split('@')[0]
              });

            if (createError) {
              console.error('❌ Failed to create user profile:', createError);
            } else {
              console.log('✅ User profile created successfully');
            }
          }
        } catch (profileError) {
          console.error('❌ Profile check/create error:', profileError);
        }
      }

      return user;
    } catch (error) {
      console.log('Failed to get current user:', error);
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
    console.log('🔧 Starting profile picture upload...', { userId });
    
    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('🔧 Base64 length:', base64.length);

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

      console.log('🔧 Binary data length:', bytes.length);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, bytes, {
          contentType: this.getContentType(fileExt),
          upsert: true,
        });

      if (error) {
        console.error('❌ Storage upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('✅ Profile picture uploaded successfully:', publicUrl);
      console.log('🔧 Profile picture file path:', filePath);

      // Update user profile with new image URL
      await this.updateUserProfile(userId, { profile_picture_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('❌ Profile picture upload failed:', error);
      throw error;
    }
  }

  static async removeProfilePicture(userId: string): Promise<void> {
    console.log('🔧 Removing profile picture...', { userId });
    
    try {
      // Get current user to find existing image
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('profile_picture_url')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('❌ Error fetching user:', userError);
        throw userError;
      }

      if (user?.profile_picture_url) {
        // Extract file path from URL
        const url = new URL(user.profile_picture_url);
        const filePath = url.pathname.split('/').slice(-2).join('/'); // Get last two parts of path

        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([filePath]);

        if (deleteError) {
          console.error('❌ Storage delete error:', deleteError);
          // Don't throw here, continue to update user profile
        }
      }

      // Update user profile to remove image URL
      await this.updateUserProfile(userId, { profile_picture_url: undefined });

      console.log('✅ Profile picture removed successfully');
    } catch (error) {
      console.error('❌ Profile picture removal failed:', error);
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
      console.log('🔧 Retrieved profile picture URL from database:', data?.profile_picture_url);
      return data?.profile_picture_url || null;
    } catch (error) {
      console.error('❌ Error fetching profile picture URL:', error);
      return null;
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
    return data || [];
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

  static async createSkill(skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>) {
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
} 