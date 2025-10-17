-- Add privacy and security settings columns to users table
-- Run this in your Supabase SQL editor

-- Add privacy settings columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends')),
ADD COLUMN IF NOT EXISTS show_progress BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_streaks BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_analytics BOOLEAN DEFAULT true;

-- Add security settings columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS biometric_auth BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS require_pin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_lock BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS session_timeout TEXT DEFAULT '30min' CHECK (session_timeout IN ('5min', '15min', '30min', '1hour', 'never'));

-- Update existing users with default values
UPDATE users 
SET 
  profile_visibility = COALESCE(profile_visibility, 'public'),
  show_progress = COALESCE(show_progress, true),
  show_streaks = COALESCE(show_streaks, true),
  allow_analytics = COALESCE(allow_analytics, true),
  biometric_auth = COALESCE(biometric_auth, false),
  require_pin = COALESCE(require_pin, false),
  auto_lock = COALESCE(auto_lock, true),
  session_timeout = COALESCE(session_timeout, '30min')
WHERE 
  profile_visibility IS NULL 
  OR show_progress IS NULL 
  OR show_streaks IS NULL 
  OR allow_analytics IS NULL
  OR biometric_auth IS NULL
  OR require_pin IS NULL
  OR auto_lock IS NULL
  OR session_timeout IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_profile_visibility ON users(profile_visibility);
CREATE INDEX IF NOT EXISTS idx_users_require_pin ON users(require_pin);
