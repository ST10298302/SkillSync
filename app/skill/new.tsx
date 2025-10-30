import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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

import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSkills } from '../../context/SkillsContext';
import { useTheme } from '../../context/ThemeContext';
import { SkillManagementService } from '../../services/skillManagementService';
import { SocialService } from '../../services/socialService';
import { SkillVisibility } from '../../utils/supabase-types';

/**
 * Enhanced new skill creation page with modern design and form validation
 */
export default function NewSkill() {
  const router = useRouter();
  const { addSkill } = useSkills();
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [visibility, setVisibility] = useState<SkillVisibility>(SkillVisibility.PRIVATE);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [loadingFollowedUsers, setLoadingFollowedUsers] = useState(false);
  const [showTutorPicker, setShowTutorPicker] = useState(false);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  
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

  // Load followed users when "My Tutor" or "My Students" visibility is selected
  React.useEffect(() => {
    if ((visibility === SkillVisibility.TUTOR || visibility === SkillVisibility.STUDENTS) && user) {
      loadFollowedUsers();
    } else {
      setSelectedTutorId(null);
      setSelectedStudentIds([]);
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
        const { supabase } = await import('../../utils/supabase');
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
        Alert.alert(
          'No Followed Users',
          'You need to follow users from the community page before you can assign them as tutors.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to load followed users:', error);
      setFollowedUsers([]);
    } finally {
      setLoadingFollowedUsers(false);
    }
  };

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
    if (newVisibility !== SkillVisibility.STUDENTS) {
      setSelectedStudentIds([]);
    }
  };

  const handleCreateSkill = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (visibility === SkillVisibility.TUTOR && !selectedTutorId) {
      setErrors({ general: 'Please select a tutor for this skill' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (visibility === SkillVisibility.STUDENTS && selectedStudentIds.length === 0) {
      setErrors({ general: 'Please select at least one student for this skill' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      // Create skill with visibility using SkillManagementService
      // Note: tutor_id will be added if the column exists in the database
      const newSkill = await SkillManagementService.createSkill({
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
        ...(visibility === SkillVisibility.TUTOR && selectedTutorId ? { tutor_id: selectedTutorId } : {}),
      });

      // Save student assignments if "My Students" visibility is selected
      if (visibility === SkillVisibility.STUDENTS && selectedStudentIds.length > 0) {
        await SkillManagementService.assignStudentsToSkill(newSkill.id, selectedStudentIds);
      }

      // Also add to SkillsContext for immediate UI update
      await addSkill({
        id: newSkill.id,
        name: newSkill.name,
        description: newSkill.description || '',
        startDate: newSkill.created_at,
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Failed to create skill:', error);
      setErrors({ general: 'Failed to create skill. Please try again.' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (name.trim() || description.trim()) {
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
                  <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('addNewSkill')}</Text>
                  <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>{t('trackYourLearningProgress')}</Text>
                </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Form */}
            <Animated.View style={[styles.formSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <LinearGradient
                colors={themeColors.gradient.background as any}
                style={[styles.formCard, { borderColor: themeColors.border }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {!!errors.general && (
                  <View style={[styles.generalErrorContainer, { backgroundColor: themeColors.error + '10' }]}>
                    <Ionicons name="alert-circle" size={20} color={themeColors.error} />
                    <Text style={[styles.generalErrorText, { color: themeColors.error }]}>{errors.general}</Text>
                  </View>
                )}

                {/* Skill Name Input */}
                <View style={styles.inputField}>
                  <Text style={[styles.inputLabel, { color: themeColors.text }]}>{t('skillName')}</Text>
                  <View style={[styles.inputContainer, errors.name && styles.inputContainerError, 
                    { backgroundColor: themeColors.backgroundSecondary, borderColor: errors.name ? themeColors.error : themeColors.border }]}>
                    <TextInput
                      ref={nameInputRef}
                      style={[styles.input, { color: themeColors.text }]}
                      value={name}
                      onChangeText={setName}
                      placeholder={t('skillNamePlaceholder')}
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
                   <Text style={[styles.inputLabel, { color: themeColors.text }]}>{t('description')} (Optional)</Text>
                   <View style={[styles.inputContainer, errors.description && styles.inputContainerError,
                     { backgroundColor: themeColors.backgroundSecondary, borderColor: errors.description ? themeColors.error : themeColors.border }]}>
                     <TextInput
                       ref={descriptionInputRef}
                       style={[styles.input, styles.inputMultiline, { color: themeColors.text }]}
                       value={description}
                       onChangeText={setDescription}
                       placeholder={t('descriptionPlaceholder')}
                       placeholderTextColor={themeColors.textSecondary}
                       multiline={true}
                       autoCapitalize="sentences"
                       autoCorrect={true}
                       textAlignVertical="top"
                       maxLength={500}
                       returnKeyType="default"
                       blurOnSubmit={false}
                     />
                   </View>
                   <View style={styles.characterCount}>
                     <Text style={[styles.characterCountText, { color: themeColors.textSecondary }]}>
                       {description.length}/500 characters
                     </Text>
                   </View>
                   {!!errors.description && (
                     <View style={styles.errorContainer}>
                       <Ionicons name="alert-circle" size={16} color={themeColors.error} />
                       <Text style={[styles.errorText, { color: themeColors.error }]}>{errors.description}</Text>
                     </View>
                   )}
                 </View>

                {/* Add Visibility Selector */}
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
                            visibility === option.value && [styles.visibilityOptionActive, 
                              { backgroundColor: themeColors.backgroundTertiary, borderColor: themeColors.accent }],
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
                  
                  {/* Student Selection - Show when "My Students" is selected */}
                  {visibility === SkillVisibility.STUDENTS && (
                    <View style={styles.studentSection}>
                      {loadingFollowedUsers ? (
                        <View style={styles.studentLoadingContainer}>
                          <Text style={[styles.studentLabel, { color: themeColors.textSecondary }]}>
                            Loading students...
                          </Text>
                        </View>
                      ) : followedUsers.length === 0 ? (
                        <View style={styles.studentEmptyContainer}>
                          <Ionicons name="people-outline" size={24} color={themeColors.textSecondary} />
                          <Text style={[styles.studentEmptyText, { color: themeColors.textSecondary }]}>
                            No followed users. Follow users from the community page first.
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.studentSelector, { 
                            backgroundColor: themeColors.backgroundSecondary,
                            borderColor: themeColors.border 
                          }]}
                          onPress={() => setShowStudentPicker(true)}
                        >
                          {selectedStudentIds.length > 0 ? (
                            <View style={styles.selectedStudents}>
                              <Text style={[styles.selectedStudentsText, { color: themeColors.text }]}>
                                {selectedStudentIds.length} {selectedStudentIds.length === 1 ? 'student' : 'students'} selected
                              </Text>
                              <Ionicons name="checkmark-circle" size={20} color={themeColors.accent} />
                            </View>
                          ) : (
                            <View style={styles.selectStudentPrompt}>
                              <Ionicons name="people-outline" size={20} color={themeColors.textSecondary} />
                              <Text style={[styles.selectStudentText, { color: themeColors.textSecondary }]}>
                                Select students
                              </Text>
                              <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
                            </View>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  
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

                 <View style={[styles.tipsContainer, { backgroundColor: themeColors.backgroundTertiary }]}>
                  <Text style={[styles.tipsTitle, { color: themeColors.text }]}>💡 Tips for success:</Text>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color={themeColors.success} />
                    <Text style={[styles.tipText, { color: themeColors.textSecondary }]}>Be specific about what you want to learn</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color={themeColors.success} />
                    <Text style={[styles.tipText, { color: themeColors.textSecondary }]}>Set realistic goals and milestones</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color={themeColors.success} />
                    <Text style={[styles.tipText, { color: themeColors.textSecondary }]}>Update your progress regularly</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </ScrollView>

          {/* Action Buttons - Always visible outside ScrollView */}
          <Animated.View style={[styles.actionSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}
                onPress={handleCancel}
              >
                <Text style={[styles.cancelButtonText, { color: themeColors.textSecondary }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.createButton, isLoading && styles.createButtonDisabled]}
                onPress={handleCreateSkill}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? [themeColors.backgroundSecondary, themeColors.backgroundSecondary] : themeColors.gradient.primary as any}
                  style={styles.createButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={[styles.loadingSpinner, { borderColor: themeColors.text, transform: [{ rotate: '360deg' }] }]} />
                      <Text style={[styles.loadingText, { color: themeColors.text }]}>{t('creatingSkill')}</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="add-circle" size={20} color={themeColors.text} />
                      <Text style={[styles.createButtonText, { color: themeColors.text }]}>{t('createSkill')}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Student Picker Modal */}
      <Modal
        visible={showStudentPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStudentPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                Select Students ({selectedStudentIds.length} selected)
              </Text>
              <TouchableOpacity onPress={() => setShowStudentPicker(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={followedUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedStudentIds.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.studentOption,
                      { backgroundColor: themeColors.backgroundSecondary },
                      isSelected && { backgroundColor: themeColors.accent + '20' }
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedStudentIds(prev => prev.filter(id => id !== item.id));
                      } else {
                        setSelectedStudentIds(prev => [...prev, item.id]);
                      }
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <View style={styles.studentOptionContent}>
                      <View style={[styles.studentCheckbox, { 
                        backgroundColor: isSelected ? themeColors.accent : 'transparent',
                        borderColor: isSelected ? themeColors.accent : themeColors.border 
                      }]}>
                        {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                      </View>
                      <View style={[styles.studentAvatar, { backgroundColor: themeColors.accent }]}>
                        <Text style={styles.studentAvatarText}>
                          {(item.name || item.email || 'U').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.studentInfo}>
                        <Text style={[styles.studentName, { color: themeColors.text }]}>
                          {item.name || item.email || 'Unknown User'}
                        </Text>
                        {item.email && item.name && (
                          <Text style={[styles.studentEmail, { color: themeColors.textSecondary }]}>
                            {item.email}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyStudentList}>
                  <Ionicons name="people-outline" size={48} color={themeColors.textSecondary} />
                  <Text style={[styles.emptyStudentText, { color: themeColors.textSecondary }]}>
                    No followed users available
                  </Text>
                </View>
              }
            />
            
            <View style={[styles.modalFooter, { borderTopColor: themeColors.border }]}>
              <TouchableOpacity
                style={[styles.modalDoneButton, { backgroundColor: themeColors.accent }]}
                onPress={() => {
                  setShowStudentPicker(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <Text style={[styles.modalDoneButtonText, { color: themeColors.text }]}>
                  Done ({selectedStudentIds.length} selected)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.body,
  },
  formSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
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
    flex: 1,
  },
  inputField: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  inputContainerError: {
    borderColor: 'transparent',
  },
  input: {
    padding: Spacing.md,
    ...Typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  errorText: {
    ...Typography.bodySmall,
    marginLeft: Spacing.xs,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
  },
  characterCountText: {
    ...Typography.caption,
  },
  tipsContainer: {
    backgroundColor: 'transparent',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  tipsTitle: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  tipText: {
    ...Typography.bodySmall,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  actionSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
  },
  cancelButtonText: {
    ...Typography.button,
  },
  createButton: {
    flex: 2,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  createButtonText: {
    ...Typography.button,
    marginLeft: Spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRadius: BorderRadius.round,
    marginRight: Spacing.sm,
  },
  loadingText: {
    ...Typography.button,
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
    borderRadius: BorderRadius.lg,
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
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  visibilityLabel: {
    ...Typography.caption,
    textAlign: 'center',
    fontSize: 12,
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
  studentSection: {
    marginTop: Spacing.md,
  },
  studentLoadingContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  studentLabel: {
    ...Typography.bodySmall,
  },
  studentEmptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  studentEmptyText: {
    ...Typography.bodySmall,
    flex: 1,
  },
  studentSelector: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  selectedStudents: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedStudentsText: {
    ...Typography.body,
    fontWeight: '600',
  },
  selectStudentPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectStudentText: {
    ...Typography.body,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  studentOption: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  studentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentCheckbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  studentAvatarText: {
    ...Typography.h3,
    color: '#fff',
    fontWeight: '700',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  studentEmail: {
    ...Typography.caption,
  },
  emptyStudentList: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyStudentText: {
    ...Typography.body,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  modalFooter: {
    borderTopWidth: 1,
    padding: Spacing.md,
  },
  modalDoneButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
});