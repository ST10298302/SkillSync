-- Fix: Add RLS policy for skill_comments table to allow authenticated users to create comments
-- This fixes the error: "new row violates row-level security policy for table "skill_comments""

-- Drop any existing INSERT policy for skill_comments that might be causing issues
DROP POLICY IF EXISTS "Users can create comments" ON skill_comments;
DROP POLICY IF EXISTS "Allow authenticated users to insert comments" ON skill_comments;

-- Create a new RLS policy to allow authenticated users to insert comments
-- This assumes the 'skill_comments' table has a 'user_id' column that stores the ID of the user who created the comment.
CREATE POLICY "Users can create comments"
ON skill_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view comments on public skills" ON skill_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON skill_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON skill_comments;

-- Allow authenticated users to select (read) all comments on public skills
CREATE POLICY "Anyone can view comments on public skills"
ON skill_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM skills
    WHERE skills.id = skill_comments.skill_id
    AND (skills.visibility = 'public' OR skills.user_id = auth.uid())
  )
);

-- Allow users to update their own comments
CREATE POLICY "Users can update own comments"
ON skill_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete own comments"
ON skill_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
