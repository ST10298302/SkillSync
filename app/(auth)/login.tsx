import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
/**
 * Login Screen
 * Uses Expo Router for navigation (Docs, E., 2025)
 * Implements Supabase authentication (supabase, 2025; Yüksel, M., 2023)
 */
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

import { AnimatedInput } from '../../components/AnimatedInput';
import AnimatedLogo from '../../components/AnimatedLogo';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BiometricService } from '../../services/biometricService';

/**
 * Enhanced login screen with modern design, animations, and improved UX
 */
export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  
  // Refs for input focus management
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  
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

    // Check biometric availability
    checkBiometricStatus();
  }, [fadeAnim, slideAnim, logoScale]);

  const checkBiometricStatus = async () => {
    try {
      const [status, hasCredentials] = await Promise.all([
        BiometricService.getBiometricStatus(),
        BiometricService.hasStoredCredentials()
      ]);
      console.log('Biometric status check:', status);
      console.log('Has stored credentials:', hasCredentials);
      setBiometricAvailable(status.available);
      setBiometricEnabled(status.enabled);
      setHasStoredCredentials(hasCredentials);
    } catch (error) {
      console.error('Error checking biometric status:', error);
    }
  };

  const handleBiometricLogin = async () => {
    console.log('Biometric login button pressed');
    console.log('biometricAvailable:', biometricAvailable, 'biometricEnabled:', biometricEnabled, 'hasStoredCredentials:', hasStoredCredentials);
    
    if (!biometricAvailable || !biometricEnabled || !hasStoredCredentials) {
      console.log('Biometric login conditions not met');
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('Starting biometric authentication...');

    try {
      // Add a small delay to ensure UI is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // First authenticate with biometric
      const success = await BiometricService.authenticate(
        'Use biometric to sign in to SkillSync'
      );
      
      console.log('Biometric authentication result:', success);

      if (success) {
        // Get stored credentials
        const credentials = await BiometricService.getStoredCredentials();
        console.log('Retrieved stored credentials:', credentials ? 'Found' : 'Not found');
        
        if (credentials) {
          console.log('Attempting to sign in with stored credentials...');
          // Use stored credentials to sign in
          await signIn(credentials.email, credentials.password);
          console.log('Sign in successful with biometric');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          // Add a small delay to ensure state is updated, then redirect
          setTimeout(() => {
            console.log('Redirecting to main app after biometric login...');
            router.replace('/(tabs)');
          }, 100);
        } else {
          setError('No stored credentials found. Please login with email and password first.');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      } else {
        setError('Biometric authentication failed. Please try again.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      setError('Biometric authentication failed. Please use email and password.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await signIn(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Store credentials for biometric login if biometric is available and enabled
      if (biometricAvailable && biometricEnabled) {
        try {
          await BiometricService.storeCredentials(email.trim(), password);
          console.log('Credentials stored for biometric login');
        } catch (error) {
          console.error('Failed to store credentials for biometric login:', error);
        }
      }
      
      // Add a small delay to ensure state is updated, then redirect
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
      
    } catch {
      setError('Invalid email or password');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/signup');
  };

  const togglePasswordVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  const dismissKeyboard = () => {
    emailInputRef.current?.blur();
    passwordInputRef.current?.blur();
  };

  const styles = StyleSheet.create({
    keyboardView: {
      flex: 1,
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
    loginButton: {
      marginTop: Spacing.md,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      shadowColor: Colors[safeTheme].shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    loginButtonDisabled: {
      opacity: 0.7,
    },
    loginButtonGradient: {
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
    loginButtonText: {
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
    biometricButton: {
      marginTop: Spacing.md,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors[safeTheme].accent,
      backgroundColor: 'transparent',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    biometricButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    biometricButtonText: {
      ...Typography.button,
      color: Colors[safeTheme].accent,
      marginLeft: Spacing.sm,
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: Spacing.lg,
    },
    signupText: {
      ...Typography.body,
      color: Colors[safeTheme].textSecondary,
    },
    signupLink: {
      ...Typography.body,
      color: Colors[safeTheme].accent,
      fontWeight: '600',
    },
  });

  return (
    <UniformLayout gradientColors={Colors[safeTheme].gradient.primary as [string, string]} statusBarStyle="light-content">
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            {/* Header Section */}
            <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <AnimatedLogo size={150} />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>
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
                  ref={emailInputRef}
                  icon="mail-outline"
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  autoComplete="email"
                  autoFocus={false}
                />

                <AnimatedInput
                  ref={passwordInputRef}
                  icon="lock-closed-outline"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={togglePasswordVisibility}
                  textContentType="password"
                  autoComplete="password"
                />

                <TouchableOpacity 
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? [Colors[safeTheme].backgroundSecondary, Colors[safeTheme].backgroundSecondary] : Colors[safeTheme].gradient.primary}
                    style={styles.loginButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <Animated.View style={[styles.loadingSpinner, { transform: [{ rotate: '360deg' }] }]} />
                        <Text style={styles.loadingText}>Signing in...</Text>
                      </View>
                    ) : (
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Biometric Login Button */}
                {biometricAvailable && biometricEnabled && hasStoredCredentials && (
                  <TouchableOpacity 
                    style={styles.biometricButton} 
                    onPress={handleBiometricLogin}
                    disabled={isLoading}
                  >
                    <View style={styles.biometricButtonContent}>
                      <Ionicons 
                        name="finger-print-outline" 
                        size={24} 
                        color={Colors[safeTheme].accent} 
                      />
                      <Text style={styles.biometricButtonText}>
                        Use Biometric
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={handleSignUpPress} style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don&apos;t have an account? </Text>
                  <Text style={styles.signupLink}>Sign up</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </UniformLayout>
  );
}