-- Add completed_levels column to skills table
-- This tracks all the levels a user has completed for a skill (e.g., ['beginner'] means they completed beginner level)

ALTER TABLE skills
ADD COLUMN IF NOT EXISTS completed_levels skill_level_type[] DEFAULT '{}';

-- Create an index for efficient querying
CREATE INDEX IF NOT EXISTS idx_skills_completed_levels ON skills USING GIN(completed_levels);

-- Add a comment to explain the column
COMMENT ON COLUMN skills.completed_levels IS 'Array of skill levels the user has completed for this skill';
