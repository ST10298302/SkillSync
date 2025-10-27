-- Fix RLS Policy for Public Skills Access
-- Run this in your Supabase SQL editor

-- Enable RLS on skills table (if not already enabled)
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Drop the existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow viewing public skills" ON skills;
DROP POLICY IF EXISTS "Users can view their own skills" ON skills;

-- Create comprehensive skills viewing policy
CREATE POLICY "Users can view their own and public skills"
    ON skills FOR SELECT
    USING (
        -- Users can view their own skills
        user_id = auth.uid() 
        OR 
        -- Anyone can view public skills
        visibility = 'public'::skill_visibility
        OR
        -- Users can view skills visible to their tutor
        (visibility = 'tutor'::skill_visibility AND EXISTS (
            SELECT 1 FROM tutor_students 
            WHERE tutor_id = skills.user_id 
            AND student_id = auth.uid()
        ))
        OR
        -- Tutors can view their students' skills visible to tutor
        (visibility = 'tutor'::skill_visibility AND EXISTS (
            SELECT 1 FROM tutor_students 
            WHERE tutor_id = auth.uid() 
            AND student_id = skills.user_id
        ))
        OR
        -- Users can view skills visible to their students
        (visibility = 'students'::skill_visibility AND EXISTS (
            SELECT 1 FROM tutor_students 
            WHERE tutor_id = auth.uid() 
            AND student_id = skills.user_id
        ))
    );

-- Allow users to manage their own skills
CREATE POLICY "Users can manage their own skills"
    ON skills FOR ALL
    USING (user_id = auth.uid());
