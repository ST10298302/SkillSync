import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useSkills } from '../../context/SkillsContext';
import { ThemeMode, useTheme } from '../../context/ThemeContext';

/**
 * Enhanced Profile page with professional Material Design look and feel
 */
export default function Profile() {
  const router = useRouter();
  const { signOut, user, isLoggedIn } = useAuth();
  const { skills } = useSkills();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  
  // Ensure we have valid colors even during initial render
  const themeColors = Colors[safeTheme] || Colors.light;
  
  // Debug logging
  console.log('🔧 Profile: Current state - isLoggedIn:', isLoggedIn, 'user:', user?.id);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Monitor isLoggedIn state changes
  React.useEffect(() => {
    console.log('🔄 Profile: isLoggedIn state changed to:', isLoggedIn);
  }, [isLoggedIn]);
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

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              console.log('🔄 Profile: Starting logout...');
              await signOut();
              console.log('✅ Profile: Logout successful');
              
              // Force navigation to login screen as backup
              setTimeout(() => {
                console.log('🔄 Profile: Forcing navigation to login...');
                router.replace('/(auth)');
              }, 100);
              
            } catch (error) {
              console.error('❌ Profile: Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const getStats = () => {
    const total = skills.length;
    const completed = skills.filter(s => s.progress >= 100).length;
    const inProgress = total - completed;
    const averageProgress = total > 0 ? Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / total) : 0;
    const totalEntries = skills.reduce((sum, s) => sum + (s.entries?.length || 0), 0);
    const totalHours = skills.reduce((sum, s) => {
      return sum + (s.totalHours || 0);
    }, 0);
    
    return { total, completed, inProgress, averageProgress, totalEntries, totalHours };
  };

  const stats = getStats();

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const MenuItem = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    showArrow = true,
    destructive = false 
  }: { 
    title: string; 
    subtitle?: string; 
    icon: string; 
    onPress: () => void; 
    showArrow?: boolean;
    destructive?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, destructive && styles.menuIconDestructive]}>
          <Ionicons name={icon as any} size={20} color={destructive ? Colors[safeTheme].error : Colors[safeTheme].textSecondary} />
        </View>
        <View style={styles.menuText}>
          <Text style={[styles.menuTitle, destructive && styles.menuTitleDestructive]}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={Colors[safeTheme].textSecondary} />
      )}
    </TouchableOpacity>
  );

  // Theme toggle UI
  const ThemeToggle = () => {
    const options: { label: string; value: ThemeMode; icon: any }[] = [
      { label: 'Light', value: 'light', icon: 'sunny-outline' },
      { label: 'Dark', value: 'dark', icon: 'moon-outline' },
      { label: 'Auto', value: 'auto', icon: 'phone-portrait-outline' },
    ];
    return (
      <View style={styles.themeToggleRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.themeToggleButton, theme === opt.value && styles.themeToggleButtonActive]}
            onPress={() => setTheme(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: theme === opt.value }}
          >
            <Ionicons
              name={opt.icon}
              size={22}
              color={theme === opt.value ? Colors[resolvedTheme].accentBlue : Colors[resolvedTheme].textSecondary}
            />
            <Text style={[styles.themeToggleLabel, theme === opt.value && styles.themeToggleLabelActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: Platform.OS === 'ios' ? 120 : Spacing.xxl,
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 50 : Spacing.xxl,
      paddingBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      marginRight: Spacing.lg,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors[safeTheme].shadow.heavy,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 12,
    },
    profileInfo: {
      flex: 1,
    },
    userName: {
      ...Typography.h1,
      color: Colors[safeTheme].text,
      marginBottom: Spacing.xs,
      fontWeight: '700',
    },
    userEmail: {
      ...Typography.body,
      color: Colors[safeTheme].textSecondary,
      marginBottom: Spacing.sm,
      opacity: 0.9,
    },
    profileBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.lg,
      alignSelf: 'flex-start',
    },
    profileBadgeText: {
      ...Typography.caption,
      color: Colors[safeTheme].text,
      marginLeft: Spacing.xs,
      fontWeight: '600',
    },
    statsSection: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      ...Typography.h2,
      color: Colors[safeTheme].text,
      marginBottom: Spacing.lg,
      fontWeight: '700',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      width: '48%',
      backgroundColor: Colors[safeTheme].background,
      padding: Spacing.lg,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      marginBottom: Spacing.lg,
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: Colors[safeTheme].border,
    },
    statIcon: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    statValue: {
      ...Typography.h2,
      color: Colors[safeTheme].text,
      fontWeight: '700',
      marginBottom: Spacing.xs,
    },
    statTitle: {
      ...Typography.caption,
      color: Colors[safeTheme].textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    menuSection: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    menuCard: {
      backgroundColor: Colors[safeTheme].background,
      borderRadius: BorderRadius.xl,
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: Colors[safeTheme].border,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: Colors[safeTheme].borderSecondary,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuIcon: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.round,
      backgroundColor: Colors[safeTheme].backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.lg,
    },
    menuIconDestructive: {
      backgroundColor: Colors[safeTheme].error + '15',
    },
    menuText: {
      flex: 1,
    },
    menuTitle: {
      ...Typography.body,
      color: Colors[safeTheme].text,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    menuTitleDestructive: {
      color: Colors[safeTheme].error,
    },
    menuSubtitle: {
      ...Typography.caption,
      color: Colors[safeTheme].textSecondary,
      fontWeight: '500',
    },
    dangerSection: {
      paddingHorizontal: Spacing.lg,
    },
    // New styles for theme toggle
    themeToggleContainer: {
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors[safeTheme].border,
    },
    themeToggleTitle: {
      ...Typography.body,
      color: Colors[safeTheme].textSecondary,
      marginBottom: Spacing.sm,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    themeToggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: Colors[safeTheme].backgroundTertiary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    themeToggleButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      marginHorizontal: Spacing.xs,
      backgroundColor: 'transparent',
    },
    themeToggleButtonActive: {
      backgroundColor: Colors[safeTheme].accentBlue + '22',
      shadowColor: Colors[safeTheme].accentBlue,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
    },
    themeToggleLabel: {
      ...Typography.bodySmall,
      color: Colors[safeTheme].textSecondary,
      marginLeft: Spacing.xs,
      fontWeight: '500',
    },
    themeToggleLabelActive: {
      color: Colors[safeTheme].accentBlue,
      fontWeight: '700',
    },
  });

  return (
    <UniformLayout>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={themeColors.gradient.accent}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="person" size={40} color={themeColors.text} />
              </LinearGradient>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              <View style={styles.profileBadge}>
                <Ionicons name="checkmark-circle" size={16} color={themeColors.success} />
                <Text style={styles.profileBadgeText}>Active Account</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Statistics */}
        <Animated.View style={[styles.statsSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Total Skills" 
              value={stats.total} 
              icon="library-outline" 
              color={themeColors.accent} 
            />
            <StatCard 
              title="Completed" 
              value={stats.completed} 
              icon="checkmark-circle-outline" 
              color={themeColors.success} 
            />
            <StatCard 
              title="Avg Progress" 
              value={`${stats.averageProgress}%`} 
              icon="trending-up-outline" 
              color={themeColors.warning} 
            />
            <StatCard 
              title="Total Entries" 
              value={stats.totalEntries} 
              icon="document-text-outline" 
              color={themeColors.info} 
            />
          </View>
        </Animated.View>

        {/* Enhanced Menu Items */}
        <Animated.View style={[styles.menuSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.menuCard}>
            {/* Theme Toggle UI */}
            <View style={styles.themeToggleContainer}>
              <Text style={styles.themeToggleTitle}>Theme</Text>
              <ThemeToggle />
            </View>
            <MenuItem
              title="Account Settings"
              subtitle="Manage your account information"
              icon="person-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Navigate to account settings
              }}
            />
            <MenuItem
              title="Notifications"
              subtitle="Configure notification preferences"
              icon="notifications-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Navigate to notifications settings
              }}
            />
            <MenuItem
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
              icon="shield-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Navigate to privacy settings
              }}
            />
            <MenuItem
              title="Help & Support"
              subtitle="Get help and contact support"
              icon="help-circle-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Navigate to help section
              }}
            />
            <MenuItem
              title="About SkillSync"
              subtitle="Version 1.0.0"
              icon="information-circle-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Show about modal
              }}
            />
          </View>
        </Animated.View>

        {/* Enhanced Danger Zone */}
        <Animated.View style={[styles.dangerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.menuCard}>
            <MenuItem
              title={isLoading ? "Signing Out..." : "Sign Out"}
              subtitle="Sign out of your account"
              icon="log-out-outline"
              onPress={handleLogout}
              destructive={true}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </UniformLayout>
  );
}