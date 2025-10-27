import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

interface AnimatedInputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  error?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  textContentType?: 'emailAddress' | 'password' | 'username' | 'none' | 'newPassword';
  autoComplete?: string;
}

export const AnimatedInput = forwardRef<TextInput, AnimatedInputProps>(({
  icon,
  label,
  error,
  rightIcon,
  onRightIconPress,
  onFocus,
  onBlur,
  value,
  ...props
}, ref) => {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const blurTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  // Handle input focus with smooth animations and state updates
  const handleFocus = (e: any) => {
    // Clear any pending blur if user refocuses quickly
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
    scaleAnim.value = withTiming(1.01, { duration: 200 });
    onFocus?.(e);
  };

  // Handle input blur with smooth animations and state updates
  const handleBlur = (e: any) => {
    // Add a small delay to prevent autofill popup from closing
    blurTimerRef.current = setTimeout(() => {
      setIsFocused(false);
      focusAnim.value = withTiming(0, { duration: 200 });
      scaleAnim.value = withTiming(1, { duration: 200 });
      onBlur?.(e);
      blurTimerRef.current = null;
    }, 150);
  };

  // Create animated scale transform for focus effect - reduced scale to prevent autofill issues
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            focusAnim.value,
            [0, 1],
            [1, 1.01] // Reduced from 1.02 to minimize visual shift
          ),
        },
      ],
    };
  });

  // Dynamic styles that adapt to theme and focus state
  const containerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: themeColors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6, // Better padding for iOS
    borderWidth: 1,
    borderColor: isFocused ? themeColors.accent : themeColors.border,
    shadowColor: themeColors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isFocused ? 0.15 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[containerStyle, animatedStyle]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? themeColors.accent : themeColors.textSecondary} 
          />
        )}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            style={[
              styles.input, 
              { 
                color: themeColors.black,
              }
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            placeholderTextColor={themeColors.textSecondary}
            {...props}
          />
        </View>
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={themeColors.textSecondary}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <Animated.Text style={[styles.errorText, { color: themeColors.error }]}>
          {error}
        </Animated.Text>
      )}
    </View>
  );
});

AnimatedInput.displayName = 'AnimatedInput';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  inputWrapper: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  input: {
    ...Typography.body,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    height: Platform.OS === 'ios' ? 32 : 36, // Fixed height to ensure consistent positioning
    ...(Platform.OS === 'ios' && {
      paddingTop: 0, // Remove padding to prevent shifting
      paddingBottom: 0, // Remove padding to prevent shifting
      lineHeight: Typography.body.fontSize + 2, // Proper line height for stability
      textAlignVertical: 'center',
    }),
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
  },
}); 