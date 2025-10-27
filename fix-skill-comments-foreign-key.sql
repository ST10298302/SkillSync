-- Fix: Add explicit foreign key constraint for skill_comments.user_id -> auth.users.id
-- This fixes the PostgREST error: "Could not find a relationship between 'skill_comments' and 'users'"

-- First, check if the constraint already exists but with a different name
-- Drop any existing constraint first
ALTER TABLE skill_comments DROP CONSTRAINT IF EXISTS skill_comments_user_id_fkey;
ALTER TABLE skill_comments DROP CONSTRAINT IF EXISTS skill_comments_user_id_users_id_fk;

-- Add the foreign key constraint with the exact name that PostgREST expects
ALTER TABLE skill_comments
ADD CONSTRAINT skill_comments_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add a comment to document this constraint
COMMENT ON CONSTRAINT skill_comments_user_id_fkey ON skill_comments IS 
'Foreign key relationship that PostgREST uses to join skill_comments with users table';
