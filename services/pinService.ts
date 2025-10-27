import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export class PinService {
  private static readonly PIN_KEY = 'user_pin';
  private static readonly PIN_ENABLED_KEY = 'pin_enabled';
  private static readonly SALT = 'skillsync_salt';

  // Use AsyncStorage on web, SecureStore on native
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

  /**
   * Check if PIN is enabled
   */
  static async isPinEnabled(): Promise<boolean> {
    try {
      const enabled = await this.getItem(this.PIN_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking PIN status:', error);
      return false;
    }
  }

  /**
   * Enable PIN protection
   */
  static async enablePin(): Promise<void> {
    try {
      await this.setItem(this.PIN_ENABLED_KEY, 'true');
    } catch (error) {
      console.error('Error enabling PIN:', error);
      throw error;
    }
  }

  /**
   * Disable PIN protection and remove the PIN
   */
  static async disablePin(): Promise<void> {
    try {
      await this.deleteItem(this.PIN_ENABLED_KEY);
      await this.deleteItem(this.PIN_KEY);
    } catch (error) {
      console.error('Error disabling PIN:', error);
      throw error;
    }
  }

  /**
   * Completely remove PIN (for account deletion)
   */
  static async removePin(): Promise<void> {
    try {
      await this.deleteItem(this.PIN_ENABLED_KEY);
      await this.deleteItem(this.PIN_KEY);
    } catch (error) {
      console.error('Error removing PIN:', error);
      throw error;
    }
  }

  /**
   * Set a new PIN
   */
  static async setPin(pin: string): Promise<void> {
    try {
      const hashedPin = await this.hashPin(pin);
      await this.setItem(this.PIN_KEY, hashedPin);
      await this.setItem(this.PIN_ENABLED_KEY, 'true');
    } catch (error) {
      console.error('Error setting PIN:', error);
      throw error;
    }
  }

  /**
   * Verify PIN
   */
  static async verifyPin(pin: string): Promise<boolean> {
    try {
      const storedPin = await this.getItem(this.PIN_KEY);
      if (!storedPin) {
        return false;
      }

      const hashedPin = await this.hashPin(pin);
      return hashedPin === storedPin;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  }

  /**
   * Hash PIN for secure storage
   */
  private static async hashPin(pin: string): Promise<string> {
    try {
      const dataToHash = pin + this.SALT;
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        dataToHash,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      return hash;
    } catch (error) {
      console.error('Error hashing PIN:', error);
      throw error;
    }
  }

  /**
   * Check if PIN is valid format (4 digits)
   */
  static isValidPin(pin: string): boolean {
    return /^\d{4}$/.test(pin);
  }

  /**
   * Check if a PIN exists (regardless of enabled status)
   */
  static async hasPin(): Promise<boolean> {
    try {
      const pin = await this.getItem(this.PIN_KEY);
      return !!pin;
    } catch (error) {
      console.error('Error checking if PIN exists:', error);
      return false;
    }
  }

  /**
   * Get PIN status for display
   */
  static async getPinStatus(): Promise<{
    enabled: boolean;
    hasPin: boolean;
  }> {
    try {
      const enabled = await this.isPinEnabled();
      const hasPin = await this.hasPin();
      
      return {
        enabled,
        hasPin,
      };
    } catch (error) {
      console.error('Error getting PIN status:', error);
      return {
        enabled: false,
        hasPin: false,
      };
    }
  }
}
