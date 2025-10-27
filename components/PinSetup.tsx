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

interface PinSetupProps {
  onComplete: (pin: string) => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export default function PinSetup({ onComplete, onCancel, title = "Set Up PIN", subtitle = "Create a 4-digit PIN to secure your app" }: PinSetupProps) {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' || resolvedTheme === 'darker' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleNumberPress = (number: string) => {
    if (error) setError('');
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isConfirming) {
      if (confirmPin.length < 4) {
        setConfirmPin(prev => prev + number);
      }
    } else {
      if (pin.length < 4) {
        setPin(prev => prev + number);
      }
    }
  };

  const handleBackspace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isConfirming) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isConfirming) {
      setConfirmPin('');
    } else {
      setPin('');
    }
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
    if (pin.length === 4 && !isConfirming) {
      setIsConfirming(true);
    }
  }, [pin]);

  React.useEffect(() => {
    if (confirmPin.length === 4) {
      if (pin === confirmPin) {
        // PINs match, save and complete
        savePin(pin);
        onComplete(pin);
      } else {
        // PINs don't match, show error and reset
        setError('PINs do not match. Please try again.');
        shakeAnimation();
        setTimeout(() => {
          setPin('');
          setConfirmPin('');
          setIsConfirming(false);
          setError('');
        }, 2000);
      }
    }
  }, [confirmPin]);

  const savePin = async (pinToSave: string) => {
    try {
      await PinService.setPin(pinToSave);
    } catch (error) {
      console.error('Error saving PIN:', error);
      Alert.alert('Error', 'Failed to save PIN. Please try again.');
    }
  };

  const renderDots = (currentPin: string) => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: currentPin.length > index 
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
                  },
                ]}
                onPress={() => {
                  if (item === 'backspace') {
                    handleBackspace();
                  } else if (item !== '') {
                    handleNumberPress(item);
                  }
                }}
                disabled={item === ''}
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
        <Text style={styles.subtitle}>
          {isConfirming ? 'Confirm your PIN' : subtitle}
        </Text>
      </View>

      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        {renderDots(isConfirming ? confirmPin : pin)}
      </Animated.View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {renderNumberPad()}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={handleClear}>
          <Text style={[styles.footerButtonText, styles.cancelButtonText]}>
            Clear
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={onCancel}>
          <Text style={[styles.footerButtonText, styles.cancelButtonText]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
