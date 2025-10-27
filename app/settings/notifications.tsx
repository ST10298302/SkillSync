import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Logo from '../../components/Logo';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SupabaseService } from '../../services/supabaseService';

export default function NotificationsSettings() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' || resolvedTheme === 'darker' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    weeklyReports: true,
    skillCompletions: true,
    streakAlerts: true,
    tipsAndTricks: false,
    marketingEmails: false,
  });

  const [loading, setLoading] = useState(false);

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

  // Load notification settings from database
  React.useEffect(() => {
    if (user?.id) {
      loadNotificationSettings();
    }
  }, [user?.id]);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      const settings = await SupabaseService.getNotificationSettings(user!.id);
      
      setNotifications({
        dailyReminders: settings.daily_reminders ?? true,
        weeklyReports: settings.weekly_reports ?? true,
        skillCompletions: settings.skill_completions ?? true,
        streakAlerts: settings.streak_alerts ?? true,
        tipsAndTricks: settings.tips_and_tricks ?? false,
        marketingEmails: settings.marketing_emails ?? false,
      });
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitch = async (key: keyof typeof notifications) => {
    if (!user?.id) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newValue = !notifications[key];
    setNotifications(prev => ({
      ...prev,
      [key]: newValue,
    }));

    try {
      // Map the local state keys to database column names
      const dbKeyMap: Record<keyof typeof notifications, string> = {
        dailyReminders: 'daily_reminders',
        weeklyReports: 'weekly_reports',
        skillCompletions: 'skill_completions',
        streakAlerts: 'streak_alerts',
        tipsAndTricks: 'tips_and_tricks',
        marketingEmails: 'marketing_emails',
      };

      const dbKey = dbKeyMap[key];
      const updateData = { [dbKey]: newValue };

      await SupabaseService.updateNotificationSettings(user.id, updateData);
    } catch (error) {
      console.error('Error updating notification setting:', error);
      // Revert on error
      setNotifications(prev => ({
        ...prev,
        [key]: !newValue,
      }));
    }
  };

  // Custom switch component to avoid React Native Switch issues
  const CustomSwitch = ({ value, onValueChange, testID }: { value: boolean; onValueChange: () => void; testID?: string }) => {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    React.useEffect(() => {
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

  const NotificationItem = ({ 
    id,
    title, 
    subtitle, 
    value, 
    onToggle, 
    icon 
  }: {
    id: string;
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: () => void;
    icon: string;
  }) => (
    <View key={id} style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <Ionicons name={icon as any} size={24} color={themeColors.accent} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationSubtitle}>{subtitle}</Text>
      </View>
      <CustomSwitch
        value={value}
        onValueChange={onToggle}
        testID={`notification-switch-${id}`}
      />
    </View>
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
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    notificationIcon: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.accent + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      ...Typography.body,
      color: themeColors.text,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    notificationSubtitle: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      lineHeight: 18,
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
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          <View style={styles.logoContainer}>
            <Logo size={40} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          
          <View style={styles.card}>
            <NotificationItem
              id="daily-reminders"
              title="Daily Reminders"
              subtitle="Get reminded to practice your skills daily"
              value={notifications.dailyReminders}
              onToggle={() => toggleSwitch('dailyReminders')}
              icon="time-outline"
            />
            <NotificationItem
              id="weekly-reports"
              title="Weekly Reports"
              subtitle="Receive weekly progress summaries"
              value={notifications.weeklyReports}
              onToggle={() => toggleSwitch('weeklyReports')}
              icon="bar-chart-outline"
            />
            <NotificationItem
              id="skill-completions"
              title="Skill Completions"
              subtitle="Celebrate when you complete a skill"
              value={notifications.skillCompletions}
              onToggle={() => toggleSwitch('skillCompletions')}
              icon="trophy-outline"
            />
            <NotificationItem
              id="streak-alerts"
              title="Streak Alerts"
              subtitle="Stay motivated with streak notifications"
              value={notifications.streakAlerts}
              onToggle={() => toggleSwitch('streakAlerts')}
              icon="flame-outline"
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          
          <View style={styles.card}>
            <NotificationItem
              id="tips-and-tricks"
              title="Tips & Tricks"
              subtitle="Receive helpful learning tips via email"
              value={notifications.tipsAndTricks}
              onToggle={() => toggleSwitch('tipsAndTricks')}
              icon="bulb-outline"
            />
            <NotificationItem
              id="marketing-emails"
              title="Marketing Emails"
              subtitle="Get updates about new features and offers"
              value={notifications.marketingEmails}
              onToggle={() => toggleSwitch('marketingEmails')}
              icon="mail-outline"
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              You can change these settings at any time. Some notifications are essential for app functionality and cannot be disabled.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </UniformLayout>
  );
}
