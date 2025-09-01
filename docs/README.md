# SkillSync App Documentation

A comprehensive guide to the SkillSync learning tracker app built with React Native and Expo, featuring built-in translation capabilities and comprehensive skill management.

## Table of Contents

1. [Getting Started](#getting-started)
2. [App Overview](#app-overview)
3. [Core Features](#core-features)
4. [Development Guide](#development-guide)
5. [Architecture](#architecture)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (Recommended)
- **Expo CLI** - `npm install -g @expo/cli`

### Quick Setup
```bash
# Clone repository
git clone https://github.com/ST10298302/SkillSync.git
cd SkillSyncApp

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npx expo start
```

### First Run Options
- **Web**: Press `w` in terminal
- **Mobile**: Scan QR code with Expo Go app
- **Tunnel**: Press `t` for different WiFi networks

---

## App Overview

### What is SkillSync?
SkillSync is an internal learning management application that helps users track their skill development progress, log learning sessions, and maintain learning streaks. The app includes built-in translation capabilities to support multi-language learning environments.

### Key Benefits
- **Centralized Learning Tracking** - All skills and progress in one place
- **Multi-Language Support** - Built-in translation for global teams
- **Progress Visualization** - Clear visual indicators of learning advancement
- **Streak Motivation** - Maintain learning momentum with streak tracking
- **Cross-Platform** - Works on iOS, Android, and Web

---

## Core Features

### Skill Management
- **Create Skills** - Add new learning goals with descriptions and categories
- **Edit Skills** - Modify skill details, progress, and goals anytime
- **Delete Skills** - Remove completed or abandoned skills
- **Skill Categories** - Organize skills by learning domains

### Progress Tracking
- **Visual Progress Bars** - 0-100% progress indicators
- **Percentage Display** - Exact progress numbers
- **Streak System** - Track consecutive learning days
- **Progress History** - View learning patterns over time

### Learning Diary
- **Session Logging** - Record study sessions with text notes
- **Time Tracking** - Log hours spent on each skill
- **Entry History** - Review past learning activities
- **Skill Linking** - Connect diary entries to specific skills

### Translation System
- **Multi-Language Support** - Built-in Google Translate integration
- **Real-Time Translation** - Translate text on-the-fly
- **Batch Translation** - Translate multiple entries simultaneously
- **Language Detection** - Automatic language identification
- **Translation Memory** - Store and reuse common translations

### Theme System
- **Light/Dark Mode** - Comfortable viewing in any lighting
- **Auto-Detection** - Follows device theme preferences
- **Persistent Settings** - Remembers theme choice
- **Consistent Theming** - Unified visual experience

### Dashboard & Analytics
- **Home Statistics** - Quick overview of learning progress
- **Progress Charts** - Visual representation of advancement
- **Streak Tracking** - Monitor learning consistency
- **Time Analytics** - Total learning hours and patterns

---

## Development Guide

### Project Structure
```
SkillSyncApp/
├── app/                    # App screens and navigation
│   ├── (auth)/            # Authentication flows
│   ├── (tabs)/            # Main app tabs
│   └── skill/             # Skill management
├── components/             # Reusable UI components
├── context/               # React Context providers
├── services/              # API and external services
├── utils/                 # Helper functions
└── constants/             # App configuration
```

**To see more, read:** [App Structure](./app-structure.md) - Detailed navigation flow and screen organization

### Key Technologies
- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Supabase** for backend services
- **Google Translate API** for translations
- **React Native Animated** for smooth interactions

### Development Commands
```bash
# Start development
npx expo start

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Testing
npm test                    # Run all tests
npm run test:watch         # Watch mode for development
npm run test:coverage      # Generate coverage report

# Clear cache
npx expo start --clear
```

### Environment Configuration
Create `.env.local` with your credentials:
```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Translate API
EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_google_api_key
```

**To see more, read:** [Development Setup](./development-setup.md) - Complete setup guide including Supabase and storage configuration

---

## Architecture

### State Management
- **AuthContext** - User authentication and session management
- **SkillsContext** - Skill data and CRUD operations
- **ThemeContext** - Light/dark theme switching
- **LanguageContext** - Multi-language support

**To see more, read:** [Authentication](./authentication.md) - Detailed auth system implementation

### Data Flow
1. **User Input** → Component → Context
2. **Context** → Service → Supabase/External APIs
3. **Response** → Context → Component → UI Update

### Service Layer
- **SupabaseService** - Database operations and authentication
- **GoogleTranslateAPI** - Translation services
- **File System Service** - Local file management
- **Image Service** - Profile picture handling

**To see more, read:** [Database Schema](./database-schema.md) - Database structure and service integration

### Component Architecture
- **Atomic Design** principles
- **Theme-aware** styling system
- **Responsive** layouts for all screen sizes
- **Accessibility** features built-in

**To see more, read:** [Components](./components.md) - Complete component library and design system

---

## Testing

### Comprehensive Testing Suite ✅

SkillSync now features a complete testing foundation with **33 tests across 7 test suites**, all passing successfully.

### Test Types

- **Unit Tests** - Component logic, utilities, and context state management
- **Integration Tests** - Complete user journeys and context interactions  
- **Regression Tests** - Edge cases, race conditions, and memory leak prevention
- **Performance Tests** - Large datasets, concurrent operations, and rendering performance

### Current Test Results

- **Total Tests**: 33 ✅
- **Test Suites**: 7 ✅
- **Coverage**: 25.33% (statements), 16.53% (branches)
- **Status**: All tests passing

### Running Tests

```bash
# All tests
npm run test:all

# Specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:regression    # Regression tests only
npm run test:performance   # Performance tests only

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode
npm run test:ci
```

### Test Structure

- `__tests__/components/` - UI component tests (SkillCard, etc.)
- `__tests__/context/` - Context provider tests (AuthContext, SkillsContext, etc.)
- `__tests__/integration/` - End-to-end user flow tests
- `__tests__/regression/` - Edge case and stability tests
- `__tests__/performance/` - Performance and scalability tests
- `__tests__/utils/` - Utility function tests (streakCalculator, etc.)

### Key Testing Achievements

✅ **Fixed CI/CD pipeline** - TypeScript errors resolved  
✅ **Stable test environment** - No more hanging tests  
✅ **Comprehensive coverage** - Core functionality fully tested  
✅ **Performance validation** - App scales efficiently  
✅ **Regression prevention** - Previously fixed issues remain resolved  

**To see more, read:** [Testing Strategy](./testing-strategy.md) - Comprehensive testing strategies and results

---

## Deployment

### Development Build
```bash
# Build for development
npx expo build --profile development

# Platform-specific builds
npx expo build:android --profile development
npx expo build:ios --profile development
```

### Production Build
```bash
# Build for production
npx expo build --profile production

# Platform-specific builds
npx expo build:android --profile production
npx expo build:ios --profile production
```

### Internal Distribution
- Use Expo Application Services (EAS) for internal builds
- Distribute via internal app stores or direct APK/IPA files
- Configure app signing for internal certificates

---

## Troubleshooting

### Common Issues

#### Development Server
```bash
# Clear cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache
```

#### Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Check types
npx tsc --noEmit

# Fix linting
npm run lint --fix
```

#### Translation Issues
```bash
# Verify API key in .env.local
# Check Google Translate API quota
# Verify network connectivity
```

### Getting Help
- Check terminal output for error messages
- Review [Expo documentation](https://docs.expo.dev/)
- Search [React Native docs](https://reactnative.dev/)
- Check internal development documentation

---

## Additional Resources

### Documentation
- [App Structure](./app-structure.md) - Navigation and screen organization
- [Components](./components.md) - UI component library
- [Authentication](./authentication.md) - Auth system details
- [Development Setup](./development-setup.md) - Complete setup guide including Supabase and storage
- [Database Schema](./database-schema.md) - Database structure and relationships
- [Unit Testing](./unit-testing.md) - Testing strategies and examples

**To see more, read:**
- **Getting Started**: [Development Setup](./development-setup.md) - Complete environment setup guide
- **App Structure**: [App Structure](./app-structure.md) - Navigation flow and screen organization
- **Components**: [Components](./components.md) - UI component library and design system
- **Authentication**: [Authentication](./authentication.md) - Auth system implementation details
- **Database**: [Database Schema](./database-schema.md) - Table structure and relationships
- **Testing**: [Unit Testing](./unit-testing.md) - Testing strategies and examples

### External Links
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Guide](https://reactnative.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Google Translate API](https://cloud.google.com/translate/docs)

---

## Internal Development Notes

### Code Standards
- Follow TypeScript best practices
- Use consistent component naming (PascalCase)
- Implement proper error handling
- Write comprehensive tests for new features

### Feature Development
- Create feature branches from main
- Update documentation for new features
- Test on multiple platforms (iOS, Android, Web)
- Verify translation functionality for new text

### Performance Considerations
- Optimize image assets and bundle size
- Use React.memo for expensive components
- Implement lazy loading where appropriate
- Monitor app performance metrics

---

**Happy learning and coding!**
