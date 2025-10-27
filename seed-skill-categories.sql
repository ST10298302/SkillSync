-- Seed skill categories with default categories
-- This populates the skill_categories table with common skill categories

-- Insert default categories
INSERT INTO skill_categories (name, description, icon) VALUES
('Art & Design', 'Visual arts, graphic design, painting, drawing, etc.', '🎨'),
('Music', 'Playing instruments, singing, music theory, composition', '🎵'),
('Sports & Fitness', 'Athletic activities, fitness, martial arts, etc.', '⚽'),
('Technology', 'Programming, software development, IT skills', '💻'),
('Languages', 'Learning foreign languages', '🌐'),
('Cooking', 'Culinary skills, baking, food preparation', '🍳'),
('Writing', 'Creative writing, journalism, storytelling', '✍️'),
('Photography', 'Digital photography, editing, visual storytelling', '📸'),
('Crafts', 'Handicrafts, DIY projects, making things', '🛠️'),
('Dance', 'Various dance styles and movement', '💃'),
('Business', 'Entrepreneurship, management, finance', '💼'),
('Science', 'Chemistry, physics, biology, research', '🔬'),
('History', 'Historical knowledge, research', '📜'),
('Philosophy', 'Critical thinking, ethics, logic', '🤔'),
('Mathematics', 'Problem solving, mathematical concepts', '📐'),
('Gardening', 'Plant care, landscaping, horticulture', '🌱'),
('Fashion', 'Clothing design, styling, textiles', '👗'),
('Theater', 'Acting, drama, performance', '🎭'),
('Film & Video', 'Video production, editing, directing', '🎬'),
('Engineering', 'Mechanical, electrical, civil engineering', '⚙️')
ON CONFLICT DO NOTHING;

-- Add comment to explain the table
COMMENT ON TABLE skill_categories IS 'Categories for organizing skills. Users can assign skills to these categories.';
