# App Structure & Navigation

A comprehensive guide to the SkillSync app's file structure, navigation flow, and screen organization.

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Navigation Flow](#navigation-flow)
4. [Screen Details](#screen-details)
5. [Layout Components](#layout-components)
6. [Routing Patterns](#routing-patterns)

---

## Overview

SkillSync uses **Expo Router** for file-based navigation (Docs, E., 2025), providing a seamless navigation experience across all platforms. The app structure is organized around authentication states and feature-based routing.

### Key Principles
- **File-based routing** - Each file represents a route
- **Group-based organization** - Related screens grouped together
- **Conditional rendering** - Content based on authentication state
- **Responsive design** - Adapts to different screen sizes

---

## Directory Structure

```
app/
├── _layout.tsx              # Root layout with providers
├── +not-found.tsx           # 404 error page
├── account-settings.tsx     # User account settings
├── (auth)/                  # Authentication group
│   ├── _layout.tsx         # Auth layout wrapper
│   ├── index.tsx           # Auth landing page
│   ├── login.tsx           # User login form
│   └── signup.tsx          # User registration form
├── (tabs)/                  # Main app tabs
│   ├── _layout.tsx         # Tab navigation layout
│   ├── index.tsx           # Home dashboard
│   ├── add.tsx             # Add skill (redirects)
│   ├── analytics.tsx       # Analytics dashboard
│   └── profile.tsx         # User profile management
└── skill/                   # Skill management
    ├── new.tsx             # Create new skill
    ├── [id].tsx            # Skill detail view
    └── [id]/
        └── edit.tsx        # Edit skill form
```

---

## Navigation Flow

### Authentication Flow
```
App Launch → Check Auth State
    ↓
Not Logged In → Auth Screens
    ↓
Login/Signup → Validate Credentials
    ↓
Success → Main App Tabs
```

### Main App Flow
```
Home Tab → Skills Dashboard
    ↓
Add Skill → Skill Creation Form
    ↓
Skill Detail → View & Manage Skill
    ↓
Edit Skill → Modify Skill Details
    ↓
Analytics → Learning Insights
    ↓
Profile → User Settings
```

---

## Screen Details

### Authentication Screens

#### Login (`app/(auth)/login.tsx`)
- **Purpose**: User authentication
- **Features**:
  - Email/password form
  - Form validation
  - Error handling
  - Navigation to signup
  - "Forgot password" link

#### Signup (`app/(auth)/signup.tsx`)
- **Purpose**: User registration
- **Features**:
  - User profile creation
  - Email verification flow
  - Password strength validation
  - Navigation to login

### Main App Screens

#### Home Dashboard (`app/(tabs)/index.tsx`)
- **Purpose**: Skills overview and quick actions
- **Features**:
  - Skills grid/list view
  - Progress indicators
  - Statistics cards
  - Quick action buttons
  - Pull-to-refresh

#### Analytics (`app/(tabs)/analytics.tsx`)
- **Purpose**: Learning insights and progress
- **Features**:
  - Progress charts
  - Streak tracking
  - Time analytics
  - Learning patterns

#### Profile (`app/(tabs)/profile.tsx`)
- **Purpose**: User profile management
- **Features**:
  - Profile picture
  - Account settings
  - Learning statistics
  - App preferences

### Skill Management Screens

#### New Skill (`app/skill/new.tsx`)
- **Purpose**: Create new learning skill
- **Features**:
  - Skill name/description
  - Initial progress setting
  - Category selection
  - Goal setting

#### Skill Detail (`app/skill/[id].tsx`)
- **Purpose**: View and manage individual skill
- **Features**:
  - Progress tracking
  - Diary entries
  - Time logging
  - Edit/delete actions

#### Edit Skill (`app/skill/[id]/edit.tsx`)
- **Purpose**: Modify skill details
- **Features**:
  - Update skill information
  - Progress adjustment
  - Category changes
  - Goal modification

---

## Layout Components

### Root Layout (`app/_layout.tsx`)
- **Purpose**: App-wide configuration and providers
- **Responsibilities**:
  - Context providers setup
  - Authentication state management
  - Theme configuration
  - Navigation structure
  - Error boundaries

### Auth Layout (`app/(auth)/_layout.tsx`)
- **Purpose**: Authentication screen wrapper
- **Features**:
  - Clean, focused design
  - No tab bar
  - Consistent styling
  - Smooth transitions

### Tab Layout (`app/(tabs)/_layout.tsx`)
- **Purpose**: Main app navigation structure
- **Features**:
  - Responsive tab bar
  - Platform-specific styling
  - Haptic feedback
  - Custom tab icons
  - Badge support

---

## Routing Patterns

### Dynamic Routes
- `skill/[id].tsx` - Dynamic skill ID routing
- `skill/[id]/edit.tsx` - Nested dynamic routing

### Group Routes
- `(auth)/` - Authentication screen group
- `(tabs)/` - Main app tab group

### Special Files
- `_layout.tsx` - Layout wrapper for route groups
- `+not-found.tsx` - 404 error handling
- `index.tsx` - Default route for groups

### Navigation Methods
```typescript
// Navigate to skill detail
router.push(`/skill/${skillId}`);

// Navigate to edit skill
router.push(`/skill/${skillId}/edit`);

// Go back
router.back();

// Navigate to home
router.push('/(tabs)');
```

---

## Styling & Theming

### Design System
- **Consistent spacing** using predefined values
- **Theme-aware colors** for light/dark modes
- **Responsive layouts** for all screen sizes
- **Accessibility features** built-in

### Component Styling
- **StyleSheet.create()** for performance
- **Theme context** for dynamic theming
- **Platform-specific** styling when needed
- **Reusable components** for consistency

---

## Platform Considerations

### iOS
- **Safe area** handling
- **iOS-specific** navigation patterns
- **Haptic feedback** integration

### Android
- **Material Design** guidelines
- **Android-specific** navigation
- **Back button** handling

### Web
- **Responsive design** for different screen sizes
- **Keyboard navigation** support
- **Browser compatibility** considerations

---

## Development Tips

### Adding New Screens
1. Create file in appropriate directory
2. Follow naming conventions
3. Add to navigation if needed
4. Update related documentation

### Navigation Testing
- Test all navigation paths
- Verify back button behavior
- Check deep linking
- Test platform-specific features

### Performance (React, 2025; Mandalchandan, 2024)
- Lazy load screens when possible (React, 2025)
- Optimize image assets
- Minimize bundle size
- Use React.memo for components (React, 2025)
- Monitor memory usage to prevent leaks (Mandalchandan, 2024)

---

## Related Documentation

- [Components](./components.md) - UI component library
- [Authentication](./authentication.md) - Auth system details
- [Development Setup](./development-setup.md) - Environment configuration
- [README](./README.md) - Main project overview
