import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import Logo from '../../components/Logo';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { usePinLock } from '../../context/PinLockContext';
import { useTheme } from '../../context/ThemeContext';
import { BiometricService } from '../../services/biometricService';
import { PinService } from '../../services/pinService';
import { SupabaseService } from '../../services/supabaseService';

export default function PrivacySecuritySettings() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const { refreshPinStatus, refreshSessionTimeout } = usePinLock();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' || resolvedTheme === 'darker' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public' as 'public' | 'private' | 'friends',
    showProgress: true,
    showStreaks: true,
    allowAnalytics: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    biometricAuth: false,
    requirePin: false,
    autoLock: true,
    sessionTimeout: '30min' as '1min' | '5min' | '15min' | '30min' | '1hour' | 'never',
  });

  const [loading, setLoading] = useState(false);
  const [pinStatus, setPinStatus] = useState({ enabled: false, hasPin: false });
  const [biometricStatus, setBiometricStatus] = useState({
    available: false,
    enabled: false,
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

  // Load settings from database
  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  // Refresh settings when screen comes into focus (e.g., returning from PIN setup)
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadSettings();
      }
    }, [user?.id])
  );

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [privacyData, securityData, pinData, biometricData] = await Promise.all([
        SupabaseService.getPrivacySettings(user!.id),
        SupabaseService.getSecuritySettings(user!.id),
        PinService.getPinStatus(),
        BiometricService.getBiometricStatus()
      ]);
      
      setPrivacySettings(privacyData);
      setSecuritySettings(securityData);
      setPinStatus(pinData);
      setBiometricStatus({
        available: biometricData.available,
        enabled: biometricData.enabled,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePrivacySetting = async (key: keyof typeof privacySettings) => {
    if (!user?.id) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newValue = !privacySettings[key];
    setPrivacySettings(prev => ({
      ...prev,
      [key]: newValue,
    }));

    try {
      await SupabaseService.updatePrivacySettings(user.id, {
        [key]: newValue,
      });
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      // Revert on error
      setPrivacySettings(prev => ({
        ...prev,
        [key]: !newValue,
      }));
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const toggleSecuritySetting = async (key: keyof typeof securitySettings) => {
    if (!user?.id) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Special handling for auto lock - can only be enabled if PIN is enabled
    if (key === 'autoLock') {
      if (!securitySettings.autoLock && !pinStatus.enabled) {
        Alert.alert(
          'PIN Required',
          'You must enable PIN protection before you can enable auto lock.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Enable PIN First', 
              onPress: () => {
                // Navigate to PIN setup
                router.push('/settings/pin-setup');
              }
            }
          ]
        );
        return;
      }
    }
    
    // Special handling for PIN requirement
    if (key === 'requirePin') {
      if (!securitySettings.requirePin) {
        // Enabling PIN - always ask to set up a new PIN
        Alert.alert(
          'Set Up PIN',
          'You need to set up a PIN to enable PIN protection.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Set Up PIN', 
              onPress: () => router.push('/settings/pin-setup')
            }
          ]
        );
        return;
      } else {
        // Disabling PIN - confirm action
        Alert.alert(
          'Disable PIN Protection',
          'Are you sure you want to disable PIN protection? This will make your app less secure.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Disable', 
              style: 'destructive',
              onPress: async () => {
                try {
                  await PinService.disablePin();
                  await SupabaseService.updateSecuritySettings(user.id, {
                    requirePin: false,
                  });
                  
                  setSecuritySettings(prev => ({
                    ...prev,
                    requirePin: false,
                  }));
                  
                  setPinStatus(prev => ({ ...prev, enabled: false }));
                  
                  // Force refresh PIN status in PinLockContext
                  setTimeout(() => {
                    refreshPinStatus();
                  }, 100);
                } catch (error) {
                  console.error('Error disabling PIN:', error);
                  Alert.alert('Error', 'Failed to disable PIN protection. Please try again.');
                }
              }
            }
          ]
        );
        return;
      }
    }

    // Special handling for biometric authentication
    if (key === 'biometricAuth') {
      if (!securitySettings.biometricAuth) {
        // Enabling biometric - check if biometric is available
        if (!biometricStatus.available) {
          Alert.alert(
            'Biometric Not Available',
            'Biometric authentication is not available on this device or not set up.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Test biometric authentication
        try {
          const success = await BiometricService.authenticate(
            'Enable biometric authentication for SkillSync'
          );
          
          if (success) {
            await BiometricService.enableBiometric();
            setSecuritySettings(prev => ({
              ...prev,
              biometricAuth: true,
            }));
            setBiometricStatus(prev => ({ ...prev, enabled: true }));
            
            await SupabaseService.updateSecuritySettings(user.id, {
              biometricAuth: true,
            });
          } else {
            Alert.alert(
              'Authentication Failed',
              'Biometric authentication failed. Please try again.',
              [{ text: 'OK' }]
            );
          }
        } catch (error) {
          console.error('Error enabling biometric:', error);
          Alert.alert('Error', 'Failed to enable biometric authentication. Please try again.');
        }
        return;
      } else {
        // Disabling biometric - confirm action
        Alert.alert(
          'Disable Biometric Authentication',
          'Are you sure you want to disable biometric authentication?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Disable', 
              style: 'destructive',
              onPress: async () => {
                try {
                  await BiometricService.disableBiometric();
                  setSecuritySettings(prev => ({
                    ...prev,
                    biometricAuth: false,
                  }));
                  setBiometricStatus(prev => ({ ...prev, enabled: false }));
                  
                  await SupabaseService.updateSecuritySettings(user.id, {
                    biometricAuth: false,
                  });
                } catch (error) {
                  console.error('Error disabling biometric:', error);
                  Alert.alert('Error', 'Failed to disable biometric authentication. Please try again.');
                }
              }
            }
          ]
        );
        return;
      }
    }
    
    const newValue = !securitySettings[key];
    setSecuritySettings(prev => ({
      ...prev,
      [key]: newValue,
    }));

    try {
      await SupabaseService.updateSecuritySettings(user.id, {
        [key]: newValue,
      });
      
      // Update PIN status if enabling PIN
      if (key === 'requirePin' && newValue) {
        setPinStatus(prev => ({ ...prev, enabled: true }));
      }
    } catch (error) {
      console.error('Error updating security setting:', error);
      // Revert on error
      setSecuritySettings(prev => ({
        ...prev,
        [key]: !newValue,
      }));
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleExportData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await SupabaseService.exportUserData(user.id);
      
      // Create a JSON string and share it
      const jsonString = JSON.stringify(data, null, 2);
      
      await Share.share({
        message: jsonString,
        title: 'SkillSync Data Export',
      });
      
      Alert.alert('Success', 'Your data has been exported successfully.');
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfileVisibility = async (visibility: 'public' | 'private' | 'friends') => {
    if (!user?.id) return;
    
    try {
      await SupabaseService.updatePrivacySettings(user.id, {
        profileVisibility: visibility,
      });
      
      setPrivacySettings(prev => ({
        ...prev,
        profileVisibility: visibility,
      }));
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      Alert.alert('Error', 'Failed to update profile visibility. Please try again.');
    }
  };

  const updateSessionTimeout = async (timeout: string) => {
    if (!user?.id) return;
    
    try {
      console.log('🕐 Updating session timeout to:', timeout);
      
      // Update database
      await SupabaseService.updateSecuritySettings(user.id, {
        sessionTimeout: timeout,
      });
      
      // Update local state
      setSecuritySettings(prev => ({
        ...prev,
        sessionTimeout: timeout,
      }));
      
      // Update SessionTimeoutService
      const { SessionTimeoutService } = await import('../../services/sessionTimeoutService');
      await SessionTimeoutService.setSessionTimeout(timeout as any);
      
      // Refresh session timeout in PinLockContext
      setTimeout(() => {
        refreshSessionTimeout();
      }, 100);
      
      console.log('✅ Session timeout updated successfully to:', timeout);
    } catch (error) {
      console.error('❌ Error updating session timeout:', error);
      Alert.alert('Error', 'Failed to update session timeout. Please try again.');
    }
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
          onPress: async () => {
            if (!user?.id) return;
            
            try {
              setLoading(true);
              await SupabaseService.deleteUserAccount(user.id);
              
              Alert.alert(
                'Account Deleted',
                'Your account has been successfully deleted.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Sign out and redirect to login
                      router.replace('/(auth)');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  // Custom switch component to avoid React Native Switch issues
  const CustomSwitch = ({ value, onValueChange, testID }: { value: boolean; onValueChange: () => void; testID?: string }) => {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [value, animatedValue]);

    const translateX = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 22],
    });

    return (
      <TouchableOpacity
        testID={testID}
        onPress={onValueChange}
        style={[
          styles.customSwitch,
          {
            backgroundColor: value ? themeColors.accent + '40' : themeColors.border,
          }
        ]}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.customSwitchThumb,
            {
              backgroundColor: value ? themeColors.accent : themeColors.textSecondary,
              transform: [{ translateX }],
            }
          ]}
        />
      </TouchableOpacity>
    );
  };

  // Individual switch components using custom switch
  const ShowProgressSwitch = () => (
    <CustomSwitch
      value={privacySettings.showProgress}
      onValueChange={() => togglePrivacySetting('showProgress')}
      testID="show-progress-switch"
    />
  );

  const ShowStreaksSwitch = () => (
    <CustomSwitch
      value={privacySettings.showStreaks}
      onValueChange={() => togglePrivacySetting('showStreaks')}
      testID="show-streaks-switch"
    />
  );

  const AllowAnalyticsSwitch = () => (
    <CustomSwitch
      value={privacySettings.allowAnalytics}
      onValueChange={() => togglePrivacySetting('allowAnalytics')}
      testID="allow-analytics-switch"
    />
  );

  const BiometricAuthSwitch = () => (
    <CustomSwitch
      value={biometricStatus.enabled}
      onValueChange={() => toggleSecuritySetting('biometricAuth')}
      testID="biometric-auth-switch"
    />
  );

  const RequirePinSwitch = () => (
    <CustomSwitch
      value={securitySettings.requirePin}
      onValueChange={() => toggleSecuritySetting('requirePin')}
      testID="require-pin-switch"
    />
  );

  const AutoLockSwitch = () => (
    <CustomSwitch
      value={securitySettings.autoLock && pinStatus.enabled}
      onValueChange={() => toggleSecuritySetting('autoLock')}
      testID="auto-lock-switch"
    />
  );

  const SettingItem = ({ 
    id,
    title, 
    subtitle, 
    value, 
    onToggle, 
    icon,
    type = 'switch',
    customSwitch
  }: {
    id: string;
    title: string;
    subtitle: string;
    value: boolean | string;
    onToggle: () => void;
    icon: string;
    type?: 'switch' | 'chevron';
    customSwitch?: React.ReactNode;
  }) => {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={24} color={themeColors.accent} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
        {type === 'switch' ? (
          customSwitch
        ) : (
          <TouchableOpacity onPress={onToggle}>
            <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
    customSwitch: {
      width: 50,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    customSwitchThumb: {
      width: 26,
      height: 26,
      borderRadius: 13,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
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
              id="profile-visibility"
              title="Profile Visibility"
              subtitle={`Currently: ${privacySettings.profileVisibility}`}
              value={privacySettings.profileVisibility}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(
                  'Profile Visibility',
                  'Choose who can see your profile',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Public', 
                      onPress: () => updateProfileVisibility('public')
                    },
                    { 
                      text: 'Private', 
                      onPress: () => updateProfileVisibility('private')
                    },
                    { 
                      text: 'Friends Only', 
                      onPress: () => updateProfileVisibility('friends')
                    },
                  ]
                );
              }}
              icon="eye-outline"
              type="chevron"
            />
            <SettingItem
              id="show-progress"
              title="Show Progress"
              subtitle="Allow others to see your skill progress"
              value={privacySettings.showProgress}
              onToggle={() => togglePrivacySetting('showProgress')}
              icon="trending-up-outline"
              customSwitch={<ShowProgressSwitch />}
            />
            <SettingItem
              id="show-streaks"
              title="Show Streaks"
              subtitle="Display your learning streaks publicly"
              value={privacySettings.showStreaks}
              onToggle={() => togglePrivacySetting('showStreaks')}
              icon="flame-outline"
              customSwitch={<ShowStreaksSwitch />}
            />
            <SettingItem
              id="allow-analytics"
              title="Analytics"
              subtitle="Help improve SkillSync with anonymous data"
              value={privacySettings.allowAnalytics}
              onToggle={() => togglePrivacySetting('allowAnalytics')}
              icon="analytics-outline"
              customSwitch={<AllowAnalyticsSwitch />}
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <View style={styles.card}>
            <SettingItem
              id="biometric-auth"
              title="Biometric Authentication"
              subtitle={biometricStatus.available 
                ? (biometricStatus.enabled ? "Biometric authentication enabled" : "Use fingerprint or face ID to unlock")
                : "Biometric authentication not available"
              }
              value={biometricStatus.enabled}
              onToggle={() => toggleSecuritySetting('biometricAuth')}
              icon="finger-print-outline"
              customSwitch={<BiometricAuthSwitch />}
            />
            <SettingItem
              id="require-pin"
              title="Require PIN"
              subtitle={pinStatus.hasPin 
                ? (securitySettings.requirePin ? "PIN protection enabled" : "PIN set up but disabled")
                : "Set a PIN code for app access"
              }
              value={securitySettings.requirePin}
              onToggle={() => toggleSecuritySetting('requirePin')}
              icon="lock-closed-outline"
              customSwitch={<RequirePinSwitch />}
            />
            <SettingItem
              id="auto-lock"
              title="Auto Lock"
              subtitle={pinStatus.enabled 
                ? (securitySettings.autoLock ? "App locks after inactivity" : "App locks when closed")
                : "Requires PIN protection to be enabled"
              }
              value={securitySettings.autoLock && pinStatus.enabled}
              onToggle={() => toggleSecuritySetting('autoLock')}
              icon="timer-outline"
              customSwitch={<AutoLockSwitch />}
            />
            <SettingItem
              id="session-timeout"
              title="Session Timeout"
              subtitle={`Currently: ${securitySettings.sessionTimeout}`}
              value={securitySettings.sessionTimeout}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(
                  'Session Timeout',
                  'Choose when to automatically lock the app',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: '1 minute', 
                      onPress: () => updateSessionTimeout('1min')
                    },
                    { 
                      text: '5 minutes', 
                      onPress: () => updateSessionTimeout('5min')
                    },
                    { 
                      text: '15 minutes', 
                      onPress: () => updateSessionTimeout('15min')
                    },
                    { 
                      text: '30 minutes', 
                      onPress: () => updateSessionTimeout('30min')
                    },
                    { 
                      text: '1 hour', 
                      onPress: () => updateSessionTimeout('1hour')
                    },
                    { 
                      text: 'Never', 
                      onPress: () => updateSessionTimeout('never')
                    },
                  ]
                );
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
              id="export-data"
              title="Export Data"
              subtitle="Download all your data"
              value={false}
              onToggle={handleExportData}
              icon="download-outline"
              type="chevron"
            />
            <SettingItem
              id="delete-account"
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
