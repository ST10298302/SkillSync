-- Add profile_picture_url column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create storage bucket for profile pictures (avatars)
-- Note: This needs to be done in the Supabase dashboard or via API
-- The bucket should be named 'avatars' with public access

-- Update RLS policies to allow users to update their profile_picture_url
-- The existing policies should already cover this since they allow users to update their own profile

-- Create index for profile_picture_url for better query performance
CREATE INDEX IF NOT EXISTS idx_users_profile_picture_url ON public.users(profile_picture_url);

-- Add comment to the column for documentation
COMMENT ON COLUMN public.users.profile_picture_url IS 'URL to the user''s profile picture stored in Supabase Storage';
