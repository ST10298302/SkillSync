import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { AnimatedInput } from '../../components/AnimatedInput';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

/**
 * Enhanced signup screen with modern design, animations, and improved UX
 */
export default function Signup() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const logoScale = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, logoScale]);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await signUp(email.trim(), password, name.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Add a small delay to ensure state is updated, then redirect
      setTimeout(() => {
        console.log('🔄 Signup: Redirecting to main app...');
        router.replace('/(tabs)');
      }, 100);
    } catch {
      setError('Failed to create account. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/login');
  };

  const togglePasswordVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowConfirmPassword(!showConfirmPassword);
  };

  const styles = StyleSheet.create({
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
    },
    header: {
      alignItems: 'center',
      paddingTop: Spacing.lg,
      paddingHorizontal: Spacing.xl,
    },
    logoContainer: {
      width: 120,
      height: 120,
      borderRadius: BorderRadius.round,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    title: {
      ...Typography.h1,
      color: Colors[safeTheme].text,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      ...Typography.body,
      color: Colors[safeTheme].textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    formContainer: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    formCard: {
      padding: Spacing.xl,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors[safeTheme].border,
      shadowColor: Colors[safeTheme].shadow.heavy,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors[safeTheme].error + '10',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.md,
    },
    errorText: {
      ...Typography.bodySmall,
      color: Colors[safeTheme].error,
      marginLeft: Spacing.sm,
      flex: 1,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors[safeTheme].backgroundSecondary,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: Colors[safeTheme].border,
    },
    input: {
      flex: 1,
      marginLeft: Spacing.sm,
      ...Typography.body,
      color: Colors[safeTheme].text,
    },
    eyeButton: {
      padding: Spacing.xs,
    },
    requirementsContainer: {
      marginBottom: Spacing.md,
      padding: Spacing.md,
      backgroundColor: Colors[safeTheme].backgroundTertiary,
      borderRadius: BorderRadius.md,
    },
    requirementsTitle: {
      ...Typography.bodySmall,
      color: Colors[safeTheme].textSecondary,
      marginBottom: Spacing.sm,
      fontWeight: '600',
    },
    requirementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    requirementText: {
      ...Typography.bodySmall,
      color: Colors[safeTheme].textSecondary,
      marginLeft: Spacing.xs,
    },
    requirementTextMet: {
      color: Colors[safeTheme].success,
    },
    signupButton: {
      marginTop: Spacing.md,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    signupButtonDisabled: {
      opacity: 0.7,
    },
    signupButtonGradient: {
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
    signupButtonText: {
      ...Typography.button,
      color: Colors[safeTheme].text,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingSpinner: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: Colors[safeTheme].text,
      borderTopColor: 'transparent',
      borderRadius: BorderRadius.round,
      marginRight: Spacing.sm,
    },
    loadingText: {
      ...Typography.button,
      color: Colors[safeTheme].text,
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: Spacing.lg,
    },
    loginText: {
      ...Typography.body,
      color: Colors[safeTheme].textSecondary,
    },
    loginLink: {
      ...Typography.body,
      color: Colors[safeTheme].accent,
      fontWeight: '600',
    },
  });

  return (
    <UniformLayout gradientColors={Colors[safeTheme].gradient.primary as [string, string]} statusBarStyle="light-content">
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <AnimatedLogo />
              <Text style={styles.title}>Join SkillSync</Text>
              <Text style={styles.subtitle}>Create your account to start tracking your skills</Text>
            </Animated.View>

            {/* Form Section */}
            <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <LinearGradient
                colors={Colors[safeTheme].gradient.background}
                style={styles.formCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {error && (
                  <View style={styles.errorContainer}>
                                      <Ionicons name="alert-circle" size={20} color={Colors[safeTheme].error} />
                  <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                                <AnimatedInput
                  icon="person-outline"
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />

                <AnimatedInput
                  icon="mail-outline"
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <AnimatedInput
                  icon="lock-closed-outline"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={togglePasswordVisibility}
                />

                <AnimatedInput
                  icon="lock-closed-outline"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={toggleConfirmPasswordVisibility}
                />

                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                  <View style={styles.requirementRow}>
                    <Ionicons 
                      name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={password.length >= 6 ? Colors[safeTheme].success : Colors[safeTheme].textSecondary} 
                    />
                    <Text style={[styles.requirementText, password.length >= 6 && styles.requirementTextMet]}>
                      At least 6 characters
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Ionicons 
                      name={password === confirmPassword && password.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={password === confirmPassword && password.length > 0 ? Colors[safeTheme].success : Colors[safeTheme].textSecondary} 
                    />
                    <Text style={[styles.requirementText, password === confirmPassword && password.length > 0 && styles.requirementTextMet]}>
                      Passwords match
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.signupButton, isLoading && styles.signupButtonDisabled]} 
                  onPress={handleSignup}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? [Colors[safeTheme].backgroundSecondary, Colors[safeTheme].backgroundSecondary] : Colors[safeTheme].gradient.primary}
                    style={styles.signupButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <Animated.View style={[styles.loadingSpinner, { transform: [{ rotate: '360deg' }] }]} />
                        <Text style={styles.loadingText}>Creating account...</Text>
                      </View>
                    ) : (
                      <Text style={styles.signupButtonText}>Create Account</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLoginPress} style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <Text style={styles.loginLink}>Sign in</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
    </UniformLayout>
  );
}