# Supabase Storage Setup for Profile Pictures

This guide will help you set up Supabase Storage for handling profile pictures in your SkillSync app.

## 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the following:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Check this (allows public read access)
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/*`

## 2. Set Up Storage Policies

Run these SQL commands in your Supabase SQL Editor:

### Enable RLS on storage.objects
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### Allow users to upload their own profile pictures
```sql
CREATE POLICY "Users can upload own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Allow public read access to profile pictures
```sql
CREATE POLICY "Public read access to profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### Allow users to update their own profile pictures
```sql
CREATE POLICY "Users can update own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Allow users to delete their own profile pictures
```sql
CREATE POLICY "Users can delete own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 3. Update Database Schema

Run this SQL to add the profile_picture_url column to your users table:

```sql
-- Add profile_picture_url column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create index for profile_picture_url for better query performance
CREATE INDEX IF NOT EXISTS idx_users_profile_picture_url ON public.users(profile_picture_url);

-- Add comment to the column for documentation
COMMENT ON COLUMN public.users.profile_picture_url IS 'URL to the user''s profile picture stored in Supabase Storage';
```

## 4. Test the Setup

1. Try uploading a profile picture in your app
2. Check the Storage section in Supabase Dashboard to see if files are uploaded
3. Verify the profile_picture_url is updated in the users table

## 5. Troubleshooting

### If you get "new row violates row-level security policy" error:

1. **Check bucket name**: Make sure your bucket is named exactly `avatars`
2. **Verify policies**: Run the SQL commands above in order
3. **Check file path**: The file path should be in format `{userId}/{userId}-{timestamp}.{extension}`
4. **Verify user authentication**: Make sure the user is authenticated when uploading

### If you get permission errors:

1. **Check bucket permissions**: Make sure the bucket is public
2. **Verify RLS policies**: Run the SQL commands above
3. **Check user authentication**: Ensure the user is logged in

## 6. Security Considerations

- The `avatars` bucket is public, meaning anyone can read the images
- Users can only upload/update/delete their own profile pictures
- File size is limited to 5MB
- Only image files are allowed

## 7. Performance Optimization

- Images are automatically compressed to max 512x512 pixels
- Base64 encoding is used for upload
- Images are cached with a 1-hour cache control header

## 8. File Structure

Profile pictures are stored with this structure:
```
avatars/
├── {userId}/
│   ├── {userId}-{timestamp}.jpg
│   ├── {userId}-{timestamp}.png
│   └── ...
└── ...
```

This setup ensures:
- Each user can only access their own files
- Public read access for displaying profile pictures
- Secure upload/update/delete operations
- Proper file organization
