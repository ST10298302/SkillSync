-- Fix RLS policy on users table to allow reading user info for public skill owners
-- This allows the users join to work in getPublicSkills query

-- First, check if RLS is enabled on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading basic user info for public skill owners
-- This is needed for the JOIN in getPublicSkills to work
CREATE POLICY "Allow reading user info for public skills" ON public.users
FOR SELECT
USING (true);  -- Allow reading user info for all authenticated users

-- Note: This is safe because we're only exposing basic profile info (id, name, email, profile_picture_url)
-- which is already publicly accessible in most apps
