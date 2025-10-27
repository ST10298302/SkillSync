import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Colors, Spacing, Typography } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { PinService } from '../services/pinService';

interface PinVerificationProps {
  onSuccess: () => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  maxAttempts?: number;
}

export default function PinVerification({ 
  onSuccess, 
  onCancel, 
  title = "Enter PIN", 
  subtitle = "Enter your PIN to continue",
  maxAttempts = 3
}: PinVerificationProps) {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' || resolvedTheme === 'darker' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleNumberPress = (number: string) => {
    if (error) setError('');
    if (isLoading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (pin.length < 4) {
      setPin(prev => prev + number);
    }
  };

  const handleBackspace = () => {
    if (isLoading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isLoading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPin('');
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  React.useEffect(() => {
    if (pin.length === 4) {
      verifyPin();
    }
  }, [pin]);

  const verifyPin = async () => {
    setIsLoading(true);
    
    try {
      const isValid = await PinService.verifyPin(pin);
      
      if (isValid) {
        // PIN is correct
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess();
      } else {
        // PIN is incorrect
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          Alert.alert(
            'Too Many Attempts',
            'You have exceeded the maximum number of attempts. Please try again later.',
            [
              {
                text: 'OK',
                onPress: () => {
                  if (onCancel) onCancel();
                }
              }
            ]
          );
        } else {
          setError(`Incorrect PIN. ${maxAttempts - newAttempts} attempts remaining.`);
          shakeAnimation();
          setPin('');
        }
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Error verifying PIN. Please try again.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: pin.length > index 
                  ? themeColors.accent 
                  : themeColors.border,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'backspace'],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.numberButton,
                  {
                    backgroundColor: item === 'backspace' 
                      ? themeColors.backgroundSecondary 
                      : themeColors.backgroundTertiary,
                    opacity: isLoading ? 0.5 : 1,
                  },
                ]}
                onPress={() => {
                  if (isLoading) return;
                  
                  if (item === 'backspace') {
                    handleBackspace();
                  } else if (item !== '') {
                    handleNumberPress(item);
                  }
                }}
                disabled={item === '' || isLoading}
              >
                {item === 'backspace' ? (
                  <Ionicons name="backspace-outline" size={24} color={themeColors.text} />
                ) : (
                  <Text style={[styles.numberText, { color: themeColors.text }]}>
                    {item}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
      padding: Spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginTop: Spacing.xl,
      marginBottom: Spacing.xl,
    },
    title: {
      ...Typography.h2,
      color: themeColors.text,
      fontWeight: '700',
      marginBottom: Spacing.sm,
    },
    subtitle: {
      ...Typography.body,
      color: themeColors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: Spacing.xl,
    },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginHorizontal: Spacing.sm,
    },
    errorText: {
      ...Typography.caption,
      color: themeColors.error,
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    numberPad: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.lg,
    },
    numberRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: Spacing.lg,
    },
    numberButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: themeColors.shadow as any,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    numberText: {
      ...Typography.h3,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    footerButton: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    footerButtonText: {
      ...Typography.body,
      color: themeColors.accent,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: themeColors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        {renderDots()}
      </Animated.View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {renderNumberPad()}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={handleClear}
          disabled={isLoading}
        >
          <Text style={[styles.footerButtonText, styles.cancelButtonText]}>
            Clear
          </Text>
        </TouchableOpacity>
        {onCancel && (
          <TouchableOpacity 
            style={styles.footerButton} 
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={[styles.footerButtonText, styles.cancelButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
