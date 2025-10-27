-- Cleanup and Consolidate Duplicate RLS Policies
-- This script removes duplicate policies and consolidates them into clear, single policies

-- ============================================================================
-- PROGRESS_UPDATES - Remove duplicates, keep one clear policy
-- ============================================================================
DROP POLICY IF EXISTS "Users can delete own progress updates" ON progress_updates;
DROP POLICY IF EXISTS "Users can delete progress updates for own skills" ON progress_updates;
DROP POLICY IF EXISTS "Users can insert own progress updates" ON progress_updates;
DROP POLICY IF EXISTS "Users can insert progress updates for own skills" ON progress_updates;
DROP POLICY IF EXISTS "Users can update own progress updates" ON progress_updates;
DROP POLICY IF EXISTS "Users can update progress updates for own skills" ON progress_updates;
DROP POLICY IF EXISTS "Users can view own progress updates" ON progress_updates;
DROP POLICY IF EXISTS "Users can view progress updates for own skills" ON progress_updates;

-- Create consolidated policies for progress_updates
CREATE POLICY "Users can manage progress updates for their own skills"
ON progress_updates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM skills
    WHERE skills.id = progress_updates.skill_id
    AND skills.user_id = auth.uid()
  )
);

-- ============================================================================
-- SKILL_ENTRIES - Remove duplicates, keep one clear policy
-- ============================================================================
DROP POLICY IF EXISTS "Users can delete entries for own skills" ON skill_entries;
DROP POLICY IF EXISTS "Users can delete own skill entries" ON skill_entries;
DROP POLICY IF EXISTS "Users can insert entries for own skills" ON skill_entries;
DROP POLICY IF EXISTS "Users can insert own skill entries" ON skill_entries;
DROP POLICY IF EXISTS "Users can update entries for own skills" ON skill_entries;
DROP POLICY IF EXISTS "Users can update own skill entries" ON skill_entries;
DROP POLICY IF EXISTS "Users can view entries for own skills" ON skill_entries;
DROP POLICY IF EXISTS "Users can view own skill entries" ON skill_entries;

-- Create consolidated policy for skill_entries
CREATE POLICY "Users can manage diary entries for their own skills"
ON skill_entries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM skills
    WHERE skills.id = skill_entries.skill_id
    AND skills.user_id = auth.uid()
  )
);

-- ============================================================================
-- SKILL_COMMENTS - Remove duplicates, keep clear policies
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view comments on accessible skills" ON skill_comments;
DROP POLICY IF EXISTS "Anyone can view comments on public skills" ON skill_comments;
DROP POLICY IF EXISTS "Users can create comments on accessible skills" ON skill_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON skill_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON skill_comments;

-- Keep and rename the authenticated policies for clarity
DROP POLICY IF EXISTS "Users can create comments" ON skill_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON skill_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON skill_comments;

-- Create consolidated policies for skill_comments
CREATE POLICY "Authenticated users can view comments on accessible skills"
ON skill_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM skills
    WHERE skills.id = skill_comments.skill_id
    AND (
      skills.user_id = auth.uid()
      OR skills.visibility = 'public'
      OR skills.visibility = 'tutor' AND EXISTS (
        SELECT 1 FROM tutor_students
        WHERE (tutor_students.tutor_id = skills.user_id AND tutor_students.student_id = auth.uid())
           OR (tutor_students.tutor_id = auth.uid() AND tutor_students.student_id = skills.user_id)
      )
      OR skills.visibility = 'students' AND EXISTS (
        SELECT 1 FROM tutor_students
        WHERE tutor_students.tutor_id = auth.uid() AND tutor_students.student_id = skills.user_id
      )
    )
  )
);

CREATE POLICY "Users can create comments on accessible skills"
ON skill_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM skills
    WHERE skills.id = skill_comments.skill_id
    AND (
      skills.visibility = 'public'
      OR skills.visibility = 'tutor' AND EXISTS (
        SELECT 1 FROM tutor_students
        WHERE (tutor_students.tutor_id = skills.user_id AND tutor_students.student_id = auth.uid())
           OR (tutor_students.tutor_id = auth.uid() AND tutor_students.student_id = skills.user_id)
      )
      OR skills.visibility = 'students' AND EXISTS (
        SELECT 1 FROM tutor_students
        WHERE tutor_students.tutor_id = auth.uid() AND tutor_students.student_id = skills.user_id
      )
    )
  )
);

CREATE POLICY "Users can update their own comments"
ON skill_comments FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
ON skill_comments FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- USER_FOLLOWS - Remove duplicate "Anyone can view follows"
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view follows" ON user_follows;

-- Keep "Users can view follows" as it's more explicit

-- ============================================================================
-- SKILLS - Remove duplicates, keep the most comprehensive policy
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own skills" ON skills;

-- Keep "Users can view their own and public skills" and "Users can manage their own skills"
DROP POLICY IF EXISTS "Users can insert own skills" ON skills;
DROP POLICY IF EXISTS "Users can update own skills" ON skills;
DROP POLICY IF EXISTS "Users can delete own skills" ON skills;

-- The "Users can manage their own skills" policy already covers INSERT, UPDATE, DELETE
-- No need for separate policies

-- ============================================================================
-- SKILL_MILESTONES - Remove duplicate "Users can manage their own skill milestones"
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own skill milestones" ON skill_milestones;

-- Keep "Users can manage their own skill milestones" as it covers all operations

-- ============================================================================
-- USERS - Remove duplicate "Users can view own profile" (already has full access)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Keep "Allow reading user info for public skills" as it's more specific

-- ============================================================================
-- Summary of remaining policies
-- ============================================================================
-- After cleanup, each table should have:
-- - progress_updates: 1 policy (ALL operations)
-- - skill_entries: 1 policy (ALL operations)
-- - skill_comments: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- - skill_reactions: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- - skills: 2 policies (SELECT for all accessible, ALL for own)
-- - skill_milestones: 1 policy (ALL operations)
-- - user_follows: 3 policies (SELECT, INSERT, DELETE)
-- - users: 4 policies (SELECT, INSERT, UPDATE, DELETE)

COMMENT ON POLICY "Users can manage progress updates for their own skills" ON progress_updates 
IS 'Consolidated policy: Users can perform all operations on progress updates for their own skills';

COMMENT ON POLICY "Users can manage diary entries for their own skills" ON skill_entries 
IS 'Consolidated policy: Users can perform all operations on diary entries for their own skills';
