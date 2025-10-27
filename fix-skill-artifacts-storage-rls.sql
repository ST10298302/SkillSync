-- Fix: Add RLS policies for skill-artifacts storage bucket
-- This fixes the error: "new row violates row-level security policy" when uploading artifact images
-- Run this in Supabase SQL Editor

-- IMPORTANT: This may fail with "must be owner of table objects" error
-- If that happens, you MUST create these policies via the Supabase Dashboard:
-- 1. Go to Storage > skill-artifacts bucket > Policies tab
-- 2. Click "New Policy" and copy the expressions below

-- Policy 1: Users can upload artifacts to their own folder
CREATE POLICY IF NOT EXISTS "Users can upload skill artifacts"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'skill-artifacts' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy 2: Anyone can read skill artifacts (public access)
CREATE POLICY IF NOT EXISTS "Public read access to skill artifacts"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'skill-artifacts');

-- Policy 3: Users can update their own skill artifacts
CREATE POLICY IF NOT EXISTS "Users can update own skill artifacts"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'skill-artifacts' AND
        auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'skill-artifacts' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy 4: Users can delete their own skill artifacts
CREATE POLICY IF NOT EXISTS "Users can delete own skill artifacts"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'skill-artifacts' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
