-- Add notification settings columns to users table
ALTER TABLE public.users
ADD COLUMN daily_reminders BOOLEAN DEFAULT TRUE,
ADD COLUMN weekly_reports BOOLEAN DEFAULT TRUE,
ADD COLUMN skill_completions BOOLEAN DEFAULT TRUE,
ADD COLUMN streak_alerts BOOLEAN DEFAULT TRUE,
ADD COLUMN tips_and_tricks BOOLEAN DEFAULT FALSE,
ADD COLUMN marketing_emails BOOLEAN DEFAULT FALSE;

-- Add indexes for frequently queried notification columns
CREATE INDEX IF NOT EXISTS idx_users_daily_reminders ON public.users (daily_reminders);
CREATE INDEX IF NOT EXISTS idx_users_weekly_reports ON public.users (weekly_reports);
CREATE INDEX IF NOT EXISTS idx_users_skill_completions ON public.users (skill_completions);
CREATE INDEX IF NOT EXISTS idx_users_streak_alerts ON public.users (streak_alerts);
CREATE INDEX IF NOT EXISTS idx_users_tips_and_tricks ON public.users (tips_and_tricks);
CREATE INDEX IF NOT EXISTS idx_users_marketing_emails ON public.users (marketing_emails);

-- Add comments for documentation
COMMENT ON COLUMN public.users.daily_reminders IS 'Enable daily reminder notifications';
COMMENT ON COLUMN public.users.weekly_reports IS 'Enable weekly progress report notifications';
COMMENT ON COLUMN public.users.skill_completions IS 'Enable skill completion celebration notifications';
COMMENT ON COLUMN public.users.streak_alerts IS 'Enable streak alert notifications';
COMMENT ON COLUMN public.users.tips_and_tricks IS 'Enable tips and tricks email notifications';
COMMENT ON COLUMN public.users.marketing_emails IS 'Enable marketing email notifications';
