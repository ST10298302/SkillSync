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
- **Node.js** v18+ ([Download](https://nodejs.org/)) (Node.js, 2025)
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (Recommended)
- **Expo CLI** - `npm install -g @expo/cli` (Docs, E., 2025)

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
(Docs, E., 2025)

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
- **Multi-Language Support** - Built-in Google Translate integration (Google, 2025)
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
- **React Native** with Expo SDK 53 (Docs, E., 2025)
- **TypeScript** for type safety
- **Expo Router** for navigation (Docs, E., 2025)
- **Supabase** for backend services (supabase, 2025)
- **Google Translate API** for translations (Google, 2025)
- **React Native Animated** for smooth interactions (React, 2025)

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
(Docs, E., 2025; Jest, 2025)

### Environment Configuration
Create `.env.local` with your credentials:
```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Translate API
EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_google_api_key 
```
(supabase, 2025; Google, 2025)

**To see more, read:** [Development Setup](./development-setup.md) - Complete setup guide including Supabase and storage configuration

---

## Architecture

### State Management
- **AuthContext** - User authentication and session management (supabase, 2025; Docs, S., 2025)
- **SkillsContext** - Skill data and CRUD operations (Kosisochukwu, M., 2025)
- **ThemeContext** - Light/dark theme switching
- **LanguageContext** - Multi-language support

**To see more, read:** [Authentication](./authentication.md) - Detailed auth system implementation

### Data Flow
1. **User Input** → Component → Context
2. **Context** → Service → Supabase/External APIs
3. **Response** → Context → Component → UI Update

### Service Layer
- **SupabaseService** - Database operations and authentication (supabase, 2025; Yüksel, M., 2023)
- **GoogleTranslateAPI** - Translation services (Google, 2025)
- **File System Service** - Local file management
- **Image Service** - Profile picture handling

**To see more, read:** [Database Schema](./database-schema.md) - Database structure and service integration

### Component Architecture
- **Atomic Design** principles (Coope, A. et al., 2014)
- **Theme-aware** styling system
- **Responsive** layouts for all screen sizes
- **Accessibility** features built-in

**To see more, read:** [Components](./components.md) - Complete component library and design system

---

## Testing

### Comprehensive Testing Suite ✅

SkillSync now features a complete testing foundation with **33 tests across 7 test suites**, all passing successfully.

### Test Types

- **Unit Tests** - Component logic, utilities, and context state management (Jest, 2025)
- **Integration Tests** - Complete user journeys and context interactions  
- **Regression Tests** - Edge cases, race conditions, and memory leak prevention (Mandalchandan, 2024)
- **Performance Tests** - Large datasets, concurrent operations, and rendering performance (React, 2025)

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
- Review [Expo documentation](https://docs.expo.dev/) (Docs, E., 2025)
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
- [Expo Documentation](https://docs.expo.dev/) (Docs, E., 2025)
- [React Native Guide](https://reactnative.dev/)
- [Supabase Docs](https://supabase.com/docs) (supabase, 2025)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Google Translate API](https://cloud.google.com/translate/docs) (Google, 2025)

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
- Use React.memo for expensive components (React, 2025)
- Implement lazy loading where appropriate
- Monitor app performance metrics (Mandalchandan, 2024)

---

**Happy learning and coding!**

---

## References

Agile Alliance, 2024. Agile Glossary: Definition of Ready. [Online] 
Available at: https://agilealliance.org/glossary/definition-of-ready/
[Accessed 15 June 2025].

Coope, A., Reimann, R., Cronin, D. & Noessel, C., 2014. THE ESSENTIALS OF INTERACTION DESIGN. John Wiley & Sons, Inc., 1(4), pp. 167-189.

Deterding, S., Dixon, D., Khaled, R. & Nacke, L., 2011. From game design elements to gamefulness: defining "gamification". MindTrek, 1(1), pp. 9-13.

Docs, E., 2025. Create amazing apps that run everywhere. [Online] 
Available at: https://docs.expo.dev/
[Accessed 20 April 2025].

Docs, S., 2025. Create a new user. [Online] 
Available at: https://supabase.com/docs/reference/javascript/auth-signup
[Accessed 15 June 2025].

Expo, D., 2025. Add gestures. [Online] 
Available at: https://docs.expo.dev/tutorial/gestures/
[Accessed 8 October 2025].

Google, 2025. Cloud Translation API. [Online] 
Available at: https://cloud.google.com/translate/docs/reference/rest
[Accessed 8 October 2025].

Group, P. G. D., 2025. PostgreSQL 18.0 Documentation. [Online] 
Available at: https://www.postgresql.org/docs/18/index.html
[Accessed 31 July 2025].

Hanna, K. T., Lawton, G. & Pratt, M. K., 2024. change management. [Online] 
Available at: https://www.techtarget.com/searchcio/definition/change-management
[Accessed 26 October 2025].

Holistics, 2025. Draw Entity-Relationship Diagrams, Painlessly. [Online] 
Available at: https://dbdiagram.io/home
[Accessed 15 October 2025].

Jest, 2025. Testing React Native Apps. [Online] 
Available at: https://jestjs.io/docs/tutorial-react-native
[Accessed 9 October 2025].

Kosisochukwu, M., 2025. The Complete Tutorial to Building a CRUD App with React.js and Supabase. [Online] 
Available at: https://adevait.com/react/building-crud-app-with-react-js-supabase
[Accessed 25 August 2025].

Link, I., 2025. Understanding the costs of software development: a complete breakdown. [Online] 
Available at: https://idealink.tech/blog/understanding-the-costs-of-software-development-a-complete-breakdown
[Accessed 20 October 2025].

Mandalchandan, 2024. Understanding and Managing Memory Leaks in React Applications. [Online] 
Available at: https://medium.com/@90mandalchandan/understanding-and-managing-memory-leaks-in-react-applications-bcfcc353e7a5
[Accessed 10 October 2025].

Node.js, 2025. Node.js v25.1.0 documentation. [Online] 
Available at: https://nodejs.org/docs/latest/api/
[Accessed 28 July 2025].

OSWAP, 2025. OWASP Mobile Application Security. [Online] 
Available at: https://owasp.org/www-project-mobile-app-security/
[Accessed 5 August 2025].

OSWASP, 2025. Explore the world. [Online] 
Available at: https://owasp.org/
[Accessed 2 October 2025].

React, 2025. Optimizing Performance. [Online] 
Available at: https://legacy.reactjs.org/docs/optimizing-performance.html
[Accessed 8 October 2025].

Schwaber, K. & Sutherland, J., 2020. The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game.. [Online] 
Available at: https://scrumguides.org/scrum-guide.html
[Accessed 15 June 2025].

Shkurdoda, A. & Puczyk, A., 2025. Cost of Software Development: Tips for Calculating Your Project Budget. [Online] 
Available at: https://neontri.com/blog/software-development-costs/
[Accessed 20 October 2025].

supabase, 2025. Auth. [Online] 
Available at: https://supabase.com/docs/guides/auth
[Accessed 22 August 2025].

supabase, 2025. Supabase Documentation. [Online] 
Available at: https://supabase.com/docs
[Accessed 3 March 2025].

Suscheck, C., 2024. Definition Of Done (DOD) Explanation and Example. [Online] 
Available at: https://www.scrum.org/resources/blog/definition-done-dod-explanation-and-example
[Accessed 15 June 2025].

whatfix, 2025. What Is Change Management?. [Online] 
Available at: https://whatfix.com/change-management/
[Accessed 25 October 2025].

(UML), U. C. D. -. U. M. L., 2025. GeeksforGeeks. [Online] 
Available at: https://www.geeksforgeeks.org/system-design/use-case-diagram/
[Accessed 26 August 2025].

Yüksel, M., 2023. How to authenticate React applications with Supabase Auth. [Online] 
Available at: https://blog.logrocket.com/authenticate-react-applications-supabase-auth/
[Accessed 25 August 2025].
