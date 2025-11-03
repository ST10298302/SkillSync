import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export class BiometricService {
  // Platform-aware storage helpers - uses SecureStore on native, AsyncStorage on web
  private static async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  }

  private static async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  private static async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
  private static readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
  private static readonly STORED_EMAIL_KEY = 'stored_email';
  private static readonly STORED_PASSWORD_KEY = 'stored_password';

  /**
   * Check if biometric authentication is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get supported biometric types
   */
  static async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported biometric types:', error);
      return [];
    }
  }

  /**
   * Check if biometric authentication is enabled for the user
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await this.getItem(this.BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication
   */
  static async enableBiometric(): Promise<void> {
    try {
      await this.setItem(this.BIOMETRIC_ENABLED_KEY, 'true');
    } catch (error) {
      console.error('Error enabling biometric:', error);
      throw error;
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometric(): Promise<void> {
    try {
      await this.setItem(this.BIOMETRIC_ENABLED_KEY, 'false');
    } catch (error) {
      console.error('Error disabling biometric:', error);
      throw error;
    }
  }

  /**
   * Authenticate using biometric
   */
  static async authenticate(reason: string = 'Authenticate to access SkillSync'): Promise<boolean> {
    try {
      console.log('Starting biometric authentication with reason:', reason);
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      console.log('Biometric authentication result:', result);
      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  /**
   * Get biometric status for display
   */
  static async getBiometricStatus(): Promise<{
    available: boolean;
    enabled: boolean;
    supportedTypes: LocalAuthentication.AuthenticationType[];
  }> {
    try {
      const available = await this.isAvailable();
      const enabled = await this.isBiometricEnabled();
      const supportedTypes = await this.getSupportedTypes();

      return {
        available,
        enabled,
        supportedTypes,
      };
    } catch (error) {
      console.error('Error getting biometric status:', error);
      return {
        available: false,
        enabled: false,
        supportedTypes: [],
      };
    }
  }

  /**
   * Get user-friendly biometric type name
   */
  static getBiometricTypeName(type: LocalAuthentication.AuthenticationType): string {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'Fingerprint';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'Face ID';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Iris';
      default:
        return 'Biometric';
    }
  }

  /**
   * Get primary biometric type name for display
   */
  static async getPrimaryBiometricType(): Promise<string> {
    try {
      const types = await this.getSupportedTypes();
      if (types.length > 0) {
        return this.getBiometricTypeName(types[0]);
      }
      return 'Biometric';
    } catch (error) {
      console.error('Error getting primary biometric type:', error);
      return 'Biometric';
    }
  }

  /**
   * Store user credentials for biometric login
   */
  static async storeCredentials(email: string, password: string): Promise<void> {
    try {
      await Promise.all([
        this.setItem(this.STORED_EMAIL_KEY, email),
        this.setItem(this.STORED_PASSWORD_KEY, password),
      ]);
    } catch (error) {
      console.error('Error storing credentials:', error);
      throw error;
    }
  }

  /**
   * Retrieve stored credentials
   */
  static async getStoredCredentials(): Promise<{ email: string; password: string } | null> {
    try {
      const [email, password] = await Promise.all([
        this.getItem(this.STORED_EMAIL_KEY),
        this.getItem(this.STORED_PASSWORD_KEY),
      ]);

      if (email && password) {
        return { email, password };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  /**
   * Clear stored credentials
   */
  static async clearStoredCredentials(): Promise<void> {
    try {
      await Promise.all([
        this.deleteItem(this.STORED_EMAIL_KEY),
        this.deleteItem(this.STORED_PASSWORD_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  }

  /**
   * Check if credentials are stored
   */
  static async hasStoredCredentials(): Promise<boolean> {
    try {
      const credentials = await this.getStoredCredentials();
      return credentials !== null;
    } catch (error) {
      console.error('Error checking stored credentials:', error);
      return false;
    }
  }
}
