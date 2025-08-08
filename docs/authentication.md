# Authentication System

## Overview

SkillSync uses Supabase for authentication, providing secure user management with email/password authentication. The system is designed to work seamlessly across web and mobile platforms with proper session persistence.

## Architecture

### Components
- **AuthProvider**: React Context for auth state management
- **SupabaseService**: API layer for authentication operations
- **Supabase Client**: Configured with platform-specific storage

### Flow Diagram
```
User Action → AuthProvider → SupabaseService → Supabase Auth → Database
     ↑                                                           ↓
     ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

## Implementation Details

### AuthProvider (`context/AuthContext.tsx`)

#### State Management
```typescript
interface AuthContextProps {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

#### Key Features
- **Session Persistence**: Automatically loads existing sessions
- **Loading States**: Handles async operations gracefully
- **Error Handling**: Comprehensive error management
- **Platform Detection**: Different behavior for web vs native

#### Initialization Flow
1. **App Launch**: AuthProvider initializes
2. **Session Check**: Attempts to load existing session
3. **State Update**: Sets user and login state
4. **Loading Complete**: Enables app navigation

### SupabaseService (`services/supabaseService.ts`)

#### Authentication Methods

##### Sign Up
```typescript
static async signUp(email: string, password: string, name?: string)
```
- Creates user account in Supabase Auth
- Creates user profile in database
- Handles email verification
- Returns user data

##### Sign In
```typescript
static async signIn(email: string, password: string)
```
- Authenticates user credentials
- Loads user profile data
- Handles session creation
- Returns user data

##### Sign Out
```typescript
static async signOut()
```
- Clears session data
- Removes local storage
- Resets auth state

##### Get Current User
```typescript
static async getCurrentUser()
```
- Retrieves current session
- Loads user profile
- Handles session validation

## Storage Strategy

### Web Platform
- **Storage**: AsyncStorage
- **Session Persistence**: Browser-based
- **Security**: HTTPS-only cookies

### Mobile Platform
- **Storage**: SecureStore (iOS) / EncryptedSharedPreferences (Android)
- **Session Persistence**: Device-based
- **Security**: Platform encryption

### Cross-Platform Adapter
```typescript
const customStorage = isBrowser ? {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key)
} : undefined;
```

## Security Features

### Password Security
- **Hashing**: Handled by Supabase Auth
- **Validation**: Client-side password requirements
- **Recovery**: Email-based password reset

### Session Security
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token renewal
- **Session Expiry**: Configurable timeout

### Data Protection
- **HTTPS**: All API communications encrypted
- **Input Validation**: Client and server-side validation
- **SQL Injection**: Prevented by Supabase ORM

## User Profile Management

### Profile Creation
- **Automatic**: Created during signup
- **Fields**: id, email, name, created_at, updated_at
- **Optional**: profile_picture_url

### Profile Updates
- **Real-time**: Immediate UI updates
- **Validation**: Server-side validation
- **Optimistic Updates**: UI updates before server confirmation

## Error Handling

### Common Errors
- **Invalid Credentials**: Clear error messages
- **Network Issues**: Retry mechanisms
- **Session Expired**: Automatic re-authentication
- **Email Verification**: Guided verification flow

### Error Recovery
- **Graceful Degradation**: App continues with limited functionality
- **User Feedback**: Clear error messages
- **Retry Options**: Manual retry mechanisms

## Integration with App

### Navigation Guards
```typescript
// In _layout.tsx
if (loading) return null;
if (!isLoggedIn) return <Stack.Screen name="(auth)" />;
```

### Protected Routes
- **Automatic Redirects**: Unauthenticated users redirected to login
- **Session Validation**: Continuous session checking
- **Loading States**: Smooth transitions during auth checks

### State Synchronization
- **Real-time Updates**: Auth state changes trigger UI updates
- **Context Propagation**: Auth state available throughout app
- **Persistence**: Session survives app restarts

## Development Considerations

### Environment Variables
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Testing
- **Mock Authentication**: Test with mock auth provider
- **Error Scenarios**: Test various error conditions
- **Platform Testing**: Test on web, iOS, and Android

### Debugging
- **Console Logs**: Comprehensive logging for auth operations
- **State Inspection**: React DevTools for state debugging
- **Network Monitoring**: Monitor API calls and responses

## Future Enhancements

### Planned Features
- **Social Login**: Google, Apple, Facebook integration
- **Biometric Auth**: Touch ID, Face ID support
- **Multi-factor Auth**: SMS/Email verification
- **Offline Support**: Local authentication fallback

### Security Improvements
- **Rate Limiting**: Prevent brute force attacks
- **Audit Logging**: Track authentication events
- **Advanced Validation**: Enhanced input validation
- **Session Management**: Advanced session controls
