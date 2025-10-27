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

interface BiometricSetupProps {
  onComplete: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export default function BiometricSetup({ 
  onComplete, 
  onCancel, 
  title = "Enable Biometric Authentication", 
  subtitle = "Use your fingerprint or face to quickly access SkillSync" 
}: BiometricSetupProps) {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' || resolvedTheme === 'darker' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await BiometricService.isAvailable();
      const type = await BiometricService.getPrimaryBiometricType();
      
      setIsAvailable(available);
      setBiometricType(type);

      if (!available) {
        Alert.alert(
          'Biometric Not Available',
          'Biometric authentication is not available on this device. Please set up a PIN instead.',
          [
            {
              text: 'OK',
              onPress: onCancel,
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  };

  const handleEnableBiometric = async () => {
    if (!isAvailable) return;

    setIsLoading(true);
    
    try {
      // First, authenticate to test biometric
      const success = await BiometricService.authenticate(
        `Enable ${biometricType} for SkillSync`
      );

      if (success) {
        // If authentication successful, enable biometric
        await BiometricService.enableBiometric();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Authentication Failed',
          'Biometric authentication was not successful. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        'Failed to enable biometric authentication. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
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
    biometricInfo: {
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: 12,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    biometricInfoTitle: {
      ...Typography.body,
      color: themeColors.text,
      fontWeight: '600',
      marginBottom: Spacing.sm,
    },
    biometricInfoText: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      lineHeight: 18,
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
    },
    secondaryButtonText: {
      ...Typography.body,
      color: themeColors.textSecondary,
      fontWeight: '600',
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
            This device doesn't support biometric authentication or it's not set up.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
            <Text style={styles.secondaryButtonText}>Continue with PIN</Text>
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
      </View>

      <View style={styles.biometricInfo}>
        <Text style={styles.biometricInfoTitle}>What you'll get:</Text>
        <Text style={styles.biometricInfoText}>
          • Quick access with {biometricType.toLowerCase()}{'\n'}
          • Enhanced security for your learning progress{'\n'}
          • Seamless authentication experience{'\n'}
          • Fallback to PIN if biometric fails
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleEnableBiometric}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Setting up...' : `Enable ${biometricType}`}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
          <Text style={styles.secondaryButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
