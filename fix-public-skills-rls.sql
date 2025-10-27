-- Fix RLS policy to allow viewing public skills
-- This updates the existing policy to explicitly allow viewing skills where visibility = 'public'

CREATE OR REPLACE POLICY "Users can view their own and public skills" ON public.skills
FOR SELECT
USING (
  auth.uid() = user_id 
  OR visibility = 'public'
);
