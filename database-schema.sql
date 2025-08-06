-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
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

-- Create skill_entries table
CREATE TABLE IF NOT EXISTS public.skill_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    hours DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress_updates table
CREATE TABLE IF NOT EXISTS public.progress_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
    progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for skills table
CREATE POLICY "Users can view own skills" ON public.skills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills" ON public.skills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" ON public.skills
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills" ON public.skills
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for skill_entries table
CREATE POLICY "Users can view entries for own skills" ON public.skill_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.skills 
            WHERE skills.id = skill_entries.skill_id 
            AND skills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert entries for own skills" ON public.skill_entries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.skills 
            WHERE skills.id = skill_entries.skill_id 
            AND skills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update entries for own skills" ON public.skill_entries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.skills 
            WHERE skills.id = skill_entries.skill_id 
            AND skills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete entries for own skills" ON public.skill_entries
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.skills 
            WHERE skills.id = skill_entries.skill_id 
            AND skills.user_id = auth.uid()
        )
    );

-- Create RLS policies for progress_updates table
CREATE POLICY "Users can view progress updates for own skills" ON public.progress_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.skills 
            WHERE skills.id = progress_updates.skill_id 
            AND skills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert progress updates for own skills" ON public.progress_updates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.skills 
            WHERE skills.id = progress_updates.skill_id 
            AND skills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update progress updates for own skills" ON public.progress_updates
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.skills 
            WHERE skills.id = progress_updates.skill_id 
            AND skills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete progress updates for own skills" ON public.progress_updates
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.skills 
            WHERE skills.id = progress_updates.skill_id 
            AND skills.user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_entries_skill_id ON public.skill_entries(skill_id);
CREATE INDEX IF NOT EXISTS idx_progress_updates_skill_id ON public.progress_updates(skill_id);
CREATE INDEX IF NOT EXISTS idx_skills_created_at ON public.skills(created_at);
CREATE INDEX IF NOT EXISTS idx_skill_entries_created_at ON public.skill_entries(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON public.skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update skill's last_updated when entries are added
CREATE OR REPLACE FUNCTION update_skill_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.skills 
    SET last_updated = NOW() 
    WHERE id = NEW.skill_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for skill_entries
CREATE TRIGGER update_skill_last_updated_on_entry 
    AFTER INSERT ON public.skill_entries
    FOR EACH ROW EXECUTE FUNCTION update_skill_last_updated();

-- Create trigger for progress_updates
CREATE TRIGGER update_skill_last_updated_on_progress 
    AFTER INSERT ON public.progress_updates
    FOR EACH ROW EXECUTE FUNCTION update_skill_last_updated(); 