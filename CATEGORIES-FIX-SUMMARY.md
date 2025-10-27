# Fix for Empty Categories on Edit Skill Page

## Problem
When editing a skill, the "Category (Optional)" dropdown only showed "None" with no other category options available.

## Root Cause
The `skill_categories` table existed in the database but had no records, so when the edit page tried to load categories, it received an empty array.

## Solution
Created a SQL seed file to populate the `skill_categories` table with 20 common skill categories.

### Files Created
- **`seed-skill-categories.sql`**: SQL file containing INSERT statements for 20 default categories

### Categories Added
1. Art & Design 🎨
2. Music 🎵
3. Sports & Fitness ⚽
4. Technology 💻
5. Languages 🌐
6. Cooking 🍳
7. Writing ✍️
8. Photography 📸
9. Crafts 🛠️
10. Dance 💃
11. Business 💼
12. Science 🔬
13. History 📜
14. Philosophy 🤔
15. Mathematics 📐
16. Gardening 🌱
17. Fashion 👗
18. Theater 🎭
19. Film & Video 🎬
20. Engineering ⚙️

### UI Enhancement
Updated `app/skill/[id]/edit.tsx` to display category icons alongside the category names for better visual identification.

## How to Apply
Run the SQL file in your Supabase SQL Editor:
```sql
-- See seed-skill-categories.sql
```

The `ON CONFLICT DO NOTHING` clause ensures the script can be run multiple times without creating duplicates.

## Benefits
1. **Better Organization**: Users can now categorize their skills
2. **Visual Identification**: Icons make it easier to find categories
3. **Scalable**: More categories can be added as needed
4. **Safe**: Uses `ON CONFLICT DO NOTHING` to prevent duplicates
