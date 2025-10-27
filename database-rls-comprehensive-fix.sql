-- Comprehensive RLS Policy Fix for SkillSync Platform
-- Run this in your Supabase SQL editor to fix all RLS policy issues

-- ============================================
-- SKILL TECHNIQUES RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view techniques for accessible skills" ON skill_techniques;
DROP POLICY IF EXISTS "Users can manage techniques for their skills" ON skill_techniques;

-- Users can view techniques for skills they own or skills accessible to them
CREATE POLICY "Users can view techniques for accessible skills"
    ON skill_techniques FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_techniques.skill_id
            AND (
                s.user_id = auth.uid()
                OR s.visibility = 'public'::skill_visibility
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = s.user_id 
                    AND student_id = auth.uid()
                ))
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
                OR (s.visibility = 'students'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
            )
        )
    );

-- Drop existing policy
-- DROP POLICY IF EXISTS already done above

-- Users can manage techniques for skills they own
CREATE POLICY "Users can manage techniques for their skills"
    ON skill_techniques FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_techniques.skill_id
            AND s.user_id = auth.uid()
        )
    );

-- ============================================
-- SKILL CHALLENGES RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view challenges for accessible skills" ON skill_challenges;
DROP POLICY IF EXISTS "Users can manage challenges for their skills" ON skill_challenges;

-- Users can view challenges for skills they own or skills accessible to them
CREATE POLICY "Users can view challenges for accessible skills"
    ON skill_challenges FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_challenges.skill_id
            AND (
                s.user_id = auth.uid()
                OR s.visibility = 'public'::skill_visibility
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = s.user_id 
                    AND student_id = auth.uid()
                ))
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
                OR (s.visibility = 'students'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
            )
        )
    );

-- Drop existing policy
-- DROP POLICY IF EXISTS already done above

-- Users can manage challenges for skills they own
CREATE POLICY "Users can manage challenges for their skills"
    ON skill_challenges FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_challenges.skill_id
            AND s.user_id = auth.uid()
        )
    );

-- ============================================
-- SKILL RESOURCES RLS POLICIES (Enhanced)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view resources for their skills" ON skill_resources;
DROP POLICY IF EXISTS "Users can view resources for accessible skills" ON skill_resources;
DROP POLICY IF EXISTS "Users can manage resources for their skills" ON skill_resources;

-- Users can view resources for accessible skills
CREATE POLICY "Users can view resources for accessible skills"
    ON skill_resources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_resources.skill_id
            AND (
                s.user_id = auth.uid()
                OR s.visibility = 'public'::skill_visibility
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = s.user_id 
                    AND student_id = auth.uid()
                ))
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
                OR (s.visibility = 'students'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
            )
        )
    );

-- Drop existing policy
-- DROP POLICY IF EXISTS already done above

-- Users can manage resources for their skills
CREATE POLICY "Users can manage resources for their skills"
    ON skill_resources FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_resources.skill_id
            AND s.user_id = auth.uid()
        )
    );

-- ============================================
-- SKILL ARTIFACTS RLS POLICIES (Enhanced)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view artifacts for their skills" ON skill_artifacts;
DROP POLICY IF EXISTS "Users can view artifacts for accessible skills" ON skill_artifacts;
DROP POLICY IF EXISTS "Users can manage artifacts for their skills" ON skill_artifacts;

-- Users can view artifacts for accessible skills
CREATE POLICY "Users can view artifacts for accessible skills"
    ON skill_artifacts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_artifacts.skill_id
            AND (
                s.user_id = auth.uid()
                OR s.visibility = 'public'::skill_visibility
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = s.user_id 
                    AND student_id = auth.uid()
                ))
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
                OR (s.visibility = 'students'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
            )
        )
    );

-- Drop existing policy
-- DROP POLICY IF EXISTS already done above

-- Users can manage artifacts for their skills
CREATE POLICY "Users can manage artifacts for their skills"
    ON skill_artifacts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_artifacts.skill_id
            AND s.user_id = auth.uid()
        )
    );

-- ============================================
-- SKILL LEVELS RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view levels for accessible skills" ON skill_levels;
DROP POLICY IF EXISTS "Users can manage levels for their skills" ON skill_levels;

-- Users can view levels for accessible skills
CREATE POLICY "Users can view levels for accessible skills"
    ON skill_levels FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_levels.skill_id
            AND (
                s.user_id = auth.uid()
                OR s.visibility = 'public'::skill_visibility
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = s.user_id 
                    AND student_id = auth.uid()
                ))
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
                OR (s.visibility = 'students'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
            )
        )
    );

-- Drop existing policy
-- DROP POLICY IF EXISTS already done above

-- Users can manage levels for their skills
CREATE POLICY "Users can manage levels for their skills"
    ON skill_levels FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_levels.skill_id
            AND s.user_id = auth.uid()
        )
    );

-- ============================================
-- SKILL DEPENDENCIES RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view dependencies for accessible skills" ON skill_dependencies;
DROP POLICY IF EXISTS "Users can manage dependencies for their skills" ON skill_dependencies;

-- Users can view dependencies for accessible skills
CREATE POLICY "Users can view dependencies for accessible skills"
    ON skill_dependencies FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_dependencies.skill_id
            AND (
                s.user_id = auth.uid()
                OR s.visibility = 'public'::skill_visibility
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = s.user_id 
                    AND student_id = auth.uid()
                ))
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
                OR (s.visibility = 'students'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
            )
        )
    );

-- Drop existing policy
-- DROP POLICY IF EXISTS already done above

-- Users can manage dependencies for their skills
CREATE POLICY "Users can manage dependencies for their skills"
    ON skill_dependencies FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_dependencies.skill_id
            AND s.user_id = auth.uid()
        )
    );

-- ============================================
-- COMMENTS - Update to handle public skills
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view comments on public skills" ON skill_comments;
DROP POLICY IF EXISTS "Anyone can view comments on accessible skills" ON skill_comments;
DROP POLICY IF EXISTS "Users can create comments" ON skill_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON skill_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON skill_comments;

CREATE POLICY "Anyone can view comments on accessible skills"
    ON skill_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_comments.skill_id
            AND (
                s.user_id = auth.uid()
                OR s.visibility = 'public'::skill_visibility
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = s.user_id 
                    AND student_id = auth.uid()
                ))
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
                OR (s.visibility = 'students'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
            )
        )
    );

-- Users can create comments on accessible skills
CREATE POLICY "Users can create comments on accessible skills"
    ON skill_comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM skills s
            WHERE s.id = skill_comments.skill_id
            AND (
                s.visibility = 'public'::skill_visibility
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = s.user_id 
                    AND student_id = auth.uid()
                ))
                OR (s.visibility = 'tutor'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
                OR (s.visibility = 'students'::skill_visibility AND EXISTS (
                    SELECT 1 FROM tutor_students 
                    WHERE tutor_id = auth.uid() 
                    AND student_id = s.user_id
                ))
            )
        )
    );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
    ON skill_comments FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
    ON skill_comments FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- NOTIFICATIONS RLS POLICIES
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

-- System can create notifications for users
CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================
-- USER FOLLOWS RLS POLICIES
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view follows" ON user_follows;
DROP POLICY IF EXISTS "Users can follow other users" ON user_follows;
DROP POLICY IF EXISTS "Users can unfollow" ON user_follows;

-- Users can view all follows (for checking relationships and public feeds)
CREATE POLICY "Users can view follows"
    ON user_follows FOR SELECT
    USING (true);

-- Users can only follow other users (insert their own follow relationships)
CREATE POLICY "Users can follow other users"
    ON user_follows FOR INSERT
    WITH CHECK (follower_id = auth.uid());

-- Users can only unfollow (delete their own follow relationships)
CREATE POLICY "Users can unfollow"
    ON user_follows FOR DELETE
    USING (follower_id = auth.uid());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- To verify policies were created, run:
-- SELECT * FROM pg_policies 
-- WHERE tablename IN ('skill_techniques', 'skill_challenges', 'skill_resources', 'skill_artifacts');

