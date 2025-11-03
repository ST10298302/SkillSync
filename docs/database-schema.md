# Database Schema

This document describes the database structure for SkillSync, including table definitions, relationships, and security policies.

## Overview

SkillSync uses Supabase (PostgreSQL) (Group, P. G. D., 2025) with Row Level Security (RLS) to ensure data isolation between users. All tables are protected by RLS policies that ensure users can only access their own data (supabase, 2025).

## Table Structure

### Users Table
```sql
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Extends Supabase authentication with user profile information
**Key Features**:
- Links to Supabase auth.users table
- Stores user profile information
- Supports profile picture URLs
- Automatic timestamp management

### Skills Table
```sql
CREATE TABLE public.skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    total_hours DECIMAL(10,2) DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Stores user learning skills and progress
**Key Features**:
- Progress tracking (0-100%)
- Time tracking in hours
- Streak counting
- User ownership via foreign key

### Skill Entries Table
```sql
CREATE TABLE public.skill_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    hours DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Stores individual learning session entries
**Key Features**:
- Links to specific skills
- Text content for session notes
- Time tracking per session
- Automatic cleanup when skill is deleted

### Progress Updates Table
```sql
CREATE TABLE public.progress_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
    progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Tracks progress change history
**Key Features**:
- Historical progress tracking
- Optional notes for progress changes
- Automatic cleanup when skill is deleted

## Security Policies

### Row Level Security (RLS)
All tables have RLS enabled to ensure data isolation:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;
```

### User Access Policies
- **Users can only view their own profile**
- **Users can only manage their own skills**
- **Users can only access entries for their own skills**
- **Users can only see progress updates for their own skills**

### Storage Policies
- **Users can upload/update/delete their own profile pictures**
- **Profile pictures are publicly readable**
- **File size limited to 5MB**
- **Only image files allowed**

## Relationships

```
auth.users (Supabase)
    ↓ (1:1)
public.users
    ↓ (1:many)
public.skills
    ↓ (1:many)
public.skill_entries
    ↓ (1:many)
public.progress_updates
```

## Data Integrity

### Constraints
- **Progress values**: Must be between 0 and 100
- **Foreign keys**: Ensure referential integrity
- **Cascade deletes**: Removing a skill removes all related data

### Indexes
- **Primary keys**: UUID-based for performance
- **Foreign keys**: Indexed for join performance
- **Profile pictures**: Indexed for URL lookups

## Setup Instructions

To set up the database:

1. **Run the schema script** in Supabase SQL Editor
2. **Verify tables created** in Table Editor
3. **Check RLS policies** in Authentication → Policies
4. **Set up storage bucket** for profile pictures
5. **Test with sample data**

## Migration Notes

When updating the schema:

1. **Backup existing data** before major changes
2. **Test migrations** in development environment
3. **Update RLS policies** if adding new tables
4. **Verify data integrity** after changes

## Performance Considerations

- **UUID primary keys** provide good distribution
- **RLS policies** are optimized for user-based queries
- **Cascade deletes** maintain referential integrity
- **Indexes** support common query patterns

---

**Note**: The complete SQL schema is available in `database-schema.sql` for direct execution in Supabase.
