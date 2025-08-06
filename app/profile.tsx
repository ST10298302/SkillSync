import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useSkills } from '../context/SkillsContext';

/**
 * Enhanced profile page with user statistics, settings, and account management
 */
export default function Profile() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { skills } = useSkills();
  
  const [isLoading, setIsLoading] = useState(false);
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
  }, []);

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
            setIsLoading(true);
            await signOut();
            router.replace('/auth/login');
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
    const totalHours = skills.reduce((sum, s) => sum + (s.totalHours || 0), 0);
    
    return { total, completed, inProgress, averageProgress, totalEntries, totalHours };
  };

  const stats = getStats();

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
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
          <Ionicons name={icon as any} size={20} color={destructive ? Colors.light.error : Colors.light.textSecondary} />
        </View>
        <View style={styles.menuText}>
          <Text style={[styles.menuTitle, destructive && styles.menuTitleDestructive]}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={Colors.light.gradient.primary}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={Colors.light.gradient.secondary}
                  style={styles.avatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="person" size={40} color={Colors.light.text} />
                </LinearGradient>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.split('@')[0] || 'User'}</Text>
                <Text style={styles.userEmail}>{user}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Statistics */}
        <Animated.View style={[styles.statsSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Total Skills" 
              value={stats.total} 
              icon="library-outline" 
              color={Colors.light.primary} 
            />
            <StatCard 
              title="Completed" 
              value={stats.completed} 
              icon="checkmark-circle-outline" 
              color={Colors.light.success} 
            />
            <StatCard 
              title="Avg Progress" 
              value={`${stats.averageProgress}%`} 
              icon="trending-up-outline" 
              color={Colors.light.warning} 
            />
            <StatCard 
              title="Total Entries" 
              value={stats.totalEntries} 
              icon="document-text-outline" 
              color={Colors.light.info} 
            />
          </View>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View style={[styles.menuSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <LinearGradient
            colors={Colors.light.gradient.background}
            style={styles.menuCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
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
          </LinearGradient>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View style={[styles.dangerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <LinearGradient
            colors={Colors.light.gradient.background}
            style={styles.menuCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MenuItem
              title="Sign Out"
              subtitle="Sign out of your account"
              icon="log-out-outline"
              onPress={handleLogout}
              destructive={true}
            />
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerGradient: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },
  statsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.light.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  statTitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  menuCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderSecondary,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.light.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuIconDestructive: {
    backgroundColor: Colors.light.error + '20',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '500',
  },
  menuTitleDestructive: {
    color: Colors.light.error,
  },
  menuSubtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  dangerSection: {
    paddingHorizontal: Spacing.lg,
  },
}); 