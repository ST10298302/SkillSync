-- Fix: Add UPDATE policy for skill_reactions table
-- This fixes the error: "Cannot coerce the result to a single JSON object"
-- when trying to update an existing reaction

-- Drop the policy if it already exists
DROP POLICY IF EXISTS "Users can update their own reactions" ON skill_reactions;

-- Create the UPDATE policy for skill_reactions
CREATE POLICY "Users can update their own reactions"
    ON skill_reactions FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
