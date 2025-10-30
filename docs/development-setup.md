# Development Setup

A comprehensive guide to setting up your development environment for SkillSync, including prerequisites, installation, configuration, and Supabase setup.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Supabase Setup](#supabase-setup)
5. [Storage Setup](#storage-setup)
6. [Development Commands](#development-commands)
7. [VS Code Setup](#vs-code-setup)
8. [Troubleshooting](#troubleshooting)
9. [Testing Your Setup](#testing-your-setup)
10. [Next Steps](#next-steps)
11. [Related Documentation](#related-documentation)

---

## Prerequisites

### Required Software
- **Node.js** - Version 18 or higher
- **npm** - Version 8 or higher  
- **Git** - Latest version
- **Expo CLI** - `npm install -g @expo/cli`

### Platform-Specific Requirements

#### iOS Development
- **macOS** - Required for iOS development
- **Xcode** - Latest version from App Store
- **iOS Simulator** - Included with Xcode
- **CocoaPods** - `sudo gem install cocoapods`

#### Android Development
- **Android Studio** - Latest version
- **Android SDK** - API level 33 or higher
- **Android Emulator** - Set up through Android Studio
- **Java Development Kit** - Version 11 or higher

#### Web Development
- **Modern Browser** - Chrome, Firefox, Safari, or Edge
- **Web Developer Tools** - Built into browsers

---

## Installation

### Step 1: Clone Repository
```bash
# Clone the repository
git clone https://github.com/ST10298302/SkillSync.git

# Navigate to project directory
cd SkillSyncApp
```

### Step 2: Install Dependencies
```bash
# Install all dependencies
npm install

# Verify installation
npm --version
npx expo --version
```

### Step 3: Verify Setup
```bash
# Check if everything is working
npx expo doctor

# Should show: "No issues detected!"
```

---

## Environment Configuration

### Create Environment File
```bash
# Copy example environment file
cp .env.example .env.local

# Or create manually
touch .env.local
```

### Configure Environment Variables
Edit `.env.local` with your credentials:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Translate API (for translations)
EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_google_api_key 

# App Configuration
EXPO_PUBLIC_APP_NAME=SkillSync
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### Environment File Structure
```
.env.local          # Local development (git ignored)
.env.example        # Example template (committed)
.env.production     # Production settings (git ignored)
```

---

## Supabase Setup

### Create Supabase Project

1. **Visit Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in

2. **Create New Project**
   - Click "New Project"
   - Choose organization
   - Enter project name (e.g., "skillsync-dev")
   - Set database password
   - Choose region

3. **Wait for Setup**
   - Project creation takes 2-3 minutes
   - You'll receive email when ready

### Get Project Credentials

1. **Go to Project Settings**
   - Click gear icon → Settings
   - Select "API" from sidebar

2. **Copy Credentials**
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Database Setup

#### Run Schema Scripts
```bash
# Option 1: Using Supabase Dashboard
# Go to SQL Editor → Run the schema from database-schema.md

# Option 2: Using psql CLI
psql -h your-project.supabase.co -U postgres -d postgres -f database-schema.sql

# Option 3: Using Supabase CLI
supabase db push
```

**Note**: See [Database Schema](./database-schema.md) for detailed table structure and relationships.

#### Verify Tables Created
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show: users, skills, skill_entries, progress_updates
```

### Authentication Setup

#### Configure Email Auth
1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Make sure **Email Auth** is enabled
3. Optionally configure email templates under **Email Templates**

#### Configure Row Level Security (RLS)
The SQL schema already includes RLS policies, but verify they're working:
1. Go to **Authentication** → **Policies**
2. You should see policies for all tables (users, skills, skill_entries, progress_updates)

---

## Storage Setup

### Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the following:
   - **Name**: `avatars`
   - **Public bucket**: Check this (allows public read access)
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/*`

### Set Up Storage Policies

Run these SQL commands in your Supabase SQL Editor:

#### Enable RLS on storage.objects
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

#### Allow users to upload their own profile pictures
```sql
CREATE POLICY "Users can upload own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Allow public read access to profile pictures
```sql
CREATE POLICY "Public read access to profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

#### Allow users to update their own profile pictures
```sql
CREATE POLICY "Users can update own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Allow users to delete their own profile pictures
```sql
CREATE POLICY "Users can delete own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Update Database Schema

Run this SQL to add the profile_picture_url column to your users table:

```sql
-- Add profile_picture_url column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create index for profile_picture_url for better query performance
CREATE INDEX IF NOT EXISTS idx_users_profile_picture_url ON public.users(profile_picture_url);

-- Add comment to the column for documentation
COMMENT ON COLUMN public.users.profile_picture_url IS 'URL to the user''s profile picture stored in Supabase Storage';
```

---

## Development Commands

### Start Development Server
```bash
# Start Expo development server
npm start
# or
npx expo start
```

### Platform-Specific Commands
```bash
# iOS Simulator
npm run ios
# or
npx expo run:ios

# Android Emulator
npm run android
# or
npx expo run:android

# Web Browser
npm run web
# or
npx expo start --web
```

### Development Tools
```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Testing
npm test
npm run test:watch
npm run test:coverage

# Clear cache
npx expo start --clear
```

### Build Commands
```bash
# Development build
npx expo build --profile development

# Platform-specific builds
npx expo build:ios --profile development
npx expo build:android --profile development

# Production build
npx expo build --profile production
```

---

## VS Code Setup

### Required Extensions
Install these VS Code extensions for optimal development:

1. **ES7+ React/Redux/React-Native snippets**
   - Provides React Native code snippets
   - ID: `dsznajder.es7-react-js-snippets`

2. **Prettier - Code formatter**
   - Automatic code formatting
   - ID: `esbenp.prettier-vscode`

3. **ESLint**
   - JavaScript/TypeScript linting
   - ID: `dbaeumer.vscode-eslint`

4. **Auto Rename Tag**
   - Auto-rename JSX tags
   - ID: `formulahendry.auto-rename-tag`

5. **Bracket Pair Colorizer**
   - Color-coded bracket matching
   - ID: `CoenraadS.bracket-pair-colorizer`

### Extension Installation
```bash
# Install via VS Code command palette
# Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
# Type: "Extensions: Install Extensions"
# Search for each extension name
```

### VS Code Settings
Create `.vscode/settings.json` in your project:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html"
  }
}
```

---

## Troubleshooting

### Common Issues

#### Node.js Version Problems
```bash
# Check Node.js version
node --version

# If version < 18, install newer version
# Use nvm (Node Version Manager)
nvm install 18
nvm use 18
```

#### Expo CLI Issues
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# Reinstall Expo CLI
npm uninstall -g @expo/cli
npm install -g @expo/cli
```

#### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Supabase Connection Issues
```bash
# Verify API key in .env.local
# Check that the key is the "anon public" key, not the service role key
# Make sure RLS policies were created correctly
# Verify Email Auth is enabled in Supabase
```

#### Storage Issues
```bash
# Check bucket name is exactly "avatars"
# Verify storage policies were created
# Check file path format: {userId}/{userId}-{timestamp}.{extension}
# Ensure user is authenticated when uploading
```

#### Platform-Specific Issues

##### iOS
```bash
# Install CocoaPods dependencies
cd ios && pod install && cd ..

# Clear Xcode build folder
# Xcode → Product → Clean Build Folder
```

##### Android
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Reset Android emulator
# Android Studio → AVD Manager → Wipe Data
```

### Getting Help

1. **Check Terminal Output**
   - Look for error messages
   - Note line numbers and file paths

2. **Search Documentation**
   - [Expo Documentation](https://docs.expo.dev/)
   - [React Native Guide](https://reactnative.dev/)
   - [Supabase Docs](https://supabase.com/docs)

3. **Community Support**
   - [Expo Discord](https://chat.expo.dev/)
   - [React Native Community](https://github.com/react-native-community)
   - [Stack Overflow](https://stackoverflow.com/)

---

## Testing Your Setup

### Quick Test
```bash
# 1. Start development server
npm start

# 2. Press 'w' for web
# 3. Press 'i' for iOS (if on Mac)
# 4. Press 'a' for Android
# 5. Scan QR code with Expo Go app
```

### Verify Features
- ✅ App launches without errors
- ✅ Authentication screens load
- ✅ Navigation works between tabs
- ✅ Theme switching works
- ✅ No console errors

### Test Supabase Connection
```bash
# 1. Try to sign up with a new account
# 2. Check Supabase dashboard → Authentication → Users
# 3. Check Table Editor → users to see if profile was created
# 4. Try creating a skill and adding diary entries
```

---

## Next Steps

After successful setup:

1. **Read Documentation**
   - [App Structure](./app-structure.md)
   - [Components](./components.md)
   - [Authentication](./authentication.md)

2. **Start Development**
   - Create your first skill
   - Test authentication flow
   - Explore the codebase

3. **Customize**
   - Modify database schema if needed
   - Add new features
   - Configure additional services

---

## Related Documentation

- [README](./README.md) - Main project overview
- [App Structure](./app-structure.md) - Navigation and screen organization
- [Components](./components.md) - UI component library
- [Authentication](./authentication.md) - Auth system details
- [Unit Testing](./unit-testing.md) - Testing strategies and examples
