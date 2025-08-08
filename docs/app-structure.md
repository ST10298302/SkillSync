# App Structure & Navigation

## Overview

SkillSync uses Expo Router for file-based navigation, providing a seamless navigation experience across all platforms. The app structure is organized around authentication states and feature-based routing.

## Directory Structure

```
app/
├── _layout.tsx              # Root layout with providers
├── +not-found.tsx           # 404 page
├── account-settings.tsx     # User account settings
├── (auth)/                  # Authentication group
│   ├── _layout.tsx         # Auth layout
│   ├── index.tsx           # Login screen
│   ├── login.tsx           # Login form
│   └── signup.tsx          # Signup form
├── (tabs)/                  # Main app tabs
│   ├── _layout.tsx         # Tab navigation layout
│   ├── index.tsx           # Skills list (Home)
│   ├── add.tsx             # Add skill (redirects to skill/new)
│   ├── analytics.tsx       # Analytics dashboard
│   └── profile.tsx         # User profile
└── skill/                   # Skill management
    ├── new.tsx             # Create new skill
    ├── [id].tsx            # Skill detail view
    └── [id]/
        └── edit.tsx        # Edit skill form
```

## Navigation Flow

### Authentication Flow
1. **App Launch** → `_layout.tsx` checks auth state
2. **Not Logged In** → Redirects to `(auth)/index.tsx`
3. **Login/Signup** → `(auth)/login.tsx` or `(auth)/signup.tsx`
4. **Success** → Redirects to `(tabs)/index.tsx`

### Main App Flow
1. **Home Tab** → `(tabs)/index.tsx` (Skills list)
2. **Add Skill** → `skill/new.tsx`
3. **Skill Detail** → `skill/[id].tsx`
4. **Edit Skill** → `skill/[id]/edit.tsx`
5. **Analytics** → `(tabs)/analytics.tsx`
6. **Profile** → `(tabs)/profile.tsx`

## Key Components

### Root Layout (`app/_layout.tsx`)
- **Purpose**: Root layout with context providers
- **Providers**: ThemeProvider, AuthProvider, SkillsProvider
- **Navigation**: Stack navigation with conditional routing
- **Features**: 
  - Conditional rendering based on auth state
  - Theme-aware status bar
  - Screen-specific configurations

### Auth Layout (`app/(auth)/_layout.tsx`)
- **Purpose**: Layout for authentication screens
- **Features**:
  - Clean, focused design
  - No tab bar
  - Consistent styling

### Tab Layout (`app/(tabs)/_layout.tsx`)
- **Purpose**: Main app navigation with tabs
- **Features**:
  - Responsive tab bar design
  - Platform-specific styling
  - Haptic feedback integration
  - Custom tab icons

## Screen Details

### Authentication Screens

#### Login (`app/(auth)/login.tsx`)
- Email/password authentication
- Form validation
- Error handling
- Navigation to signup

#### Signup (`app/(auth)/signup.tsx`)
- User registration
- Profile creation
- Email verification flow
- Navigation to login

### Main App Screens

#### Skills List (`app/(tabs)/index.tsx`)
- **Purpose**: Display user's skills
- **Features**:
  - Grid/list view of skills
  - Progress indicators
  - Search functionality
  - Pull-to-refresh
  - Empty state handling

#### Skill Detail (`app/skill/[id].tsx`)
- **Purpose**: Individual skill management
- **Features**:
  - Progress tracking
  - Practice session logging
  - Progress history
  - Edit/delete options
  - Progress visualization

#### Add Skill (`app/skill/new.tsx`)
- **Purpose**: Create new skills
- **Features**:
  - Form validation
  - Category selection
  - Initial progress setting
  - Image upload (future)

#### Edit Skill (`app/skill/[id]/edit.tsx`)
- **Purpose**: Modify existing skills
- **Features**:
  - Pre-populated form
  - Validation
  - Change confirmation
  - Image management

#### Analytics (`app/(tabs)/analytics.tsx`)
- **Purpose**: Skill development insights
- **Features**:
  - Progress charts
  - Time tracking
  - Streak analysis
  - Performance metrics

#### Profile (`app/(tabs)/profile.tsx`)
- **Purpose**: User profile management
- **Features**:
  - Profile picture management
  - Account settings
  - Statistics overview
  - Logout functionality

## Navigation Patterns

### Stack Navigation
- Used for modal screens and detailed views
- Provides back navigation
- Supports custom transitions

### Tab Navigation
- Main app navigation
- Persistent across app sessions
- Platform-optimized styling

### Dynamic Routes
- `[id].tsx` for dynamic skill pages
- Parameter extraction via `useLocalSearchParams`
- Type-safe routing with TypeScript

## Route Guards

### Authentication Guards
- Automatic redirect to auth screens
- Session persistence
- Loading states during auth checks

### Data Guards
- Skill existence validation
- Permission checks
- Error boundaries

## Performance Considerations

### Lazy Loading
- Screens load on demand
- Reduced initial bundle size
- Better startup performance

### Caching
- Skill data cached in context
- Image caching for profile pictures
- Offline support (future)

## Platform Adaptations

### Web
- Responsive design
- Keyboard navigation
- Browser-specific optimizations

### Mobile
- Touch gestures
- Haptic feedback
- Native animations

### Tablet
- Adaptive layouts
- Split-screen support
- Enhanced navigation
