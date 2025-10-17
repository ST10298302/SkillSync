import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import PinSetup from '../../components/PinSetup';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { PinService } from '../../services/pinService';

export default function PinSetupScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [isSettingUp, setIsSettingUp] = useState(false);

  const handlePinComplete = async (pin: string) => {
    try {
      await PinService.setPin(pin);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'PIN Set Successfully',
        'Your PIN has been set up successfully. You can now use it to secure your app.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error setting up PIN:', error);
      Alert.alert('Error', 'Failed to set up PIN. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    headerTitle: {
      ...Typography.h2,
      color: themeColors.text,
      fontWeight: '700',
    },
  });

  if (isSettingUp) {
    return (
      <PinSetup
        onComplete={handlePinComplete}
        onCancel={handleCancel}
        title="Set Up PIN"
        subtitle="Create a 4-digit PIN to secure your app"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PIN Setup</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg }}>
        <View style={{
          backgroundColor: themeColors.backgroundSecondary,
          borderRadius: BorderRadius.lg,
          padding: Spacing.xl,
          alignItems: 'center',
          shadowColor: themeColors.shadow as any,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <Ionicons 
            name="lock-closed-outline" 
            size={64} 
            color={themeColors.accent} 
            style={{ marginBottom: Spacing.lg }}
          />
          
          <Text style={{
            ...Typography.h3,
            color: themeColors.text,
            fontWeight: '600',
            marginBottom: Spacing.md,
            textAlign: 'center',
          }}>
            Secure Your App
          </Text>
          
          <Text style={{
            ...Typography.body,
            color: themeColors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: Spacing.xl,
          }}>
            Set up a 4-digit PIN to protect your personal data and learning progress.
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: themeColors.accent,
              paddingHorizontal: Spacing.xl,
              paddingVertical: Spacing.md,
              borderRadius: BorderRadius.md,
              marginBottom: Spacing.md,
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsSettingUp(true);
            }}
          >
            <Text style={{
              ...Typography.body,
              color: 'white',
              fontWeight: '600',
            }}>
              Set Up PIN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
            }}
            onPress={handleCancel}
          >
            <Text style={{
              ...Typography.body,
              color: themeColors.textSecondary,
            }}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
