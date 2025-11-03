# Authentication System

A comprehensive guide to SkillSync's authentication system built with Supabase, including user management, security, and session handling.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation](#implementation)
4. [Security Features](#security-features)
5. [User Management](#user-management)
6. [Session Handling](#session-handling)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## Overview

SkillSync uses **Supabase** for authentication (supabase, 2025), providing secure user management with email/password authentication. The system is designed to work seamlessly across web and mobile platforms with proper session persistence.

### Key Features
- **Email/Password Authentication** - Secure login system
- **Session Persistence** - Automatic login across app restarts
- **Cross-Platform Support** - Works on iOS, Android, and Web
- **Profile Management** - User profile creation and updates
- **Security Best Practices** - Encrypted storage and HTTPS

---

## Architecture

### System Components
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AuthProvider  │───▶│  SupabaseService │───▶│  Supabase Auth  │
│  (React Context)│    │   (API Layer)    │    │   (Backend)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Components │    │   Local Storage  │    │   User Database │
│  (Login/Signup) │    │  (Session Data)  │    │  (Profiles)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow
1. **User Action** → UI Component triggers auth function
2. **AuthProvider** → Manages state and calls service
3. **SupabaseService** → Handles API communication
4. **Supabase Auth** → Validates credentials and creates session
5. **Response** → User data returned to app
6. **State Update** → AuthProvider updates app state

---

## Implementation

### AuthProvider (`context/AuthContext.tsx`)

**Purpose**: Central authentication state management

**State Interface**:
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

**Key Features**:
- **Session Persistence** - Automatically loads existing sessions
- **Loading States** - Handles async operations gracefully
- **Error Handling** - Comprehensive error management
- **Platform Detection** - Different behavior for web vs native

**Initialization Flow**:
```typescript
// 1. App Launch
useEffect(() => {
  initializeAuth();
}, []);

// 2. Session Check
const initializeAuth = async () => {
  try {
    const session = await SupabaseService.getCurrentUser();
    if (session) {
      setUser(session);
      setIsLoggedIn(true);
    }
  } catch (error) {
    console.error('Auth initialization failed:', error);
  } finally {
    setLoading(false);
  }
};
```

### SupabaseService (`services/supabaseService.ts`)

**Purpose**: API layer for authentication operations

**Core Methods**:

#### Sign Up
```typescript
static async signUp(email: string, password: string, name?: string) {
  // 1. Create user account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError) throw authError;
  
  // 2. Create user profile
  if (authData.user) {
    await this.createUserProfile(authData.user.id, name || email);
  }
  
  return authData;
}
```

#### Sign In
```typescript
static async signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}
```

#### Sign Out
```typescript
static async signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  // Clear local storage
  await this.clearLocalData();
}
```

#### Get Current User
```typescript
static async getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  
  if (user) {
    // Load additional profile data
    const profile = await this.getUserProfile(user.id);
    return { ...user, profile };
  }
  
  return null;
}
```

---

## Security Features

### Password Security
- **Minimum Length** - 8 characters required
- **Complexity Requirements** - Mix of letters, numbers, symbols
- **Hashing** - Passwords never stored in plain text (OSWAP, 2025)
- **Rate Limiting** - Prevents brute force attacks (OSWASP, 2025)

### Session Security
- **JWT Tokens** - Secure session management (supabase, 2025)
- **Automatic Expiry** - Sessions expire after inactivity
- **Refresh Tokens** - Seamless session renewal (supabase, 2025)
- **Device Tracking** - Monitor active sessions

### Data Protection
- **HTTPS Only** - All communication encrypted (OSWAP, 2025)
- **Input Validation** - Sanitize user inputs (OSWASP, 2025)
- **SQL Injection Protection** - Parameterized queries (Group, P. G. D., 2025)
- **XSS Prevention** - Content security policies (OSWASP, 2025)

---

## User Management

### User Profile Structure
```typescript
interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
  };
}
```

### Profile Operations

#### Create Profile
```typescript
static async createUserProfile(userId: string, name: string) {
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      name,
      created_at: new Date().toISOString(),
    });
  
  if (error) throw error;
}
```

#### Update Profile
```typescript
static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  
  if (error) throw error;
}
```

#### Delete Profile
```typescript
static async deleteUserProfile(userId: string) {
  // Delete related data first
  await this.deleteUserSkills(userId);
  await this.deleteUserEntries(userId);
  
  // Delete profile
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  
  if (error) throw error;
}
```

---

## Session Handling

### Session Lifecycle
```
App Launch → Check Existing Session → Load User Data → Update State
     ↓
User Action → Validate Session → Perform Operation → Update UI
     ↓
Session Expiry → Clear Local Data → Redirect to Login → Show Message
```

### Session Persistence
```typescript
// Platform-specific storage
const storage = Platform.select({
  web: AsyncStorage,
  default: SecureStore,
});

// Save session data
await storage.setItem('session', JSON.stringify(sessionData));

// Load session data
const sessionData = await storage.getItem('session');
if (sessionData) {
  const session = JSON.parse(sessionData);
  // Validate and restore session
}
```

### Session Validation
```typescript
const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      // Session invalid, clear local data
      await clearLocalData();
      return false;
    }
    
    // Check if session is expired
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      await clearLocalData();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
};
```

---

## Error Handling

### Common Error Types
```typescript
enum AuthError {
  INVALID_CREDENTIALS = 'Invalid email or password',
  EMAIL_ALREADY_EXISTS = 'Email already registered',
  WEAK_PASSWORD = 'Password too weak',
  NETWORK_ERROR = 'Network connection failed',
  SERVER_ERROR = 'Server error, try again later',
  SESSION_EXPIRED = 'Session expired, please login again',
}
```

### Error Handling Strategy
```typescript
const handleAuthError = (error: any) => {
  let userMessage = 'An unexpected error occurred';
  
  if (error.message.includes('Invalid login credentials')) {
    userMessage = 'Invalid email or password';
  } else if (error.message.includes('User already registered')) {
    userMessage = 'Email already registered';
  } else if (error.message.includes('Password should be at least')) {
    userMessage = 'Password must be at least 8 characters';
  }
  
  // Show user-friendly error message
  Alert.alert('Authentication Error', userMessage);
  
  // Log detailed error for debugging
  console.error('Auth error details:', error);
};
```

### Recovery Strategies
- **Network Errors** - Retry with exponential backoff
- **Session Expiry** - Automatic redirect to login
- **Validation Errors** - Show specific field errors
- **Server Errors** - Graceful degradation with retry options

---

## Testing

### Unit Tests
```typescript
describe('AuthContext', () => {
  it('should sign in user successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    jest.spyOn(SupabaseService, 'signIn').mockResolvedValue({ user: mockUser });
    
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoggedIn).toBe(true);
  });
  
  it('should handle sign in errors', async () => {
    const mockError = new Error('Invalid credentials');
    jest.spyOn(SupabaseService, 'signIn').mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      try {
        await result.current.signIn('test@example.com', 'wrong');
      } catch (error) {
        expect(error).toEqual(mockError);
      }
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });
});
```

### Integration Tests
- **End-to-end authentication flow**
- **Session persistence across app restarts**
- **Error handling and recovery**
- **Cross-platform compatibility**

---

## Related Documentation

- [App Structure](./app-structure.md) - Navigation and screen organization
- [Components](./components.md) - UI component library
- [Development Setup](./development-setup.md) - Environment configuration
- [Unit Testing](./unit-testing.md) - Testing strategies and examples
- [README](./README.md) - Main project overview
