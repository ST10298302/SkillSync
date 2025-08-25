# SkillSync App Documentation

A comprehensive guide to the SkillSync learning tracker app built with React Native and Expo.

## Table of Contents

1. [Getting Started](#getting-started)
2. [App Overview](#app-overview)
3. [Development Guide](#development-guide)
4. [Architecture](#architecture)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (Recommended)

### Quick Setup
```bash
# Clone repository
git clone https://github.com/yourusername/SkillSyncApp.git
cd SkillSyncApp

# Install dependencies
npm install

# Start development server
npx expo start
```

### First Run Options
- **Web**: Press `w` in terminal
- **Mobile**: Scan QR code with Expo Go app
- **Tunnel**: Press `t` for different WiFi networks

---

## App Overview

### Core Features
- **Skill Management** - Create, edit, and track learning goals
- **Progress Tracking** - Log study sessions and monitor advancement
- **Analytics Dashboard** - Visual insights and learning statistics
- **Streak System** - Maintain learning momentum
- **Cross-Platform** - iOS, Android, and Web support

### User Stories
- **Authentication** - Secure user accounts and sessions
- **Skill CRUD** - Full skill lifecycle management
- **Progress Monitoring** - Visual progress indicators and streaks
- **Learning Diary** - Session logging and reflection
- **Theme System** - Light/dark mode support
- **Dashboard Stats** - Quick overview of learning progress

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

### Key Technologies
- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Supabase** for backend services
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
npm test

# Clear cache
npx expo start --clear
```

---

## Architecture

### State Management
- **AuthContext** - User authentication and session management
- **SkillsContext** - Skill data and CRUD operations
- **ThemeContext** - Light/dark theme switching
- **LanguageContext** - Multi-language support

### Data Flow
1. **User Input** → Component → Context
2. **Context** → Service → Supabase
3. **Response** → Context → Component → UI Update

### Component Architecture
- **Atomic Design** principles
- **Theme-aware** styling system
- **Responsive** layouts for all screen sizes
- **Accessibility** features built-in

---

## Testing

### Test Coverage
- **Unit Tests** - Component logic and utilities
- **Integration Tests** - Context and service interactions
- **E2E Tests** - User workflow validation

### Running Tests
```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Test Structure
- `__tests__/components/` - UI component tests
- `__tests__/context/` - Context provider tests
- `__tests__/utils/` - Utility function tests

---

## Deployment

### Production Build
```bash
# Build for production
npx expo build

# Platform-specific builds
npx expo build:android
npx expo build:ios
```

### App Store Submission
- Follow Expo's deployment guide
- Submit to Apple App Store and Google Play Store
- Configure app signing and certificates

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

### Getting Help
- Check terminal output for error messages
- Review [Expo documentation](https://docs.expo.dev/)
- Search [React Native docs](https://reactnative.dev/)
- Ask in community forums

---

## Additional Resources

### Documentation
- [App Structure](./app-structure.md) - Navigation and screen organization
- [Components](./components.md) - UI component library
- [Authentication](./authentication.md) - Auth system details
- [Development Setup](./development-setup.md) - Environment configuration
- [Unit Testing](./unit-testing.md) - Testing strategies and examples

### External Links
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Guide](https://reactnative.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

**Happy learning and coding!**
