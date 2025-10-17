import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export class BiometricService {
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
      const enabled = await SecureStore.getItemAsync(this.BIOMETRIC_ENABLED_KEY);
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
      await SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, 'true');
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
      await SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, 'false');
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
        SecureStore.setItemAsync(this.STORED_EMAIL_KEY, email),
        SecureStore.setItemAsync(this.STORED_PASSWORD_KEY, password),
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
        SecureStore.getItemAsync(this.STORED_EMAIL_KEY),
        SecureStore.getItemAsync(this.STORED_PASSWORD_KEY),
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
        SecureStore.deleteItemAsync(this.STORED_EMAIL_KEY),
        SecureStore.deleteItemAsync(this.STORED_PASSWORD_KEY),
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
