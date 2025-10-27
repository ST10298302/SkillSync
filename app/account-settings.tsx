import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import ProfilePicture from '../components/ProfilePicture';
import UniformLayout from '../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SupabaseService } from '../services/supabaseService';

export default function AccountSettings() {
  const router = useRouter();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [isLoading, setIsLoading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load profile data
  React.useEffect(() => {
    const loadProfileData = async () => {
      if (user?.id) {
        try {
          // Load profile picture URL
          const url = await SupabaseService.getProfilePictureUrl(user.id);
          setProfilePictureUrl(url || undefined);

          // Load user profile from database
          const userProfile = await SupabaseService.getUserProfile(user.id);
          if (userProfile?.name) {
            setName(userProfile.name);
          } else {
            setName(user?.email?.split('@')[0] || '');
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
          setName(user?.email?.split('@')[0] || '');
        }
      }
    };

    loadProfileData();
  }, [user?.id, user?.email]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await SupabaseService.updateUserProfile(user.id, { name });
      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = async () => {
    // Reload name from database
    if (user?.id) {
      try {
        const userProfile = await SupabaseService.getUserProfile(user.id);
        if (userProfile?.name) {
          setName(userProfile.name);
        } else {
          setName(user?.email?.split('@')[0] || '');
        }
      } catch (error) {
        console.error('Error reloading profile:', error);
        setName(user?.email?.split('@')[0] || '');
      }
    }
    setIsEditing(false);
  };

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
    headerTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.lg,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      ...Typography.h1,
      color: themeColors.text,
      marginBottom: Spacing.sm,
      fontWeight: '700',
    },
    headerSubtitle: {
      ...Typography.body,
      color: themeColors.textSecondary,
      opacity: 0.8,
    },
    section: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      ...Typography.h2,
      color: themeColors.text,
      marginBottom: Spacing.lg,
      fontWeight: '700',
    },
    card: {
      backgroundColor: themeColors.background,
      borderRadius: BorderRadius.xl,
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: themeColors.border,
      overflow: 'hidden',
    },
    profileSection: {
      padding: Spacing.lg,
      alignItems: 'center',
    },
    profilePictureContainer: {
      marginBottom: Spacing.lg,
    },
    profilePictureLabel: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      marginTop: Spacing.sm,
      textAlign: 'center',
      fontWeight: '500',
    },
    formSection: {
      padding: Spacing.lg,
    },
    formGroup: {
      marginBottom: Spacing.lg,
    },
    formLabel: {
      ...Typography.body,
      color: themeColors.text,
      marginBottom: Spacing.sm,
      fontWeight: '600',
    },
    formInput: {
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      color: themeColors.text,
      backgroundColor: themeColors.backgroundTertiary,
      ...Typography.body,
    },
    formInputFocused: {
      borderColor: themeColors.accent,
      backgroundColor: themeColors.background,
    },
    formInputDisabled: {
      backgroundColor: themeColors.backgroundSecondary,
      color: themeColors.textSecondary,
    },
    emailSection: {
      padding: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: themeColors.borderSecondary,
    },
    emailLabel: {
      ...Typography.body,
      color: themeColors.textSecondary,
      marginBottom: Spacing.xs,
      fontWeight: '500',
    },
    emailValue: {
      ...Typography.body,
      color: themeColors.text,
      fontWeight: '600',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    button: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: Spacing.sm,
    },
    primaryButton: {
      backgroundColor: themeColors.accent,
    },
    secondaryButton: {
      backgroundColor: themeColors.backgroundTertiary,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    buttonText: {
      ...Typography.body,
      fontWeight: '600',
    },
    primaryButtonText: {
      color: themeColors.text,
    },
    secondaryButtonText: {
      color: themeColors.textSecondary,
    },
    disabledButton: {
      opacity: 0.5,
    },
  });

  return (
    <UniformLayout>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Account Settings</Text>
              <Text style={styles.headerSubtitle}>Manage your profile and account information</Text>
            </View>
          </View>
        </Animated.View>

        {/* Profile Picture Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <View style={styles.card}>
            <View style={styles.profileSection}>
              <View style={styles.profilePictureContainer}>
                <ProfilePicture
                  userId={user?.id || ''}
                  imageUrl={profilePictureUrl}
                  size={100}
                  onImageUpdate={setProfilePictureUrl}
                  editable={true}
                />
              </View>
              <Text style={styles.profilePictureLabel}>
                Tap to change your profile picture
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Profile Information Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.card}>
            <View style={styles.formSection}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Display Name</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    isEditing ? styles.formInputFocused : styles.formInputDisabled
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your display name"
                  placeholderTextColor={themeColors.textSecondary}
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.emailSection}>
              <Text style={styles.emailLabel}>Email Address</Text>
              <Text style={styles.emailValue}>{user?.email || 'No email'}</Text>
            </View>

            {isEditing && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleCancelEdit}
                  disabled={isLoading}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.primaryButton,
                    isLoading && styles.disabledButton
                  ]}
                  onPress={handleSaveProfile}
                  disabled={isLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!isEditing && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => {
                    setIsEditing(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.primaryButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </UniformLayout>
  );
}
