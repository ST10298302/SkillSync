import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Logo from '../../components/Logo';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';

export default function PrivacySecuritySettings() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showProgress: true,
    showStreaks: true,
    allowAnalytics: true,
    allowCrashReports: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    biometricAuth: false,
    requirePin: false,
    autoLock: true,
    sessionTimeout: '30min',
  });

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const togglePrivacySetting = (key: keyof typeof privacySettings) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleSecuritySetting = (key: keyof typeof securitySettings) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Account Deletion', 'Account deletion feature will be implemented soon.');
          }
        },
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    value, 
    onToggle, 
    icon,
    type = 'switch'
  }: {
    title: string;
    subtitle: string;
    value: boolean | string;
    onToggle: () => void;
    icon: string;
    type?: 'switch' | 'chevron';
  }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={type === 'chevron' ? onToggle : undefined}
      disabled={type === 'switch'}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color={themeColors.accent} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value as boolean}
          onValueChange={onToggle}
          trackColor={{ false: themeColors.border, true: themeColors.accent + '40' }}
          thumbColor={value ? themeColors.accent : themeColors.textSecondary}
          ios_backgroundColor={themeColors.border}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      paddingBottom: Spacing.xl,
    },
    header: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.lg,
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
    logoContainer: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    section: {
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
    },
    sectionTitle: {
      ...Typography.h3,
      color: themeColors.text,
      fontWeight: '600',
      marginBottom: Spacing.md,
    },
    card: {
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      shadowColor: themeColors.shadow as any,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    settingIcon: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.accent + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      ...Typography.body,
      color: themeColors.text,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    settingSubtitle: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      lineHeight: 18,
    },
    dangerCard: {
      backgroundColor: themeColors.error + '10',
      borderWidth: 1,
      borderColor: themeColors.error + '20',
    },
    dangerItem: {
      borderBottomColor: themeColors.error + '20',
    },
    dangerTitle: {
      color: themeColors.error,
    },
    infoSection: {
      backgroundColor: themeColors.info + '10',
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginTop: Spacing.lg,
    },
    infoText: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
  });

  return (
    <UniformLayout>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Privacy & Security</Text>
          </View>
          <View style={styles.logoContainer}>
            <Logo size={40} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.card}>
            <SettingItem
              title="Profile Visibility"
              subtitle="Control who can see your profile"
              value={privacySettings.profileVisibility}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Navigate to profile visibility settings
              }}
              icon="eye-outline"
              type="chevron"
            />
            <SettingItem
              title="Show Progress"
              subtitle="Allow others to see your skill progress"
              value={privacySettings.showProgress}
              onToggle={() => togglePrivacySetting('showProgress')}
              icon="trending-up-outline"
            />
            <SettingItem
              title="Show Streaks"
              subtitle="Display your learning streaks publicly"
              value={privacySettings.showStreaks}
              onToggle={() => togglePrivacySetting('showStreaks')}
              icon="flame-outline"
            />
            <SettingItem
              title="Analytics"
              subtitle="Help improve SkillSync with anonymous data"
              value={privacySettings.allowAnalytics}
              onToggle={() => togglePrivacySetting('allowAnalytics')}
              icon="analytics-outline"
            />
            <SettingItem
              title="Crash Reports"
              subtitle="Send crash reports to help fix issues"
              value={privacySettings.allowCrashReports}
              onToggle={() => togglePrivacySetting('allowCrashReports')}
              icon="bug-outline"
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <View style={styles.card}>
            <SettingItem
              title="Biometric Authentication"
              subtitle="Use fingerprint or face ID to unlock"
              value={securitySettings.biometricAuth}
              onToggle={() => toggleSecuritySetting('biometricAuth')}
              icon="finger-print-outline"
            />
            <SettingItem
              title="Require PIN"
              subtitle="Set a PIN code for app access"
              value={securitySettings.requirePin}
              onToggle={() => toggleSecuritySetting('requirePin')}
              icon="lock-closed-outline"
            />
            <SettingItem
              title="Auto Lock"
              subtitle="Lock app when inactive"
              value={securitySettings.autoLock}
              onToggle={() => toggleSecuritySetting('autoLock')}
              icon="timer-outline"
            />
            <SettingItem
              title="Session Timeout"
              subtitle="Set automatic logout time"
              value={securitySettings.sessionTimeout}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Navigate to session timeout settings
              }}
              icon="time-outline"
              type="chevron"
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <View style={[styles.card, styles.dangerCard]}>
            <SettingItem
              title="Export Data"
              subtitle="Download all your data"
              value={false}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Implement data export
                Alert.alert('Export Data', 'Data export feature will be implemented soon.');
              }}
              icon="download-outline"
              type="chevron"
            />
            <SettingItem
              title="Delete Account"
              subtitle="Permanently delete your account and data"
              value={false}
              onToggle={handleDeleteAccount}
              icon="trash-outline"
              type="chevron"
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Your privacy and security are important to us. We never share your personal data with third parties without your explicit consent.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </UniformLayout>
  );
}
