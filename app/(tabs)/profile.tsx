import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
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

import LanguageSelector from '../../components/LanguageSelector';
import Logo from '../../components/Logo';
import ProfilePicture from '../../components/ProfilePicture';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSkills } from '../../context/SkillsContext';
import { ThemeMode, useTheme } from '../../context/ThemeContext';
import { SupabaseService } from '../../services/supabaseService';

/**
 * Profile page - User account management, settings, and personal information
 * Features professional Material Design interface with theme switching and language selection
 */
export default function Profile() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { skills } = useSkills();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  
  // Ensure we have valid colors even during initial render to prevent crashes
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const [isLoading, setIsLoading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>();
  const [userName, setUserName] = useState<string>('User');

  // Load user profile data including profile picture and display name
  const loadUserData = React.useCallback(async () => {
    if (user?.id) {
      try {
        // Load profile picture URL from Supabase storage
        const url = await SupabaseService.getProfilePictureUrl(user.id);
        setProfilePictureUrl(url || undefined);

        // Load user profile and extract display name
        const userProfile = await SupabaseService.getUserProfile(user.id);
        if (userProfile?.name) {
          // Extract first name from full name for friendly display
          const firstName = userProfile.name.split(' ')[0];
          const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
          setUserName(capitalizedName);
        } else {
          // Fallback to email prefix with proper capitalization
          const emailPrefix = user.email?.split('@')[0] || 'User';
          const capitalizedEmail = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();
          setUserName(capitalizedEmail);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to email prefix with proper capitalization
        const emailPrefix = user.email?.split('@')[0] || 'User';
        const capitalizedEmail = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();
        setUserName(capitalizedEmail);
      }
    }
  }, [user?.id, user?.email]);

  // Load user data on mount
  React.useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Reload user data when screen comes into focus (for profile picture updates)
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );
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
      t('signOut'),
      'Are you sure you want to sign out?',
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('signOut'), 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await signOut();
              
              // Force navigation to login screen as backup
              setTimeout(() => {
                router.replace('/(auth)');
              }, 100);
              
            } catch (error) {
              console.error('Profile: Logout error:', error);
              Alert.alert(t('error'), 'Failed to sign out. Please try again.');
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
         logoContainer: {
       alignItems: 'center',
       justifyContent: 'center',
       marginBottom: Spacing.md,
       paddingVertical: Spacing.sm,
     },
               profileCard: {
      backgroundColor: Colors[safeTheme].background,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginHorizontal: Spacing.sm,
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: Colors[safeTheme].border,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    avatarContainer: {
      marginRight: Spacing.lg,
      marginTop: 2, // Align with text baseline
    },
    profileContainer: {
      position: 'relative',
      padding: 3,
      borderRadius: BorderRadius.round,
      backgroundColor: Colors[safeTheme].backgroundSecondary,
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    editIconContainer: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors[safeTheme].accent,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 2,
      borderColor: Colors[safeTheme].background,
    },

    profileInfo: {
      flex: 1,
      justifyContent: 'center',
      paddingTop: 4, // Align with profile picture
    },
    userName: {
      ...Typography.h1,
      color: Colors[safeTheme].text,
      marginBottom: Spacing.xs,
      fontWeight: '700',
    },
    userEmail: {
      ...Typography.caption,
      color: Colors[safeTheme].textSecondary,
      marginBottom: Spacing.sm,
      opacity: 0.8,
      fontSize: 13,
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
          <View style={styles.logoContainer}>
            <Logo size={60} />
          </View>
                     <View style={styles.profileCard}>
             <View style={styles.profileSection}>
               <View style={styles.avatarContainer}>
                 <View style={styles.profileContainer}>
                   <ProfilePicture
                     userId={user?.id || ''}
                     imageUrl={profilePictureUrl}
                     size={100}
                     onImageUpdate={setProfilePictureUrl}
                     editable={true}
                   />
                   <View style={styles.editIconContainer}>
                     <Ionicons name="create-outline" size={18} color={themeColors.text} />
                   </View>
                 </View>
               </View>
               <View style={styles.profileInfo}>
                 <Text style={styles.userName}>{userName}</Text>
                 <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                 <View style={styles.profileBadge}>
                   <Ionicons name="checkmark-circle" size={16} color={themeColors.success} />
                   <Text style={styles.profileBadgeText}>{t('activeAccount')}</Text>
                 </View>
               </View>
             </View>
           </View>
        </Animated.View>

        {/* Enhanced Statistics */}
        <Animated.View style={[styles.statsSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('yourProgress')}</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title={t('totalSkills')} 
              value={stats.total} 
              icon="library-outline" 
              color={themeColors.accent} 
            />
            <StatCard 
              title={t('completed')} 
              value={stats.completed} 
              icon="checkmark-circle-outline" 
              color={themeColors.success} 
            />
            <StatCard 
              title={t('avgProgress')} 
              value={`${stats.averageProgress}%`} 
              icon="trending-up-outline" 
              color={themeColors.warning} 
            />
            <StatCard 
              title={t('totalEntries')} 
              value={stats.totalEntries} 
              icon="document-text-outline" 
              color={themeColors.info} 
            />
          </View>
        </Animated.View>

        {/* Enhanced Menu Items */}
        <Animated.View style={[styles.menuSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('settings')}</Text>
          
          <View style={styles.menuCard}>
            {/* Theme Toggle UI */}
            <View style={styles.themeToggleContainer}>
              <Text style={styles.themeToggleTitle}>{t('theme')}</Text>
              <ThemeToggle />
            </View>
            
            {/* Language Selector */}
            <LanguageSelector />
            
            <MenuItem
              title={t('accountSettings')}
              subtitle={t('manageAccountInfo')}
              icon="person-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/account-settings');
              }}
            />
            <MenuItem
              title={t('notifications')}
              subtitle={t('configureNotifications')}
              icon="notifications-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('../settings/notifications' as any);
              }}
            />
            <MenuItem
              title={t('privacySecurity')}
              subtitle={t('managePrivacy')}
              icon="shield-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('../settings/privacy-security' as any);
              }}
            />
            <MenuItem
              title={t('helpSupport')}
              subtitle={t('getHelp')}
              icon="help-circle-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('../settings/help-support' as any);
              }}
            />
            <MenuItem
              title={t('aboutSkillSync')}
              subtitle={t('version')}
              icon="information-circle-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('../settings/about' as any);
              }}
            />
            <MenuItem
              title={t('language')}
              subtitle="Change the app language"
              icon="language-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Navigate to language settings
              }}
            />
          </View>
        </Animated.View>

        {/* Enhanced Danger Zone */}
        <Animated.View style={[styles.dangerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('account')}</Text>
          
          <View style={styles.menuCard}>
            <MenuItem
              title={isLoading ? t('signingOut') : t('signOut')}
              subtitle={t('signOutAccount')}
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
