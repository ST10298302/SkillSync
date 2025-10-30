import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

import UniformLayout from '../../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/Colors';
import { useSkills } from '../../../context/SkillsContext';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { SocialService } from '../../../services/socialService';
import { supabase } from '../../../utils/supabase';
import { SkillCategory, SkillVisibility } from '../../../utils/supabase-types';

/**
 * Enhanced skill edit page with modern design and form validation
 */
export default function EditSkill() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { skills, updateSkill } = useSkills();
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  // Find the skill to edit
  const skill = skills.find(s => s.id === id);
  
  const [name, setName] = useState(skill?.name || '');
  const [description, setDescription] = useState(skill?.description || '');
  const [visibility, setVisibility] = useState<SkillVisibility>(SkillVisibility.PRIVATE);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [loadingFollowedUsers, setLoadingFollowedUsers] = useState(false);
  const [showTutorPicker, setShowTutorPicker] = useState(false);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Refs for input focus management
  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  
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

  // Load categories
  React.useEffect(() => {
    loadCategories();
  }, []);

  // Load skill details from Supabase
  React.useEffect(() => {
    if (id && skill) {
      loadSkillDetails();
    }
  }, [id]);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('skill_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadSkillDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('visibility, category_id, tutor_id')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setVisibility(data.visibility || SkillVisibility.PRIVATE);
        setCategoryId(data.category_id || null);
        setSelectedTutorId(data.tutor_id || null);
      }
    } catch (error) {
      console.error('Failed to load skill details:', error);
    }
  };

  // Load followed users when "My Tutor" visibility is selected
  React.useEffect(() => {
    if (visibility === SkillVisibility.TUTOR && user) {
      loadFollowedUsers();
    } else {
      setFollowedUsers([]);
    }
  }, [visibility, user]);

  const loadFollowedUsers = async () => {
    if (!user) return;
    
    setLoadingFollowedUsers(true);
    try {
      const follows = await SocialService.getFollowing(user.id);
      const userIds = follows.map(f => f.following_id);
      
      if (userIds.length > 0) {
        const { data: users, error } = await supabase
          .from('users')
          .select('id, name, email, profile_picture_url')
          .in('id', userIds);
        
        if (error) {
          console.error('Error fetching followed users:', error);
          setFollowedUsers([]);
        } else {
          setFollowedUsers(users || []);
        }
      } else {
        setFollowedUsers([]);
      }
    } catch (error) {
      console.error('Failed to load followed users:', error);
      setFollowedUsers([]);
    } finally {
      setLoadingFollowedUsers(false);
    }
  };

  // If skill not found, show error
  if (!skill) {
    return (
      <UniformLayout>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={themeColors.error} />
          <Text style={[styles.errorTitle, { color: themeColors.text }]}>Skill Not Found</Text>
          <Text style={[styles.errorSubtitle, { color: themeColors.textSecondary }]}>The skill you&apos;re trying to edit doesn&apos;t exist.</Text>
          <TouchableOpacity 
            style={[styles.errorButton, { backgroundColor: themeColors.accent }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.errorButtonText, { color: themeColors.text }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </UniformLayout>
    );
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Skill name is required';
    }
    
    if (description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVisibilityChange = (newVisibility: SkillVisibility) => {
    setVisibility(newVisibility);
    if (newVisibility !== SkillVisibility.TUTOR) {
      setSelectedTutorId(null);
    }
  };

  const handleUpdateSkill = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (visibility === SkillVisibility.TUTOR && !selectedTutorId) {
      setErrors({ general: 'Please select a tutor for this skill' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      // Update basic fields via context
      await updateSkill(id, {
        name: name.trim(),
        description: description.trim(),
      });
      
      // Update visibility, category, and tutor_id directly in Supabase
      const { error } = await supabase
        .from('skills')
        .update({
          visibility,
          category_id: categoryId || null,
          tutor_id: visibility === SkillVisibility.TUTOR ? selectedTutorId : null,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      setErrors({ general: 'Failed to update skill. Please try again.' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (name !== skill.name || description !== skill.description) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }
          },
        ]
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.back();
    }
  };

  const dismissKeyboard = () => {
    nameInputRef.current?.blur();
    descriptionInputRef.current?.blur();
  };

  return (
    <UniformLayout>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
                         {/* Header */}
             <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
               <LinearGradient
                 colors={themeColors.gradient.primary as any}
                 style={styles.headerGradient}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
               >
                 <View style={styles.headerContent}>
                   <TouchableOpacity 
                     style={styles.backButton}
                     onPress={handleCancel}
                   >
                     <Ionicons name="close" size={24} color={themeColors.text} />
                   </TouchableOpacity>
                   <View style={styles.headerInfo}>
                     <Text style={[styles.headerTitle, { color: themeColors.text }]}>Edit Skill</Text>
                     <Text style={[styles.headerSubtitle, { color: themeColors.text }]}>Update your skill information</Text>
                   </View>
                 </View>
               </LinearGradient>
             </Animated.View>

                         {/* Form */}
             <Animated.View style={[styles.formSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
               <LinearGradient
                 colors={themeColors.gradient.background as any}
                 style={styles.formCard}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
               >
                {!!errors.general && (
                   <View style={[styles.generalErrorContainer, { backgroundColor: themeColors.error + '15' }]}>
                     <Ionicons name="alert-circle" size={20} color={themeColors.error} />
                     <Text style={[styles.generalErrorText, { color: themeColors.error }]}>{errors.general}</Text>
                   </View>
                 )}

                                 {/* Skill Name Input */}
                 <View style={styles.inputField}>
                   <Text style={[styles.inputLabel, { color: themeColors.text }]}>Skill Name</Text>
                   <View style={[
                     styles.inputContainer, 
                     { backgroundColor: themeColors.background, borderColor: themeColors.border },
                     errors.name && { borderColor: themeColors.error, backgroundColor: themeColors.error + '10' }
                   ]}>
                     <TextInput
                       ref={nameInputRef}
                       style={[styles.input, { color: themeColors.text }]}
                       value={name}
                       onChangeText={setName}
                       placeholder="e.g., React Native, Guitar, Spanish"
                       placeholderTextColor={themeColors.textSecondary}
                       autoCapitalize="words"
                       autoCorrect={false}
                       returnKeyType="next"
                       onSubmitEditing={() => descriptionInputRef.current?.focus()}
                       blurOnSubmit={false}
                     />
                   </View>
                   {!!errors.name && (
                     <View style={styles.errorContainer}>
                       <Ionicons name="alert-circle" size={16} color={themeColors.error} />
                       <Text style={[styles.errorText, { color: themeColors.error }]}>{errors.name}</Text>
                     </View>
                   )}
                 </View>

                                 {/* Description Input */}
                 <View style={styles.inputField}>
                   <Text style={[styles.inputLabel, { color: themeColors.text }]}>Description (Optional)</Text>
                   <View style={[
                     styles.inputContainer, 
                     { backgroundColor: themeColors.background, borderColor: themeColors.border },
                     errors.description && { borderColor: themeColors.error, backgroundColor: themeColors.error + '10' }
                   ]}>
                     <TextInput
                       ref={descriptionInputRef}
                       style={[styles.input, styles.textArea, { color: themeColors.text }]}
                       value={description}
                       onChangeText={setDescription}
                       placeholder="Describe what you want to learn..."
                       placeholderTextColor={themeColors.textSecondary}
                       multiline
                       numberOfLines={4}
                       textAlignVertical="top"
                       autoCapitalize="sentences"
                       autoCorrect={true}
                     />
                   </View>
                   {!!errors.description && (
                     <View style={styles.errorContainer}>
                       <Ionicons name="alert-circle" size={16} color={themeColors.error} />
                       <Text style={[styles.errorText, { color: themeColors.error }]}>{errors.description}</Text>
                     </View>
                   )}
                                     <Text style={[styles.characterCount, { color: themeColors.textSecondary }]}>
                    {description.length}/500 characters
                  </Text>
                </View>

                {/* Category Selector */}
                <View style={styles.inputField}>
                  <Text style={[styles.inputLabel, { color: themeColors.text }]}>Category (Optional)</Text>
                  {isLoadingCategories ? (
                    <Text style={[styles.helperText, { color: themeColors.textSecondary }]}>Loading categories...</Text>
                  ) : (
                    <View style={[styles.pickerContainer, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setCategoryId(null)}
                      >
                        <Text style={[styles.pickerText, { color: categoryId ? themeColors.textSecondary : themeColors.text }]}>
                          None
                        </Text>
                      </TouchableOpacity>
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={styles.pickerButton}
                          onPress={() => setCategoryId(category.id)}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {category.icon && (
                              <Text style={{ fontSize: 18 }}>{category.icon}</Text>
                            )}
                            <Text style={[styles.pickerText, { color: categoryId === category.id ? themeColors.accent : themeColors.text }]}>
                              {category.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Visibility Selector */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: themeColors.text }]}>Visibility</Text>
                  <Text style={[styles.description, { color: themeColors.textSecondary }]}>
                    Who can see this skill?
                  </Text>
                  <View style={[styles.visibilityOptionsContainer, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.visibilityOptions}
                    >
                      {[
                        { value: SkillVisibility.PRIVATE, label: 'Private', icon: 'lock-closed' },
                        { value: SkillVisibility.PUBLIC, label: 'Public', icon: 'globe' },
                        { value: SkillVisibility.STUDENTS, label: 'My Students', icon: 'people' },
                        { value: SkillVisibility.TUTOR, label: 'My Tutor', icon: 'school' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.visibilityOption,
                            visibility === option.value && [styles.visibilityOptionActive, { backgroundColor: themeColors.background, borderColor: themeColors.accent }],
                          ]}
                          onPress={() => handleVisibilityChange(option.value)}
                        >
                          <Ionicons
                            name={option.icon as any}
                            size={18}
                            color={visibility === option.value ? themeColors.accent : themeColors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.visibilityLabel,
                              { color: visibility === option.value ? themeColors.accent : themeColors.textSecondary },
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  {/* Tutor Selection - Show when "My Tutor" is selected */}
                  {visibility === SkillVisibility.TUTOR && (
                    <View style={styles.tutorSection}>
                      {loadingFollowedUsers ? (
                        <View style={styles.tutorLoadingContainer}>
                          <Text style={[styles.tutorLabel, { color: themeColors.textSecondary }]}>
                            Loading tutors...
                          </Text>
                        </View>
                      ) : followedUsers.length === 0 ? (
                        <View style={styles.tutorEmptyContainer}>
                          <Ionicons name="people-outline" size={24} color={themeColors.textSecondary} />
                          <Text style={[styles.tutorEmptyText, { color: themeColors.textSecondary }]}>
                            No followed users. Follow users from the community page first.
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.tutorSelector, { 
                            backgroundColor: themeColors.backgroundSecondary,
                            borderColor: themeColors.border 
                          }]}
                          onPress={() => setShowTutorPicker(true)}
                        >
                          {selectedTutorId ? (
                            <View style={styles.selectedTutor}>
                              <Text style={[styles.selectedTutorText, { color: themeColors.text }]}>
                                {followedUsers.find(u => u.id === selectedTutorId)?.name || 
                                 followedUsers.find(u => u.id === selectedTutorId)?.email || 
                                 'Selected Tutor'}
                              </Text>
                              <Ionicons name="checkmark-circle" size={20} color={themeColors.accent} />
                            </View>
                          ) : (
                            <View style={styles.selectTutorPrompt}>
                              <Ionicons name="school-outline" size={20} color={themeColors.textSecondary} />
                              <Text style={[styles.selectTutorText, { color: themeColors.textSecondary }]}>
                                Select a tutor
                              </Text>
                              <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
                            </View>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                                {/* Action Buttons */}
                 <View style={styles.actionButtons}>
                   <TouchableOpacity
                     style={[
                       styles.button, 
                       styles.secondaryButton,
                       { backgroundColor: themeColors.backgroundTertiary, borderColor: themeColors.border }
                     ]}
                     onPress={handleCancel}
                     disabled={isLoading}
                   >
                     <Text style={[styles.secondaryButtonText, { color: themeColors.textSecondary }]}>Cancel</Text>
                   </TouchableOpacity>
                   <TouchableOpacity
                     style={[
                       styles.button, 
                       styles.primaryButton,
                       { backgroundColor: themeColors.accent, shadowColor: themeColors.accent },
                       isLoading && styles.disabledButton
                     ]}
                     onPress={handleUpdateSkill}
                     disabled={isLoading}
                   >
                     <Text style={[styles.primaryButtonText, { color: themeColors.text }]}>
                       {isLoading ? 'Updating...' : 'Update Skill'}
                     </Text>
                   </TouchableOpacity>
                 </View>
              </LinearGradient>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Tutor Picker Modal */}
      <Modal
        visible={showTutorPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTutorPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Select Tutor</Text>
              <TouchableOpacity onPress={() => setShowTutorPicker(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={followedUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.tutorOption,
                    { backgroundColor: themeColors.backgroundSecondary },
                    selectedTutorId === item.id && { backgroundColor: themeColors.accent + '20' }
                  ]}
                  onPress={() => {
                    setSelectedTutorId(item.id);
                    setShowTutorPicker(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={styles.tutorOptionContent}>
                    <View style={[styles.tutorAvatar, { backgroundColor: themeColors.accent }]}>
                      <Text style={styles.tutorAvatarText}>
                        {(item.name || item.email || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.tutorInfo}>
                      <Text style={[styles.tutorName, { color: themeColors.text }]}>
                        {item.name || item.email || 'Unknown User'}
                      </Text>
                      {item.email && item.name && (
                        <Text style={[styles.tutorEmail, { color: themeColors.textSecondary }]}>
                          {item.email}
                        </Text>
                      )}
                    </View>
                    {selectedTutorId === item.id && (
                      <Ionicons name="checkmark-circle" size={24} color={themeColors.accent} />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyTutorList}>
                  <Ionicons name="people-outline" size={48} color={themeColors.textSecondary} />
                  <Text style={[styles.emptyTutorText, { color: themeColors.textSecondary }]}>
                    No followed users available
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </UniformLayout>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 120 : Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...Typography.body,
    opacity: 0.9,
  },
  formSection: {
    paddingHorizontal: Spacing.lg,
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  generalErrorText: {
    ...Typography.bodySmall,
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
  inputField: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.body,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  inputContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '400',
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  characterCount: {
    ...Typography.caption,
    textAlign: 'right',
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  fullScreenErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorTitle: {
    ...Typography.h2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontWeight: '700',
  },
  errorSubtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  errorButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  errorButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.bodySmall,
    marginBottom: Spacing.sm,
  },
  visibilityOptionsContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.xs,
    maxHeight: 90,
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  visibilityOption: {
    minWidth: 90,
    width: 90,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs / 2,
  },
  visibilityOptionActive: {
    borderWidth: 1,
  },
  visibilityLabel: {
    ...Typography.bodySmall,
    marginLeft: Spacing.sm,
  },
  pickerContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickerButton: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  pickerText: {
    ...Typography.body,
  },
  helperText: {
    ...Typography.caption,
    fontStyle: 'italic',
  },
  tutorSection: {
    marginTop: Spacing.md,
  },
  tutorLoadingContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  tutorLabel: {
    ...Typography.bodySmall,
  },
  tutorEmptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  tutorEmptyText: {
    ...Typography.bodySmall,
    flex: 1,
  },
  tutorSelector: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  selectedTutor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedTutorText: {
    ...Typography.body,
    fontWeight: '600',
  },
  selectTutorPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectTutorText: {
    ...Typography.body,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...Typography.h3,
    fontWeight: '600',
  },
  tutorOption: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tutorOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  tutorAvatarText: {
    ...Typography.h3,
    color: '#fff',
    fontWeight: '700',
  },
  tutorInfo: {
    flex: 1,
  },
  tutorName: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  tutorEmail: {
    ...Typography.caption,
  },
  emptyTutorList: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTutorText: {
    ...Typography.body,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
