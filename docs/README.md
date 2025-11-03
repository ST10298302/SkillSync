# SkillSync App Documentation

A complete guide to the SkillSync learning tracker app. Built with React Native and Expo, SkillSync helps you track your learning progress, manage skills, and maintain learning streaks with built-in translation support.

---

## Quick Navigation

- [Getting Started](#getting-started) - Setup and installation
- [App Overview](#app-overview) - What SkillSync does
- [Core Features](#core-features) - What you can do with the app
- [Development Guide](#development-guide) - How to work with the codebase
- [Architecture](#architecture) - How the app is built
- [Testing](#testing) - Running and writing tests
- [Deployment](#deployment) - Building for production
- [Troubleshooting](#troubleshooting) - Common issues and solutions

---

## Getting Started

### Prerequisites

Before you start, make sure you have:

- **Node.js** v18 or higher - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** (Recommended editor, but any editor works)
- **Expo CLI** - Install globally with: `npm install -g @expo/cli`

### Quick Setup

Follow these steps to get the app running:

```bash
# 1. Clone the repository
git clone https://github.com/ST10298302/SkillSync.git
cd SkillSyncApp

# 2. Install all dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Open .env.local and add your Supabase credentials (see Environment Configuration below)

# 4. Start the development server
npx expo start
```

**When the server starts:**

- Press `w` to open in **web browser**
- Scan the QR code with **Expo Go** app on your phone (for mobile testing)
- Press `t` to use **tunnel mode** (if you're on different WiFi than your phone)

---

## App Overview

### What is SkillSync?

SkillSync is a learning management app that helps you:
- Track your skill development progress
- Log your learning sessions with notes
- Maintain learning streaks to stay motivated
- Use multiple languages with built-in translation

Think of it as a personal learning journal combined with progress tracking, all in one place.

### Why Use SkillSync?

- **Everything in one place** - Track all your skills and progress without switching between tools
- **Works everywhere** - Use it on your phone (iOS/Android), tablet, or web browser
- **Multi-language support** - Built-in translation means you can use it in any language
- **Visual progress** - See exactly how far you've come with clear progress indicators
- **Stay motivated** - Streak tracking helps you maintain consistent learning habits

---

## Core Features

### Skill Management

Create, organize, and manage your learning goals:
- **Create Skills** - Add new skills you want to learn (e.g., "React Native", "Spanish", "Piano")
- **Edit Skills** - Update names, descriptions, categories, or progress anytime
- **Delete Skills** - Remove skills you've completed or no longer need
- **Organize by Category** - Group related skills together for easier management

### Progress Tracking

Keep track of how you're doing:
- **Progress Bars** - Visual 0-100% indicators show how close you are to mastery
- **Exact Percentages** - See precise progress numbers for each skill
- **Learning Streaks** - Track how many consecutive days you've practiced
- **Progress History** - Review your learning patterns over weeks and months

### Learning Diary

Journal your learning journey:
- **Session Logging** - Write notes about what you learned in each session
- **Time Tracking** - Log how many hours you spent on each skill
- **Entry History** - Browse through all your past learning entries
- **Skill Linking** - Connect diary entries to specific skills automatically

### Translation System

Use the app in any language:
- **Multi-Language Support** - Built-in Google Translate integration lets you use the app in your preferred language
- **Real-Time Translation** - Text gets translated instantly as you use the app
- **Batch Translation** - Translate multiple entries at once for efficiency
- **Auto-Detection** - The app detects which language you're using

### Theme System

Customize your experience:
- **Light/Dark Mode** - Switch between themes for comfortable viewing
- **Auto-Detection** - Automatically matches your device's theme preference
- **Persistent Settings** - Remembers your theme choice
- **Consistent Design** - Unified look and feel across all screens

### Dashboard & Analytics

See the big picture:
- **Home Statistics** - Quick overview of all your skills and progress
- **Progress Charts** - Visual charts showing your advancement over time
- **Streak Tracking** - Monitor how consistent your learning habits are
- **Time Analytics** - See total hours logged and learning patterns

---

## Development Guide

### Project Structure

Here's how the codebase is organized:

```
SkillSyncApp/
├── app/                    # All app screens (login, home, skill details, etc.)
│   ├── (auth)/            # Login and signup screens
│   ├── (tabs)/            # Main screens: Home, Analytics, Community, Profile
│   ├── settings/          # Settings screens
│   └── skill/             # Skill management screens (create, edit, view)
├── components/             # Reusable UI pieces (buttons, cards, modals)
├── context/               # Global state management (user, skills, theme)
├── services/              # Backend API calls and external services
├── utils/                 # Helper functions (calculations, formatting)
└── constants/             # App-wide settings (colors, text, config)
```

**Want more details?** Check out [App Structure](./app-structure.md) for a complete breakdown of navigation and screens.

### Key Technologies

The app is built with modern, reliable tools:

- **React Native** with Expo SDK 53 - Cross-platform mobile app framework
- **TypeScript** - Catches errors before they happen with type checking
- **Expo Router** - File-based navigation (like Next.js for mobile)
- **Supabase** - Handles authentication, database, and file storage
- **Google Translate API** - Powers the multi-language features
- **React Native Animated** - Smooth animations and transitions

### Development Commands

Common commands you'll use while developing:

```bash
# Start the development server
npx expo start

# Check for TypeScript errors
npx tsc --noEmit

# Check code style
npm run lint

# Run tests
npm test                    # Run all tests once
npm run test:watch         # Watch mode - reruns tests when files change
npm run test:coverage      # See how much of the code is tested

# Clear cache (if things get weird)
npx expo start --clear
```

### Environment Configuration

The app needs API keys to work. Create a `.env.local` file in the project root with:

```bash
# Supabase Configuration (database and authentication)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Translate API (for multi-language support)
EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_google_api_key
```

**Getting these keys:**
- **Supabase**: Sign up at [supabase.com](https://supabase.com), create a project, then find your URL and anon key in Project Settings
- **Google Translate**: Set up at [Google Cloud Console](https://console.cloud.google.com), enable Translation API, and create an API key

**Need help setting these up?** See [Development Setup](./development-setup.md) for a complete step-by-step guide.

---

## Architecture

### State Management

The app uses React Context to manage global state:

- **AuthContext** - Handles user login, logout, and session management
- **SkillsContext** - Manages all skill data (creating, updating, deleting skills)
- **ThemeContext** - Controls light/dark mode switching
- **LanguageContext** - Manages language selection and translations
- **PinLockContext** - Handles PIN lock security features

**How it works:** Components read data from these contexts instead of passing props down through many layers.

**Want to dive deeper?** Check out [Authentication](./authentication.md) to see how the auth system works.

### Data Flow

Here's how data moves through the app:

1. **User does something** (like adding a skill) → A component catches the action
2. **Component calls Context** → Context calls a Service
3. **Service talks to Supabase** → Saves data to the database
4. **Response comes back** → Context updates → Component shows the new data

Simple flow: User Action → Component → Context → Service → Database → Back up the chain

### Service Layer

Services handle all communication with external systems:

- **SupabaseService** - Saves/loads data from the database, handles authentication
- **GoogleTranslateAPI** - Translates text between languages
- **File System Service** - Manages local files on the device
- **Image Service** - Handles profile picture uploads

**Database details:** See [Database Schema](./database-schema.md) to understand how data is stored.

### Component Architecture

Components are built with these principles:

- **Reusable pieces** - Small components that can be used in multiple places
- **Theme-aware** - All components automatically adapt to light/dark mode
- **Responsive** - Works on phones, tablets, and web browsers
- **Accessible** - Built-in support for screen readers and accessibility tools

**Component library:** Check out [Components](./components.md) for a complete list of available components.

---

## Testing

### Test Overview

The app has a solid test foundation:
- **33 tests** across **7 test suites**
- All tests are currently passing ✅
- **25% code coverage** (with room to grow)

### Types of Tests

- **Unit Tests** - Test individual components and functions in isolation
- **Integration Tests** - Test complete user workflows (like creating a skill)
- **Regression Tests** - Make sure bugs don't come back after fixing them
- **Performance Tests** - Ensure the app stays fast with lots of data

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

### Test Organization

Tests are organized by type:

- `__tests__/components/` - Tests for UI components (buttons, cards, etc.)
- `__tests__/context/` - Tests for state management (auth, skills, etc.)
- `__tests__/integration/` - Tests for complete user workflows
- `__tests__/regression/` - Tests that prevent bugs from coming back
- `__tests__/performance/` - Tests that check app speed and efficiency
- `__tests__/utils/` - Tests for helper functions (like calculating streaks)

**Testing strategies:** See [Testing Strategy](./testing-strategy.md) for detailed information about how tests are written and maintained.

---

## Deployment

### Building for Production

The app uses Expo Application Services (EAS) for building. This handles all the complex setup for you.

**Build commands:**

```bash
# Build for Android
npx expo build:android --profile production

# Build for iOS
npx expo build:ios --profile production

# Or build for both
npx expo build --profile production
```

**Distribution:**

- **Internal testing**: Share APK/IPA files directly with testers
- **App stores**: Submit builds to Google Play Store or Apple App Store
- **Internal app store**: Set up your own internal distribution channel

**Note:** Production builds require proper app signing certificates. Expo can help you set these up.

---

## Troubleshooting

### Common Issues & Solutions

**Problem: App won't start or shows weird errors**

```bash
# Clear the cache and restart
npx expo start --clear

# If that doesn't work, reset everything
npx expo start --reset-cache
```

**Problem: Dependencies are broken**

```bash
# Remove and reinstall everything
rm -rf node_modules package-lock.json
npm install
```

**Problem: TypeScript errors**

```bash
# Check what's wrong
npx tsc --noEmit

# Auto-fix code style issues
npm run lint --fix
```

**Problem: Translations not working**

- Check that `EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY` is set in `.env.local`
- Verify your Google Translate API has quota remaining
- Make sure you're connected to the internet

### Getting Help

1. **Check the terminal** - Error messages usually tell you what's wrong
2. **Read the docs** - [Expo documentation](https://docs.expo.dev/) is very helpful
3. **Search online** - [React Native docs](https://reactnative.dev/) have solutions for common issues
4. **Check project docs** - The other documentation files in the `docs/` folder have more details

---

## Additional Resources

### Documentation Files

- **[App Structure](./app-structure.md)** - How screens are organized and navigation works
- **[Components](./components.md)** - Complete list of reusable UI components
- **[Authentication](./authentication.md)** - How login and user management works
- **[Development Setup](./development-setup.md)** - Detailed setup guide (Supabase, storage, etc.)
- **[Database Schema](./database-schema.md)** - How data is organized in the database
- **[Unit Testing](./unit-testing.md)** - How to write and run tests

### External Documentation

- **[Expo Documentation](https://docs.expo.dev/)** - Official Expo guides and API reference
- **[React Native Guide](https://reactnative.dev/)** - Official React Native documentation
- **[Supabase Docs](https://supabase.com/docs)** - Supabase setup and API reference
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Learn TypeScript
- **[Google Translate API](https://cloud.google.com/translate/docs)** - Translation API docs

---

## For Developers

### Code Standards

When writing code, follow these guidelines:

- **Use TypeScript properly** - Type everything, avoid `any` when possible
- **Name things clearly** - Components use PascalCase (e.g., `SkillCard`), functions use camelCase (e.g., `calculateStreak`)
- **Handle errors** - Always wrap API calls in try/catch and show helpful error messages
- **Write tests** - Add tests when you add new features

### Adding New Features

1. **Create a feature branch** from `main`
2. **Write the code** following the existing patterns
3. **Add tests** for your new feature
4. **Update docs** if you changed how something works
5. **Test everywhere** - Make sure it works on iOS, Android, and Web
6. **Check translations** - Verify text appears correctly in different languages

### Performance Tips

- **Optimize images** - Compress images before adding them
- **Use React.memo** - Wrap expensive components to prevent unnecessary re-renders
- **Lazy load** - Only load screens/components when they're actually needed
- **Monitor performance** - Check app speed regularly, especially with lots of data

---

**Happy coding!** 🚀

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
