-- SkillSync Platform Enhancement Database Migration
-- Run this in your Supabase SQL editor
-- This creates all necessary tables for advanced skill tracking, tutor-student system, social features, and gamification

-- ============================================
-- ENUMS AND TYPES
-- ============================================

-- User roles enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('learner', 'tutor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Skill visibility enum
DO $$ BEGIN
    CREATE TYPE skill_visibility AS ENUM ('public', 'private', 'students', 'tutor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Reaction types enum
DO $$ BEGIN
    CREATE TYPE reaction_type AS ENUM ('like', 'love', 'celebrate', 'insightful', 'motivate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Skill level enum
DO $$ BEGIN
    CREATE TYPE skill_level_type AS ENUM ('beginner', 'novice', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification type enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('comment', 'like', 'mention', 'assignment', 'milestone', 'achievement', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Achievement category enum
DO $$ BEGIN
    CREATE TYPE achievement_category AS ENUM ('consistency', 'milestone', 'mastery', 'social', 'explorer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- ENHANCED EXISTING TABLES
-- ============================================

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'learner',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS tutor_specializations TEXT[],
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Add new columns to skills table
ALTER TABLE skills
ADD COLUMN IF NOT EXISTS category_id UUID,
ADD COLUMN IF NOT EXISTS level_id UUID,
ADD COLUMN IF NOT EXISTS visibility skill_visibility DEFAULT 'private',
ADD COLUMN IF NOT EXISTS is_certified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level skill_level_type DEFAULT 'beginner';

-- ============================================
-- NEW CORE TABLES
-- ============================================

-- Skill Categories
CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES skill_categories(id) ON DELETE CASCADE,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Levels (Competency Framework)
CREATE TABLE IF NOT EXISTS skill_levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level_type skill_level_type NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    min_progress INTEGER DEFAULT 0,
    max_progress INTEGER DEFAULT 100,
    required_hours DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Milestones
CREATE TABLE IF NOT EXISTS skill_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Dependencies (Prerequisites)
CREATE TABLE IF NOT EXISTS skill_dependencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    prerequisite_skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(skill_id, prerequisite_skill_id)
);

-- Skill Resources
CREATE TABLE IF NOT EXISTS skill_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL, -- 'link', 'document', 'video', 'article'
    url TEXT,
    file_url TEXT,
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Artifacts (Evidence)
CREATE TABLE IF NOT EXISTS skill_artifacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_type TEXT NOT NULL, -- 'image', 'pdf', 'document', 'video'
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Techniques (Methods Practiced)
CREATE TABLE IF NOT EXISTS skill_techniques (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    technique_name TEXT NOT NULL,
    description TEXT,
    practice_hours DECIMAL(5,2) DEFAULT 0,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Challenges (Obstacles)
CREATE TABLE IF NOT EXISTS skill_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    challenge_title TEXT NOT NULL,
    challenge_description TEXT,
    solution TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TUTOR-STUDENT SYSTEM
-- ============================================

-- Tutor-Student Relationships
CREATE TABLE IF NOT EXISTS tutor_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed'
    notes TEXT,
    UNIQUE(tutor_id, student_id)
);

-- Assignments (Tutor assigns skills to students)
CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SOCIAL FEATURES
-- ============================================

-- Skill Comments
CREATE TABLE IF NOT EXISTS skill_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES skill_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mentions UUID[], -- Array of user IDs mentioned
    edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Reactions (Likes)
CREATE TABLE IF NOT EXISTS skill_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type reaction_type NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(skill_id, user_id)
);

-- Comment Reactions
CREATE TABLE IF NOT EXISTS comment_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES skill_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type reaction_type NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- User Follows
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    related_skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- GAMIFICATION
-- ============================================

-- Achievements (Badge Definitions)
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category achievement_category NOT NULL,
    requirements JSONB, -- Flexible requirement structure
    rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    is_unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Learning Paths
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false,
    skill_count INTEGER DEFAULT 0,
    estimated_hours DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Path Skills (Skills in a learning path)
CREATE TABLE IF NOT EXISTS learning_path_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(path_id, skill_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);

-- Skill indexes
CREATE INDEX IF NOT EXISTS idx_skills_visibility ON skills(visibility);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_level ON skills(level_id);
CREATE INDEX IF NOT EXISTS idx_skills_current_level ON skills(current_level);

-- Tutor-Student indexes
CREATE INDEX IF NOT EXISTS idx_tutor_students_tutor ON tutor_students(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_students_student ON tutor_students(student_id);
CREATE INDEX IF NOT EXISTS idx_tutor_students_status ON tutor_students(status);

-- Assignment indexes
CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_tutor ON assignments(tutor_id);
CREATE INDEX IF NOT EXISTS idx_assignments_completed ON assignments(is_completed);

-- Social indexes
CREATE INDEX IF NOT EXISTS idx_comments_skill ON skill_comments(skill_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON skill_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_skill ON skill_reactions(skill_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON skill_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON user_follows(following_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on skills table (if not already enabled)
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Add policy to allow viewing public skills (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'skills' 
        AND policyname = 'Allow viewing public skills'
    ) THEN
        CREATE POLICY "Allow viewing public skills"
            ON skills FOR SELECT
            USING (visibility = 'public'::skill_visibility OR user_id = auth.uid());
    END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_skills ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Users can only access their own data)
-- Note: More complex policies will be created per table in application logic

-- Skill Milestones
CREATE POLICY "Users can view their own skill milestones"
    ON skill_milestones FOR SELECT
    USING (skill_id IN (SELECT id FROM skills WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own skill milestones"
    ON skill_milestones FOR ALL
    USING (skill_id IN (SELECT id FROM skills WHERE user_id = auth.uid()));

-- Skill Resources
CREATE POLICY "Users can view resources for their skills"
    ON skill_resources FOR SELECT
    USING (skill_id IN (SELECT id FROM skills WHERE user_id = auth.uid()) OR
           skill_id IN (
               SELECT s.id FROM skills s
               JOIN assignments a ON a.skill_id = s.id
               WHERE a.tutor_id = auth.uid() OR a.student_id = auth.uid()
           ));

-- Skill Artifacts
CREATE POLICY "Users can view artifacts for their skills"
    ON skill_artifacts FOR SELECT
    USING (skill_id IN (SELECT id FROM skills WHERE user_id = auth.uid()) OR
           skill_id IN (
               SELECT s.id FROM skills s
               JOIN assignments a ON a.skill_id = s.id
               WHERE a.tutor_id = auth.uid() OR a.student_id = auth.uid()
           ));

-- Tutor-Student Relationship
CREATE POLICY "Users can view their tutor-student relationships"
    ON tutor_students FOR SELECT
    USING (tutor_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "Tutors can create student relationships"
    ON tutor_students FOR INSERT
    WITH CHECK (
        tutor_id = auth.uid() 
        AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'tutor'::user_role)
    );

-- Assignments
CREATE POLICY "Users can view assignments they created or received"
    ON assignments FOR SELECT
    USING (tutor_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "Tutors can create assignments"
    ON assignments FOR INSERT
    WITH CHECK (
        tutor_id = auth.uid() 
        AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'tutor'::user_role)
    );

-- Comments
CREATE POLICY "Anyone can view comments on public skills"
    ON skill_comments FOR SELECT
    USING (skill_id IN (SELECT id FROM skills WHERE visibility = 'public' OR user_id = auth.uid()));

CREATE POLICY "Users can create comments"
    ON skill_comments FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
    ON skill_comments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
    ON skill_comments FOR DELETE
    USING (user_id = auth.uid());

-- Reactions
CREATE POLICY "Anyone can view reactions"
    ON skill_reactions FOR SELECT
    USING (true);

CREATE POLICY "Users can add reactions"
    ON skill_reactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reactions"
    ON skill_reactions FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own reactions"
    ON skill_reactions FOR DELETE
    USING (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- User Follows
CREATE POLICY "Anyone can view follows"
    ON user_follows FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own follows"
    ON user_follows FOR ALL
    USING (follower_id = auth.uid());

-- Achievements
CREATE POLICY "Anyone can view public achievements"
    ON achievements FOR SELECT
    USING (true);

-- User Achievements
CREATE POLICY "Users can view any user's achievements"
    ON user_achievements FOR SELECT
    USING (true);

CREATE POLICY "System can create user achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Learning Paths
CREATE POLICY "Users can view public learning paths or their own"
    ON learning_paths FOR SELECT
    USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create learning paths"
    ON learning_paths FOR INSERT
    WITH CHECK (created_by = auth.uid());

-- ============================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- ============================================

-- Function to update comment count on skills
CREATE OR REPLACE FUNCTION update_skill_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE skills 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.skill_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE skills 
        SET comments_count = GREATEST(0, comments_count - 1) 
        WHERE id = OLD.skill_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment count
CREATE TRIGGER trigger_update_skill_comments_count
    AFTER INSERT OR DELETE ON skill_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_skill_comments_count();

-- Function to update likes count on skills
CREATE OR REPLACE FUNCTION update_skill_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE skills 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.skill_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE skills 
        SET likes_count = GREATEST(0, likes_count - 1) 
        WHERE id = OLD.skill_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes count
CREATE TRIGGER trigger_update_skill_likes_count
    AFTER INSERT OR DELETE ON skill_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_skill_likes_count();

-- Function to update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
        UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for follow counts
CREATE TRIGGER trigger_update_follow_counts
    AFTER INSERT OR DELETE ON user_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follow_counts();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE skill_milestones IS 'Sub-goals within skills for granular progress tracking';
COMMENT ON TABLE skill_dependencies IS 'Prerequisites and learning path relationships between skills';
COMMENT ON TABLE skill_resources IS 'Learning materials and resources associated with skills';
COMMENT ON TABLE skill_artifacts IS 'Evidence and proof of skill acquisition (images, certificates, etc.)';
COMMENT ON TABLE tutor_students IS 'Relationship between tutors and their students';
COMMENT ON TABLE assignments IS 'Tasks assigned by tutors to students for specific skills';
COMMENT ON TABLE skill_comments IS 'Social commenting system for skills';
COMMENT ON TABLE skill_reactions IS 'Like and reaction system for skills';
COMMENT ON TABLE achievements IS 'Gamification badges and achievements';
COMMENT ON TABLE learning_paths IS 'Curated sequences of skills for guided learning';
