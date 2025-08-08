# Component Library

## Overview

SkillSync uses a comprehensive component library built with React Native, featuring custom components designed for cross-platform compatibility and consistent user experience. All components follow the design system defined in `constants/Colors.ts`.

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
    // ... more colors
  },
  dark: {
    background: '#1A1A1A',
    backgroundSecondary: '#2C2C2E',
    backgroundTertiary: '#3A3A3C',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    accent: '#0A84FF',
    // ... more colors
  }
};
```

### Typography
```typescript
export const Typography = {
  h1: { fontSize: 32, fontWeight: '700' },
  h2: { fontSize: 24, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodySmall: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
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
```

## Core Components

### UniformLayout
**Location**: `components/UniformLayout.tsx`

**Purpose**: Provides consistent layout wrapper for all screens

**Features**:
- Safe area handling
- Theme-aware background
- Consistent padding
- Status bar management

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

### ThemedView
**Location**: `components/ThemedView.tsx`

**Purpose**: Theme-aware View component

**Features**:
- Automatic theme switching
- Consistent styling
- TypeScript support

**Usage**:
```typescript
import ThemedView from '../components/ThemedView';

<ThemedView style={styles.container}>
  {/* Content */}
</ThemedView>
```

### ThemedText
**Location**: `components/ThemedText.tsx`

**Purpose**: Theme-aware Text component

**Features**:
- Automatic color adaptation
- Typography system integration
- Accessibility support

**Usage**:
```typescript
import ThemedText from '../components/ThemedText';

<ThemedText style={Typography.h1}>
  Hello World
</ThemedText>
```

## UI Components

### SkillCard
**Location**: `components/SkillCard.tsx`

**Purpose**: Displays individual skill information

**Features**:
- Progress visualization
- Touch interactions
- Animated progress bars
- Gradient backgrounds

**Props**:
```typescript
interface SkillCardProps {
  skill: Skill;
  onPress: () => void;
  style?: ViewStyle;
}
```

**Usage**:
```typescript
import SkillCard from '../components/SkillCard';

<SkillCard
  skill={skill}
  onPress={() => router.push(`/skill/${skill.id}`)}
/>
```

### ProgressBar
**Location**: `components/ProgressBar.tsx`

**Purpose**: Visual progress indicator

**Features**:
- Animated progress updates
- Customizable colors
- Smooth transitions
- Accessibility labels

**Props**:
```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
}
```

**Usage**:
```typescript
import ProgressBar from '../components/ProgressBar';

<ProgressBar
  progress={75}
  height={8}
  color={themeColors.accent}
/>
```

### ProfilePicture
**Location**: `components/ProfilePicture.tsx`

**Purpose**: User profile picture with upload functionality

**Features**:
- Image upload from camera/gallery
- Circular design
- Loading states
- Haptic feedback
- Supabase storage integration

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

**Usage**:
```typescript
import ProfilePicture from '../components/ProfilePicture';

<ProfilePicture
  userId={user.id}
  imageUrl={profilePictureUrl}
  size={100}
  onImageUpdate={setProfilePictureUrl}
  editable={true}
/>
```

### AnimatedInput
**Location**: `components/AnimatedInput.tsx`

**Purpose**: Enhanced text input with animations

**Features**:
- Floating label animation
- Error state handling
- Focus animations
- Theme integration

**Props**:
```typescript
interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
}
```

**Usage**:
```typescript
import AnimatedInput from '../components/AnimatedInput';

<AnimatedInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  placeholder="Enter your email"
/>
```

## Animation Components

### AnimatedLogo
**Location**: `components/AnimatedLogo.tsx`

**Purpose**: Animated app logo

**Features**:
- Entrance animations
- Pulse effects
- Responsive sizing
- Performance optimized

**Usage**:
```typescript
import AnimatedLogo from '../components/AnimatedLogo';

<AnimatedLogo size={120} />
```

### HelloWave
**Location**: `components/HelloWave.tsx`

**Purpose**: Animated wave greeting

**Features**:
- SVG-based animation
- Customizable colors
- Smooth wave motion
- Performance optimized

**Usage**:
```typescript
import HelloWave from '../components/HelloWave';

<HelloWave color={themeColors.accent} />
```

## Navigation Components

### HapticTab
**Location**: `components/HapticTab.tsx`

**Purpose**: Tab bar button with haptic feedback

**Features**:
- Haptic feedback on press
- Platform-specific behavior
- Accessibility support
- Custom styling

**Usage**:
```typescript
// Used automatically in tab navigation
<Tabs.Screen
  name="index"
  options={{
    tabBarButton: (props) => <HapticTab {...props} />,
  }}
/>
```

## Utility Components

### Collapsible
**Location**: `components/Collapsible.tsx`

**Purpose**: Animated collapsible content

**Features**:
- Smooth height animations
- Customizable duration
- Performance optimized
- Accessibility support

**Usage**:
```typescript
import Collapsible from '../components/Collapsible';

<Collapsible expanded={isExpanded}>
  <Text>Collapsible content</Text>
</Collapsible>
```

### ExternalLink
**Location**: `components/ExternalLink.tsx`

**Purpose**: External link handling

**Features**:
- Platform-specific link opening
- Error handling
- Loading states
- User feedback

**Usage**:
```typescript
import ExternalLink from '../components/ExternalLink';

<ExternalLink url="https://example.com">
  <Text>Visit Website</Text>
</ExternalLink>
```

## Form Components

### DiaryItem
**Location**: `components/DiaryItem.tsx`

**Purpose**: Individual diary/practice log entry

**Features**:
- Rich text display
- Timestamp formatting
- Touch interactions
- Theme integration

**Props**:
```typescript
interface DiaryItemProps {
  entry: SkillEntry;
  onPress?: () => void;
  onLongPress?: () => void;
}
```

**Usage**:
```typescript
import DiaryItem from '../components/DiaryItem';

<DiaryItem
  entry={entry}
  onPress={() => handleEntryPress(entry)}
  onLongPress={() => handleEntryLongPress(entry)}
/>
```

## Platform-Specific Components

### UI Components
**Location**: `components/ui/`

**Purpose**: Platform-specific UI implementations

**Files**:
- `IconSymbol.ios.tsx` / `IconSymbol.tsx`
- `TabBarBackground.ios.tsx` / `TabBarBackground.tsx`

**Features**:
- iOS-specific styling
- Android-specific styling
- Web-specific optimizations
- Consistent API across platforms

## Component Guidelines

### Naming Conventions
- **PascalCase**: Component names
- **camelCase**: Props and methods
- **kebab-case**: File names for platform-specific components

### Props Interface
- Always define TypeScript interfaces
- Use descriptive prop names
- Include optional props with default values
- Document complex props

### Styling
- Use the design system constants
- Support theme switching
- Provide style prop for customization
- Use StyleSheet.create for performance

### Accessibility
- Include accessibility labels
- Support screen readers
- Provide keyboard navigation
- Use semantic HTML elements (web)

### Performance
- Memoize expensive components
- Use React.memo for pure components
- Optimize re-renders
- Lazy load when appropriate

## Testing Components

### Unit Testing
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import SkillCard from '../components/SkillCard';

test('SkillCard renders correctly', () => {
  const mockSkill = { id: '1', name: 'React', progress: 75 };
  const { getByText } = render(<SkillCard skill={mockSkill} onPress={jest.fn()} />);
  
  expect(getByText('React')).toBeTruthy();
});
```

### Integration Testing
- Test component interactions
- Verify theme switching
- Test accessibility features
- Validate prop handling

## Future Enhancements

### Planned Components
- **DataTable**: Sortable data display
- **Calendar**: Date picker component
- **Charts**: Data visualization components
- **Modal**: Custom modal implementation
- **Toast**: Notification system

### Component Library
- **Storybook**: Component documentation
- **Design Tokens**: Automated design system
- **Component Testing**: Automated testing suite
- **Performance Monitoring**: Component performance tracking
