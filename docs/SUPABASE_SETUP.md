# Supabase Setup Guide for SkillSync

## 1. Database Setup

### Step 1: Create Database Tables
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `krfturqokxdgivestbsa`
3. Go to the **SQL Editor** tab
4. Copy and paste the entire contents of `database-schema.sql` into the editor
5. Click **Run** to execute the SQL

### Step 2: Get Your API Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (should be: `https://krfturqokxdgivestbsa.supabase.co`)
3. Copy your **anon public** key
4. Update the `.env.local` file with your actual anon key:

```env
EXPO_PUBLIC_SUPABASE_URL=https://krfturqokxdgivestbsa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## 2. Authentication Setup

### Step 1: Configure Email Auth
1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Make sure **Email Auth** is enabled
3. Optionally configure email templates under **Email Templates**

### Step 2: Configure Row Level Security (RLS)
The SQL schema already includes RLS policies, but verify they're working:
1. Go to **Authentication** → **Policies**
2. You should see policies for all tables (users, skills, skill_entries, progress_updates)

## 3. App Configuration

### Step 1: Update Environment Variables
Replace `your-actual-anon-key-here` in `.env.local` with your real anon key from Supabase.

### Step 2: Test the Connection
1. Start your app: `npx expo start`
2. Try to sign up with a new account
3. Check the Supabase dashboard → **Authentication** → **Users** to see if the user was created
4. Check **Table Editor** → **users** to see if the user profile was created

## 4. Database Schema Overview

### Tables Created:
- **users**: User profiles (extends Supabase auth.users)
- **skills**: Main skills data
- **skill_entries**: Diary entries for each skill
- **progress_updates**: Progress update history

### Key Features:
- **Row Level Security**: Users can only access their own data
- **Real-time subscriptions**: Skills update in real-time across devices
- **Automatic timestamps**: Created/updated timestamps are managed automatically
- **Cascading deletes**: Deleting a skill deletes all related entries

## 5. Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Check that your anon key is correct in `.env.local`
   - Make sure the key is the "anon public" key, not the service role key

2. **"RLS policy violation" error**
   - Make sure the user is authenticated
   - Check that the RLS policies were created correctly

3. **"Table doesn't exist" error**
   - Run the SQL schema again
   - Check that all tables were created in the **Table Editor**

4. **Authentication not working**
   - Check that Email Auth is enabled in Supabase
   - Verify the user is being created in **Authentication** → **Users**

### Testing the Setup:

1. **Sign Up Test**:
   ```javascript
   // This should work and create a user
   await SupabaseService.signUp('test@example.com', 'password123', 'Test User');
   ```

2. **Sign In Test**:
   ```javascript
   // This should work and return user data
   const { user } = await SupabaseService.signIn('test@example.com', 'password123');
   ```

3. **Create Skill Test**:
   ```javascript
   // This should create a skill in the database
   const skill = await SupabaseService.createSkill({
     name: 'Test Skill',
     description: 'Test Description',
     progress: 0,
     user_id: user.id,
     total_hours: 0,
     streak: 0,
   });
   ```

## 6. Next Steps

Once the setup is complete:

1. **Test the app**: Try creating skills, adding entries, and updating progress
2. **Monitor logs**: Check the Supabase dashboard for any errors
3. **Enable real-time**: The app will automatically sync changes across devices
4. **Customize**: Modify the database schema or add new features as needed

## 7. Security Notes

- The anon key is safe to use in client-side code
- RLS policies ensure users can only access their own data
- All sensitive operations require authentication
- The service role key should never be used in client-side code

## 8. Deployment

When deploying to production:

1. Update the environment variables in your hosting platform
2. Consider using environment-specific Supabase projects
3. Set up proper email templates for authentication
4. Configure custom domains if needed 