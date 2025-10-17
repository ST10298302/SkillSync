import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Colors, Spacing, Typography } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { BiometricService } from '../services/biometricService';

interface BiometricVerificationProps {
  onSuccess: () => void;
  onFallback: () => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  maxAttempts?: number;
}

export default function BiometricVerification({ 
  onSuccess, 
  onFallback,
  onCancel, 
  title = "Biometric Authentication", 
  subtitle = "Use your biometric to access SkillSync",
  maxAttempts = 3
}: BiometricVerificationProps) {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    // Auto-trigger biometric authentication when component mounts
    setTimeout(() => {
      handleBiometricAuth();
    }, 500);
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await BiometricService.isAvailable();
      const type = await BiometricService.getPrimaryBiometricType();
      
      setIsAvailable(available);
      setBiometricType(type);

      if (!available) {
        // If biometric is not available, fallback to PIN
        onFallback();
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
      onFallback();
    }
  };

  const handleBiometricAuth = async () => {
    if (!isAvailable || isLoading) return;

    setIsLoading(true);
    
    try {
      const success = await BiometricService.authenticate(
        `Access SkillSync with ${biometricType}`
      );

      if (success) {
        // Authentication successful
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess();
      } else {
        // Authentication failed
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          Alert.alert(
            'Too Many Attempts',
            'You have exceeded the maximum number of biometric attempts. Please use your PIN instead.',
            [
              {
                text: 'Use PIN',
                onPress: onFallback,
              }
            ]
          );
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert(
            'Authentication Failed',
            `${biometricType} authentication failed. ${maxAttempts - newAttempts} attempts remaining.`,
            [
              { text: 'Try Again', onPress: () => setIsLoading(false) },
              { text: 'Use PIN', onPress: onFallback }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        'Biometric authentication failed. Please use your PIN instead.',
        [
          { text: 'Use PIN', onPress: onFallback }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFallback();
  };

  const handleCancel = () => {
    if (onCancel) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onCancel();
    }
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
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: themeColors.accent + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    title: {
      ...Typography.h2,
      color: themeColors.text,
      fontWeight: '700',
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      ...Typography.body,
      color: themeColors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: Spacing.xl,
    },
    statusText: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    buttonContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: Spacing.lg,
    },
    primaryButton: {
      backgroundColor: themeColors.accent,
      borderRadius: 12,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
      marginBottom: Spacing.md,
      opacity: isLoading ? 0.6 : 1,
    },
    primaryButtonText: {
      ...Typography.body,
      color: 'white',
      fontWeight: '600',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderRadius: 12,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border,
      marginBottom: Spacing.sm,
    },
    secondaryButtonText: {
      ...Typography.body,
      color: themeColors.textSecondary,
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderRadius: 12,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...Typography.body,
      color: themeColors.textSecondary,
    },
  });

  if (!isAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="finger-print-outline" size={48} color={themeColors.accent} />
          </View>
          <Text style={styles.title}>Biometric Not Available</Text>
          <Text style={styles.subtitle}>
            Biometric authentication is not available. Please use your PIN instead.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleFallback}>
            <Text style={styles.primaryButtonText}>Use PIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={biometricType.includes('Face') ? 'scan-outline' : 'finger-print-outline'} 
            size={48} 
            color={themeColors.accent} 
          />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.statusText}>
          {isLoading ? 'Authenticating...' : `Touch ${biometricType} to continue`}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleBiometricAuth}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Authenticating...' : `Use ${biometricType}`}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleFallback}>
          <Text style={styles.secondaryButtonText}>Use PIN Instead</Text>
        </TouchableOpacity>
        
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
