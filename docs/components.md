# Component Library

A comprehensive guide to SkillSync's reusable UI components, design system, and component architecture.

## Table of Contents

1. [Overview](#overview)
2. [Design System](#design-system)
3. [Core Components](#core-components)
4. [UI Components](#ui-components)
5. [Layout Components](#layout-components)
6. [Form Components](#form-components)
7. [Component Guidelines](#component-guidelines)

---

## Overview

SkillSync uses a comprehensive component library built with React Native, featuring custom components designed for cross-platform compatibility and consistent user experience. All components follow the design system defined in `constants/Colors.ts`.

### Key Principles
- **Consistent Design** - Unified visual language
- **Theme Support** - Light/dark mode compatibility
- **Cross-Platform** - Works on iOS, Android, and Web
- **Accessibility** - Built-in accessibility features
- **Performance** - Optimized for smooth interactions

---

## Design System

### Color Palette
```typescript
// From constants/Colors.ts
export const Colors = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#F1F3F4',
    text: '#1A1A1A',
    textSecondary: '#6C757D',
    accent: '#007AFF',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    border: '#E5E5EA',
    borderSecondary: '#F2F2F7',
    shadow: {
      light: 'rgba(0, 0, 0, 0.05)',
      medium: 'rgba(0, 0, 0, 0.1)',
      heavy: 'rgba(0, 0, 0, 0.2)'
    }
  },
  dark: {
    background: '#1A1A1A',
    backgroundSecondary: '#2C2C2E',
    backgroundTertiary: '#3A3A3C',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    accent: '#0A84FF',
    success: '#30D158',
    error: '#FF453A',
    warning: '#FF9F0A',
    border: '#38383A',
    borderSecondary: '#48484A',
    shadow: {
      light: 'rgba(0, 0, 0, 0.3)',
      medium: 'rgba(0, 0, 0, 0.5)',
      heavy: 'rgba(0, 0, 0, 0.7)'
    }
  }
};
```

### Typography
```typescript
export const Typography = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
};
```

### Spacing & Layout
```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 50,
};
```

---

## Core Components

### UniformLayout
**Location**: `components/UniformLayout.tsx`

**Purpose**: Provides consistent layout wrapper for all screens

**Features**:
- Safe area handling for all platforms
- Theme-aware background colors
- Consistent padding and margins
- Status bar management
- Loading state support

**Usage**:
```typescript
import UniformLayout from '../components/UniformLayout';

export default function MyScreen() {
  return (
    <UniformLayout>
      {/* Screen content */}
    </UniformLayout>
  );
}
```

**Props**:
```typescript
interface UniformLayoutProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  safeArea?: boolean;
}
```

---

## UI Components

### SkillCard
**Location**: `components/SkillCard.tsx`

**Purpose**: Displays individual skill information with actions

**Features**:
- Progress visualization
- Streak indicators
- Edit/delete actions
- Animated interactions
- Theme-aware styling

**Usage**:
```typescript
import SkillCard from '../components/SkillCard';

<SkillCard
  id="skill-1"
  name="React Native"
  progress={75}
  description="Mobile app development"
  onPress={() => handleSkillPress(id)}
  onEdit={handleEdit}
  onDelete={handleDelete}
  totalEntries={12}
  streak={5}
/>
```

**Props**:
```typescript
interface SkillCardProps {
  id: string;
  name: string;
  progress: number;
  description?: string;
  onPress: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  lastUpdated?: string;
  totalEntries?: number;
  streak?: number;
}
```

### ProgressBar
**Location**: `components/ProgressBar.tsx`

**Purpose**: Visual progress indicator with gradient support

**Features**:
- Percentage-based progress
- Customizable height
- Gradient colors
- Theme-aware styling
- Smooth animations

**Usage**:
```typescript
import ProgressBar from '../components/ProgressBar';

<ProgressBar 
  progress={75} 
  height={8} 
  color="#007AFF" 
/>
```

**Props**:
```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
}
```

### ProfilePicture
**Location**: `components/ProfilePicture.tsx`

**Purpose**: User profile image with upload capabilities

**Features**:
- Image upload from camera/gallery
- Profile picture management
- Loading states
- Haptic feedback
- Error handling

**Usage**:
```typescript
import ProfilePicture from '../components/ProfilePicture';

<ProfilePicture
  userId="user-123"
  imageUrl={profileImageUrl}
  size={80}
  onImageUpdate={handleImageUpdate}
  editable={true}
/>
```

**Props**:
```typescript
interface ProfilePictureProps {
  userId: string;
  imageUrl?: string;
  size?: number;
  onImageUpdate?: (newUrl: string) => void;
  editable?: boolean;
}
```

### DiaryItem
**Location**: `components/DiaryItem.tsx`

**Purpose**: Displays individual diary entries

**Features**:
- Date formatting
- Time tracking
- Text display
- Theme-aware styling

**Usage**:
```typescript
import DiaryItem from '../components/DiaryItem';

<DiaryItem
  text="Studied React Native components today"
  date="2024-01-15T10:00:00Z"
  hours={2.5}
/>
```

**Props**:
```typescript
interface DiaryItemProps {
  text: string;
  date: string;
  hours?: number;
}
```

---

## Layout Components

### HapticTab
**Location**: `components/HapticTab.tsx`

**Purpose**: Tab bar with haptic feedback

**Features**:
- Platform-specific styling
- Haptic feedback integration
- Custom tab icons
- Badge support

### AnimatedLogo
**Location**: `components/AnimatedLogo.tsx`

**Purpose**: Animated app logo

**Features**:
- Smooth animations
- Theme-aware colors
- Loading states
- Responsive sizing

---

## Form Components

### AnimatedInput
**Location**: `components/AnimatedInput.tsx`

**Purpose**: Enhanced text input with animations

**Features**:
- Floating label animation
- Error state handling
- Theme-aware styling
- Validation support

**Usage**:
```typescript
import AnimatedInput from '../components/AnimatedInput';

<AnimatedInput
  label="Skill Name"
  value={skillName}
  onChangeText={setSkillName}
  error={errors.name}
  placeholder="Enter skill name"
/>
```

---

## Component Guidelines

### Naming Conventions
- **Components**: PascalCase (e.g., `SkillCard`)
- **Files**: PascalCase with `.tsx` extension
- **Props**: camelCase (e.g., `onPress`, `backgroundColor`)
- **Styles**: camelCase (e.g., `containerStyle`, `textColor`)

### Props Structure
```typescript
interface ComponentProps {
  // Required props first
  id: string;
  title: string;
  
  // Optional props with defaults
  size?: number;
  color?: string;
  
  // Event handlers
  onPress?: () => void;
  onChange?: (value: string) => void;
  
  // Style props last
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
```

### Styling Best Practices
```typescript
// Use StyleSheet.create for performance
const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: themeColors.background,
  },
  text: {
    ...Typography.body,
    color: themeColors.text,
  },
});

// Apply theme colors dynamically
<View style={[styles.container, { backgroundColor: themeColors.background }]}>
  <Text style={[styles.text, { color: themeColors.text }]}>
    Content
  </Text>
</View>
```

### Theme Integration
```typescript
import { useTheme } from '../context/ThemeContext';

const MyComponent = () => {
  const { resolvedTheme } = useTheme();
  const themeColors = Colors[resolvedTheme] || Colors.light;
  
  return (
    <View style={{ backgroundColor: themeColors.background }}>
      {/* Component content */}
    </View>
  );
};
```

### Accessibility
```typescript
// Always include accessibility props
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Edit skill button"
  accessibilityHint="Opens skill editing form"
  accessibilityRole="button"
  onPress={handleEdit}
>
  <Text>Edit</Text>
</TouchableOpacity>
```

---

## Testing Components

### Test IDs
```typescript
// Use consistent test IDs
<TouchableOpacity testID="edit-button">
  <Text>Edit</Text>
</TouchableOpacity>

<TouchableOpacity testID="delete-button">
  <Text>Delete</Text>
</TouchableOpacity>
```

### Component Testing
```typescript
// Example test structure
describe('SkillCard', () => {
  it('renders skill information correctly', () => {
    render(<SkillCard {...mockProps} />);
    expect(screen.getByText('React Native')).toBeTruthy();
    expect(screen.getByText('75% progress')).toBeTruthy();
  });
  
  it('handles edit button press', () => {
    const mockEdit = jest.fn();
    render(<SkillCard {...mockProps} onEdit={mockEdit} />);
    fireEvent.press(screen.getByTestId('edit-button'));
    expect(mockEdit).toHaveBeenCalledWith('skill-1');
  });
});
```

---

## Related Documentation

- [App Structure](./app-structure.md) - Navigation and screen organization
- [Authentication](./authentication.md) - Auth system details
- [Development Setup](./development-setup.md) - Environment configuration
- [Unit Testing](./unit-testing.md) - Testing strategies and examples
- [README](./README.md) - Main project overview
