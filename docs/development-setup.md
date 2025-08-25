# Development Setup

A comprehensive guide to setting up your development environment for SkillSync, including prerequisites, installation, and configuration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Supabase Setup](#supabase-setup)
5. [Development Commands](#development-commands)
6. [VS Code Setup](#vs-code-setup)
7. [Troubleshooting](#troubleshooting)

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
Edit `.env.local` with your Supabase credentials:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Google Translate API (for translations)
EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_google_api_key

# Optional: App Configuration
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
# Go to SQL Editor → Run database-schema.sql

# Option 2: Using psql CLI
psql -h your-project.supabase.co -U postgres -d postgres -f database-schema.sql

# Option 3: Using Supabase CLI
supabase db push
```

#### Verify Tables Created
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show: profiles, skills, skill_entries, etc.
```

### Storage Configuration

1. **Create Storage Bucket**
   - Go to Storage → New Bucket
   - Name: `profile-pictures`
   - Public: `false`
   - File size limit: `5MB`

2. **Set Bucket Policies**
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Users can upload profile pictures" ON storage.objects
   FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Allow users to view their own pictures
   CREATE POLICY "Users can view own profile pictures" ON storage.objects
   FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
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

# Clear cache
npx expo start --clear
```

### Build Commands
```bash
# Development build
npx expo build

# Platform-specific builds
npx expo build:ios
npx expo build:android

# Production build
npx expo build --release-channel production
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

3. **Join Community**
   - Follow project updates
   - Report issues
   - Contribute improvements

---

## Related Documentation

- [README](./README.md) - Main project overview
- [App Structure](./app-structure.md) - Navigation and screen organization
- [Components](./components.md) - UI component library
- [Authentication](./authentication.md) - Auth system details
- [Unit Testing](./unit-testing.md) - Testing strategies and examples
