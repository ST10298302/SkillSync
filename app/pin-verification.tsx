import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Logo from '../components/Logo';
import PinVerification from '../components/PinVerification';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { usePinLock } from '../context/PinLockContext';
import { useTheme } from '../context/ThemeContext';
import { PinService } from '../services/pinService';

export default function PinVerificationScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { unlockApp } = usePinLock();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' || resolvedTheme === 'darker' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [isVerifying, setIsVerifying] = useState(true);

  console.log('PIN verification screen: Component rendered');

  useEffect(() => {
    // Check if PIN is actually enabled
    const checkPinStatus = async () => {
      console.log('PIN verification screen: checking PIN status');
      const pinEnabled = await PinService.isPinEnabled();
      console.log('PIN verification screen: PIN enabled =', pinEnabled);
      if (!pinEnabled) {
        // PIN is not enabled, go back to main app
        console.log('PIN verification screen: PIN not enabled, redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('PIN verification screen: PIN is enabled, staying on verification screen');
      }
    };

    checkPinStatus();

    // Cleanup function to log when component unmounts
    return () => {
      console.log('PIN verification screen: Component unmounting');
    };
  }, []);

  const handlePinSuccess = () => {
    console.log('PIN verification successful, unlocking app');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Unlock the app
    unlockApp();
    // Navigate back to main app
    router.replace('/(tabs)');
  };

  const handlePinCancel = () => {
    // For security, we don't allow canceling PIN verification
    // User must enter correct PIN to proceed
    Alert.alert(
      'PIN Required',
      'You must enter your PIN to access the app.',
      [{ text: 'OK' }]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      alignItems: 'center',
      paddingTop: Spacing.xl * 2,
      paddingBottom: Spacing.xl,
    },
    logoContainer: {
      marginBottom: Spacing.lg,
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
    },
  });

  if (isVerifying) {
    return (
      <PinVerification
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
        title="Enter PIN"
        subtitle="Enter your PIN to access SkillSync"
        maxAttempts={5}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo size={60} />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Enter your PIN to secure your learning progress
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            backgroundColor: themeColors.accent,
            paddingHorizontal: Spacing.xl,
            paddingVertical: Spacing.md,
            borderRadius: BorderRadius.md,
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsVerifying(true);
          }}
        >
          <Text style={{
            ...Typography.body,
            color: 'white',
            fontWeight: '600',
          }}>
            Enter PIN
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
