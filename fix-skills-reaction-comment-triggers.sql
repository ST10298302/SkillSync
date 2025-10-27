-- Add triggers to update likes_count and comments_count on skills table
-- This ensures that the counts stay in sync when reactions/comments are added or removed

-- Function to update reaction count
CREATE OR REPLACE FUNCTION update_skill_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE skills
    SET likes_count = (
      SELECT COUNT(*)
      FROM skill_reactions
      WHERE skill_id = NEW.skill_id
    )
    WHERE id = NEW.skill_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE skills
    SET likes_count = (
      SELECT COUNT(*)
      FROM skill_reactions
      WHERE skill_id = OLD.skill_id
    )
    WHERE id = OLD.skill_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_skill_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE skills
    SET comments_count = (
      SELECT COUNT(*)
      FROM skill_comments
      WHERE skill_id = NEW.skill_id
      AND parent_comment_id IS NULL  -- Only count top-level comments
    )
    WHERE id = NEW.skill_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE skills
    SET comments_count = (
      SELECT COUNT(*)
      FROM skill_comments
      WHERE skill_id = OLD.skill_id
      AND parent_comment_id IS NULL  -- Only count top-level comments
    )
    WHERE id = OLD.skill_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_skill_reaction_count_insert ON skill_reactions;
DROP TRIGGER IF EXISTS trigger_update_skill_reaction_count_delete ON skill_reactions;
DROP TRIGGER IF EXISTS trigger_update_skill_comment_count_insert ON skill_comments;
DROP TRIGGER IF EXISTS trigger_update_skill_comment_count_delete ON skill_comments;

-- Create triggers for reactions
CREATE TRIGGER trigger_update_skill_reaction_count_insert
  AFTER INSERT OR UPDATE ON skill_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_reaction_count();

CREATE TRIGGER trigger_update_skill_reaction_count_delete
  AFTER DELETE ON skill_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_reaction_count();

-- Create triggers for comments
CREATE TRIGGER trigger_update_skill_comment_count_insert
  AFTER INSERT OR UPDATE ON skill_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_comment_count();

CREATE TRIGGER trigger_update_skill_comment_count_delete
  AFTER DELETE ON skill_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_comment_count();

-- Also, initialize existing counts for all skills
UPDATE skills
SET likes_count = (
  SELECT COUNT(*)
  FROM skill_reactions
  WHERE skill_reactions.skill_id = skills.id
),
comments_count = (
  SELECT COUNT(*)
  FROM skill_comments
  WHERE skill_comments.skill_id = skills.id
  AND parent_comment_id IS NULL
);

COMMENT ON FUNCTION update_skill_reaction_count() IS 'Automatically updates likes_count on skills table when reactions are added, updated, or removed';
COMMENT ON FUNCTION update_skill_comment_count() IS 'Automatically updates comments_count on skills table when comments are added, updated, or removed';
