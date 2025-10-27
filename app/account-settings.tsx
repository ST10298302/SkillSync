import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    Modal,
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
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { SupabaseService } from '../services/supabaseService';
import { UserRole } from '../utils/supabase-types';

export default function AccountSettings() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [isLoading, setIsLoading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>();
  const [name, setName] = useState(user?.user_metadata?.name || user?.email?.split('@')[0] || '');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.LEARNER);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load user profile data
  React.useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        try {
          const { supabase } = await import('../utils/supabase');
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (data && !error) {
            setBio(data.bio || '');
            setRole(data.role || UserRole.LEARNER);
            setSpecializations(data.tutor_specializations || []);
          }

          const url = await SupabaseService.getProfilePictureUrl(user.id);
          setProfilePictureUrl(url || undefined);
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { supabase } = await import('../utils/supabase');
      const { error } = await supabase
        .from('users')
        .update({
          name,
          bio,
          role,
          tutor_specializations: role === UserRole.TUTOR ? specializations : [],
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(t('success'), t('profileUpdatedSuccess'));
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(t('error'), t('updateProfileFailed'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.user_metadata?.name || user?.email?.split('@')[0] || '');
    setIsEditing(false);
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim() && !specializations.includes(newSpecialization.trim())) {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  const handleRemoveSpecialization = (index: number) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      await SupabaseService.deleteUserAccount(user.id);
      Alert.alert(t('accountDeleted'), t('accountDeletedSuccess'));
      router.replace('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(t('error'), t('deleteAccountFailed'));
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
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
    specializationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.sm,
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.xs,
    },
    specializationText: {
      ...Typography.body,
      color: themeColors.text,
    },
    addSpecializationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.sm,
    },
    addSpecializationText: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      marginLeft: Spacing.xs,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: themeColors.background,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      minWidth: 300,
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 12,
    },
    modalTitle: {
      ...Typography.h2,
      color: themeColors.text,
      marginBottom: Spacing.lg,
      textAlign: 'center',
    },
    modalText: {
      ...Typography.body,
      color: themeColors.textSecondary,
      marginBottom: Spacing.lg,
      textAlign: 'center',
    },
    modalButton: {
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.sm,
      backgroundColor: themeColors.backgroundSecondary,
    },
    modalButtonActive: {
      backgroundColor: themeColors.accent,
    },
    modalButtonSecondary: {
      backgroundColor: themeColors.backgroundSecondary,
    },
    modalButtonDanger: {
      backgroundColor: themeColors.error || '#ef4444',
    },
    modalButtonText: {
      ...Typography.body,
      color: themeColors.text,
      textAlign: 'center',
      fontWeight: '600',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.md,
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
              <Text style={styles.headerTitle}>{t('accountSettings')}</Text>
              <Text style={styles.headerSubtitle}>{t('manageAccountInfo')}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Profile Picture Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('profilePicture')}</Text>
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
                {t('tapToChangeProfilePicture')}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Profile Information Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('profileInformation')}</Text>
          <View style={styles.card}>
            <View style={styles.formSection}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('displayName')}</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    isEditing ? styles.formInputFocused : styles.formInputDisabled
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('enterDisplayName')}
                  placeholderTextColor={themeColors.textSecondary}
                  editable={isEditing}
                />
              </View>
              {isEditing && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>{t('role')}</Text>
                  <TouchableOpacity
                    style={[styles.formInput, styles.formInputDisabled]}
                    onPress={() => setShowRoleModal(true)}
                  >
                    <Text style={styles.emailValue}>{role}</Text>
                  </TouchableOpacity>
                </View>
              )}
              {isEditing && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>{t('bio')}</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      isEditing ? styles.formInputFocused : styles.formInputDisabled
                    ]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder={t('enterBio')}
                    placeholderTextColor={themeColors.textSecondary}
                    editable={isEditing}
                  />
                </View>
              )}
              {isEditing && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>{t('tutorSpecializations')}</Text>
                  <FlatList
                    data={specializations}
                    renderItem={({ item, index }) => (
                      <View style={styles.specializationItem}>
                        <Text style={styles.specializationText}>{item}</Text>
                        <TouchableOpacity onPress={() => handleRemoveSpecialization(index)}>
                          <Ionicons name="close" size={16} color={themeColors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    )}
                    ListEmptyComponent={() => (
                      <TouchableOpacity
                        style={styles.addSpecializationButton}
                        onPress={() => setNewSpecialization('')}
                      >
                        <Ionicons name="add-circle" size={20} color={themeColors.textSecondary} />
                        <Text style={styles.addSpecializationText}>{t('addSpecialization')}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                  />
                  {isEditing && (
                    <View style={styles.formGroup}>
                      <TextInput
                        style={styles.formInput}
                        value={newSpecialization}
                        onChangeText={setNewSpecialization}
                        placeholder={t('addNewSpecialization')}
                        placeholderTextColor={themeColors.textSecondary}
                      />
                      <TouchableOpacity onPress={handleAddSpecialization}>
                        <Ionicons name="add-circle" size={20} color={themeColors.accent} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.emailSection}>
              <Text style={styles.emailLabel}>{t('emailAddress')}</Text>
              <Text style={styles.emailValue}>{user?.email || 'No email'}</Text>
            </View>

            {isEditing && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleCancelEdit}
                  disabled={isLoading}
                >
                  <Text style={styles.secondaryButtonText}>{t('cancel')}</Text>
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
                    {isLoading ? t('saving') : t('saveChanges')}
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
                  <Text style={styles.primaryButtonText}>{t('editProfile')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Delete Account Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('dangerZone')}</Text>
          <View style={styles.card}>
            <View style={styles.formSection}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>{t('deleteAccount')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Role Modal */}
      <Modal
        visible={showRoleModal}
        onRequestClose={() => setShowRoleModal(false)}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => setShowRoleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('selectRole')}</Text>
              <TouchableOpacity
                style={[styles.modalButton, role === UserRole.LEARNER && styles.modalButtonActive]}
                onPress={() => {
                  setRole(UserRole.LEARNER);
                  setShowRoleModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>{t('learner')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, role === UserRole.TUTOR && styles.modalButtonActive]}
                onPress={() => {
                  setRole(UserRole.TUTOR);
                  setShowRoleModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>{t('tutor')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, role === UserRole.ADMIN && styles.modalButtonActive]}
                onPress={() => {
                  setRole(UserRole.ADMIN);
                  setShowRoleModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>{t('admin')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        onRequestClose={() => setShowDeleteConfirm(false)}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => setShowDeleteConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('confirmDeletion')}</Text>
              <Text style={styles.modalText}>
                {t('deleteAccountConfirmation')}
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowDeleteConfirm(false)}
                >
                  <Text style={styles.modalButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonDanger]}
                  onPress={handleDeleteAccount}
                  disabled={isLoading}
                >
                  <Text style={styles.modalButtonText}>{t('delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </UniformLayout>
  );
}
