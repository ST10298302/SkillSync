# Development Setup

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: Latest version
- **Expo CLI**: `npm install -g @expo/cli`

### Platform-Specific Requirements

#### iOS Development
- **macOS**: Required for iOS development
- **Xcode**: Latest version from App Store
- **iOS Simulator**: Included with Xcode
- **CocoaPods**: `sudo gem install cocoapods`

#### Android Development
- **Android Studio**: Latest version
- **Android SDK**: API level 33 or higher
- **Android Emulator**: Set up through Android Studio
- **Java Development Kit**: Version 11 or higher

#### Web Development
- **Modern Browser**: Chrome, Firefox, Safari, or Edge
- **Web Developer Tools**: Built into browsers

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ST10298302/SkillSync.git
cd SkillSyncApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

#### Create Environment File
```bash
cp .env.example .env.local
```

#### Configure Environment Variables
Edit `.env.local` with your Supabase credentials:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

#### Database Setup
Run the SQL scripts in order:
```bash
# 1. Create tables
psql -h your-project.supabase.co -U postgres -d postgres -f database-schema.sql

# 2. Apply updates (if any)
psql -h your-project.supabase.co -U postgres -d postgres -f database-schema-update.sql
```

#### Storage Setup
1. Go to Storage in your Supabase dashboard
2. Create a bucket called `profile-pictures`
3. Set bucket permissions to allow authenticated users to upload

## Development Commands

### Start Development Server
```bash
npm start
```

### Platform-Specific Commands
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Build Commands
```bash
# Build for development
npx expo build

# Build for production
npx expo build --release-channel production

# Export for web
npx expo export --platform web
```

### Testing Commands
```bash
# Run TypeScript check
npx tsc --noEmit

# Run ESLint
npm run lint

# Run expo-doctor
npx expo-doctor
```

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push to remote
git push origin feature/your-feature-name
```

### 2. Code Quality
- Run `npm run lint` before committing
- Ensure TypeScript compilation passes
- Follow the component guidelines in `docs/components.md`

### 3. Testing
- Test on all target platforms
- Verify theme switching works
- Check accessibility features
- Test offline functionality

## Development Tools

### VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "expo.vscode-expo-tools"
  ]
}
```

### Debugging

#### React Native Debugger
```bash
# Install React Native Debugger
brew install --cask react-native-debugger

# Start debugger
open "rndebugger://set-debugger-loc?host=localhost&port=19000"
```

#### Flipper (Optional)
```bash
# Install Flipper
brew install --cask flipper

# Start Flipper
open -a Flipper
```

### Performance Monitoring
```bash
# Install performance monitoring
npm install --save-dev @expo/metro-config

# Monitor bundle size
npx expo export --platform web --analyze
```

## Platform-Specific Setup

### iOS Development

#### Xcode Configuration
1. Open Xcode
2. Go to Preferences → Locations
3. Set Command Line Tools to latest version
4. Install iOS Simulator if needed

#### iOS Simulator
```bash
# List available simulators
xcrun simctl list devices

# Start specific simulator
xcrun simctl boot "iPhone 14 Pro"
```

### Android Development

#### Android Studio Setup
1. Install Android Studio
2. Open SDK Manager
3. Install Android SDK Platform 33
4. Install Android SDK Build-Tools
5. Create Android Virtual Device (AVD)

#### Environment Variables
```bash
# Add to your shell profile
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Web Development

#### Browser Testing
- Test in Chrome, Firefox, Safari, and Edge
- Check responsive design on different screen sizes
- Verify keyboard navigation
- Test with screen readers

## Troubleshooting

### Common Issues

#### Metro Bundler Issues
```bash
# Clear Metro cache
npx expo start --clear

# Reset cache completely
rm -rf node_modules && npm install
```

#### iOS Build Issues
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reset iOS simulator
xcrun simctl erase all
```

#### Android Build Issues
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Reset Android emulator
adb emu kill
```

#### Supabase Connection Issues
1. Verify environment variables are set correctly
2. Check Supabase project is active
3. Verify network connectivity
4. Check browser console for CORS issues

### Performance Issues

#### Bundle Size
```bash
# Analyze bundle size
npx expo export --platform web --analyze

# Optimize images
npx expo install expo-image-optimizer
```

#### Memory Leaks
- Use React DevTools Profiler
- Monitor component re-renders
- Check for memory leaks in animations

## CI/CD Setup

### GitHub Actions
The project includes a CI workflow in `.github/workflows/ci.yml` that:
- Runs on push to main/dev branches
- Installs dependencies
- Runs linting and type checking
- Builds the web version
- Requires Supabase environment variables

### Environment Variables for CI
Add these secrets to your GitHub repository:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Deployment

### Web Deployment
```bash
# Build for production
npx expo export --platform web --clear

# Deploy to Vercel
npx vercel --prod

# Deploy to Netlify
npx netlify deploy --prod
```

### Mobile Deployment
```bash
# Build for iOS
npx expo build --platform ios

# Build for Android
npx expo build --platform android
```

## Contributing Guidelines

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add comprehensive comments

### Git Workflow
1. Create feature branch from main
2. Make focused, atomic commits
3. Write descriptive commit messages
4. Test thoroughly before pushing
5. Create pull request with detailed description

### Documentation
- Update relevant documentation files
- Add inline comments for complex logic
- Document new components and APIs
- Update README.md if needed

## Support

### Getting Help
- Check the [Expo documentation](https://docs.expo.dev/)
- Review [React Native docs](https://reactnative.dev/)
- Consult [Supabase documentation](https://supabase.com/docs)
- Search existing issues in the repository

### Reporting Issues
1. Check existing issues first
2. Create detailed bug report
3. Include platform and version information
4. Provide steps to reproduce
5. Include error logs and screenshots
