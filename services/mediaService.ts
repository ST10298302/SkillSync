/**
 * Media Service
 * Handles file uploads, image compression, and artifact management
 * Uses Supabase Storage for file uploads (supabase, 2025)
 */
// @ts-nocheck
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { supabase } from '../utils/supabase';
import { ArtifactFileType, SkillArtifact } from '../utils/supabase-types';

export class MediaService {
  // ============================================
  // FILE UPLOAD
  // ============================================

  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile(
    file: File | Blob,
    bucket: string,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const fileExt = path.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const fullPath = `${path}/${fileName}`;

    // Upload file with progress tracking
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fullPath);

    return urlData.publicUrl;
  }

  /**
   * Upload image with automatic compression
   */
  static async uploadImage(
    imageUri: string,
    bucket: string = 'skill-artifacts',
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    } = {}
  ): Promise<{ url: string; thumbnailUrl: string }> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    let blob: Blob;
    let thumbnailBlob: Blob;

    if (Platform.OS === 'web') {
      // On web, fetch the image directly
      try {
        console.log('Web upload - imageUri:', imageUri);
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        blob = await response.blob();
        console.log('Web upload - blob size:', blob.size, 'type:', blob.type);
        
        // For web, we can use the same image for thumbnail (or create a smaller canvas)
        thumbnailBlob = blob;
      } catch (error) {
        console.error('Error fetching image on web:', error);
        throw new Error(`Failed to process image: ${error}`);
      }
    } else {
      // On native, use ImageManipulator for compression and resizing
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: options.maxWidth || 1200,
              height: options.maxHeight || 1200,
            },
          },
        ],
        {
          compress: options.quality || 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Generate thumbnail
      const thumbnailResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: 300,
              height: 300,
            },
          },
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Read file as base64 on native
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const thumbnailBase64 = await FileSystem.readAsStringAsync(thumbnailResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to Uint8Array for Supabase
      const { base64ToUint8Array } = await import('../utils/base64');
      const bytes = base64ToUint8Array(base64);

      const thumbnailBinaryString = atob(thumbnailBase64);
      const thumbnailBytes = base64ToUint8Array(thumbnailBase64);

      blob = new Blob([bytes], { type: 'image/jpeg' });
      thumbnailBlob = new Blob([thumbnailBytes], { type: 'image/jpeg' });
    }

    // Upload both images
    const fileName = `${user.id}/${Date.now()}.jpg`;
    const thumbnailFileName = `${user.id}/thumbnails/${Date.now()}.jpg`;

    console.log('Uploading files:', { fileName, thumbnailFileName, blobSize: blob.size });

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, { 
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { error: thumbnailUploadError } = await supabase.storage
      .from(bucket)
      .upload(thumbnailFileName, thumbnailBlob, { 
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (thumbnailUploadError) {
      console.error('Thumbnail upload error:', thumbnailUploadError);
      throw thumbnailUploadError;
    }

    // Get public URLs
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    const { data: thumbnailUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(thumbnailFileName);

    return {
      url: urlData.publicUrl,
      thumbnailUrl: thumbnailUrlData.publicUrl,
    };
  }

  /**
   * Upload PDF or document
   */
  static async uploadDocument(
    documentUri: string,
    bucket: string = 'skill-artifacts',
    mimeType: string = 'application/pdf'
  ): Promise<string> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(documentUri);
    const blob = await response.blob();

    const ext = mimeType.includes('pdf') ? 'pdf' : 'doc';
    const fileName = `${user.id}/documents/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, blob, {
      contentType: mimeType,
      upsert: false,
    });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData.publicUrl;
  }

  // ============================================
  // ARTIFACT MANAGEMENT
  // ============================================

  /**
   * Create skill artifact from uploaded file
   */
  static async createArtifact(
    skillId: string,
    title: string,
    description: string | undefined,
    fileUrl: string,
    fileType: ArtifactFileType,
    thumbnailUrl?: string,
    fileSize?: number
  ): Promise<SkillArtifact> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('skill_artifacts')
      .insert({
        skill_id: skillId,
        title,
        description,
        file_type: fileType,
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
        file_size: fileSize,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete artifact and associated file
   */
  static async deleteArtifact(artifactId: string): Promise<void> {
    // Get artifact details
    const { data: artifact, error: fetchError } = await supabase
      .from('skill_artifacts')
      .select('file_url, thumbnail_url')
      .eq('id', artifactId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from database
    const { error: deleteError } = await supabase
      .from('skill_artifacts')
      .delete()
      .eq('id', artifactId);

    if (deleteError) throw deleteError;

    // Delete files from storage
    if (artifact?.file_url) {
      const filePath = this.extractPathFromUrl(artifact.file_url);
      await supabase.storage.from('skill-artifacts').remove([filePath]);
    }

    if (artifact?.thumbnail_url) {
      const thumbnailPath = this.extractPathFromUrl(artifact.thumbnail_url);
      await supabase.storage.from('skill-artifacts').remove([thumbnailPath]);
    }
  }

  /**
   * Get all artifacts for a skill
   */
  static async getSkillArtifacts(skillId: string): Promise<SkillArtifact[]> {
    const { data, error } = await supabase
      .from('skill_artifacts')
      .select('*')
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ============================================
  // DOCUMENT PICKER INTEGRATION
  // ============================================

  /**
   * Pick an image from device
   */
  static async pickImage(): Promise<string | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel') return null;

      return result.uri;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  }

  /**
   * Pick a document/PDF from device
   */
  static async pickDocument(): Promise<{ uri: string; name: string; mimeType: string } | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel') return null;

      return {
        uri: result.uri,
        name: result.name,
        mimeType: result.mimeType || 'application/octet-stream',
      };
    } catch (error) {
      console.error('Error picking document:', error);
      throw error;
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Extract file path from Supabase Storage URL
   */
  private static extractPathFromUrl(url: string): string {
    const urlParts = url.split('/');
    const bucketIndex = urlParts.findIndex((part) => part.includes('.supabase.co'));
    if (bucketIndex === -1 || bucketIndex + 1 >= urlParts.length) {
      throw new Error('Invalid storage URL');
    }

    return urlParts.slice(bucketIndex + 2).join('/');
  }

  /**
   * Get file size in bytes
   */
  static async getFileSize(uri: string): Promise<number> {
    const response = await fetch(uri, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? Number.parseInt(contentLength, 10) : 0;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate file type
   */
  static isValidFileType(
    mimeType: string,
    allowedTypes: ArtifactFileType[]
  ): boolean {
    const typeMap: Record<ArtifactFileType, string[]> = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      pdf: ['application/pdf'],
      document: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      video: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
    };

    return allowedTypes.some((type) => typeMap[type]?.includes(mimeType));
  }
}
