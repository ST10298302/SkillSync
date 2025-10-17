import * as SecureStore from 'expo-secure-store';

export type SessionTimeout = '1min' | '5min' | '15min' | '30min' | '1hour' | 'never';

export class SessionTimeoutService {
  private static readonly SESSION_TIMEOUT_KEY = 'session_timeout';
  private static readonly LAST_ACTIVITY_KEY = 'last_activity';
  private static timeoutId: NodeJS.Timeout | null = null;
  private static isActive = false;

  /**
   * Get session timeout setting
   */
  static async getSessionTimeout(): Promise<SessionTimeout> {
    try {
      const timeout = await SecureStore.getItemAsync(this.SESSION_TIMEOUT_KEY);
      return (timeout as SessionTimeout) || '30min';
    } catch (error) {
      console.error('Error getting session timeout:', error);
      return '30min';
    }
  }

  /**
   * Set session timeout setting
   */
  static async setSessionTimeout(timeout: SessionTimeout): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.SESSION_TIMEOUT_KEY, timeout);
    } catch (error) {
      console.error('Error setting session timeout:', error);
      throw error;
    }
  }

      /**
       * Start session timeout monitoring
       */
      static startSessionTimeout(
        onTimeout: () => void,
        isPinEnabled: boolean,
        autoLockEnabled: boolean
      ): void {
        console.log('SessionTimeoutService.startSessionTimeout called');
        console.log('isPinEnabled:', isPinEnabled, 'autoLockEnabled:', autoLockEnabled);
        
        // Only start if PIN is enabled and auto lock is enabled
        if (!isPinEnabled || !autoLockEnabled) {
          console.log('Session timeout not started: PIN disabled or auto lock disabled');
          return;
        }

        this.stopSessionTimeout(); // Stop any existing timeout

        this.getSessionTimeout().then((timeout) => {
          console.log('Current session timeout setting:', timeout);
          
          if (timeout === 'never') {
            console.log('Session timeout set to never - not starting timer');
            return;
          }

          const timeoutMs = this.getTimeoutMs(timeout);
          console.log(`Starting session timeout: ${timeout} (${timeoutMs}ms = ${timeoutMs/1000} seconds)`);

          this.timeoutId = setTimeout(() => {
            console.log('Session timeout expired - locking app');
            onTimeout();
          }, timeoutMs);

          this.isActive = true;
          console.log('Session timeout timer started successfully');
        }).catch((error) => {
          console.error('Error getting session timeout:', error);
        });
      }

  /**
   * Stop session timeout monitoring
   */
  static stopSessionTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      console.log('Session timeout timer cleared');
    }
    this.isActive = false;
    console.log('Session timeout stopped');
  }

  /**
   * Reset session timeout (call when user interacts with app)
   */
  static resetSessionTimeout(
    onTimeout: () => void,
    isPinEnabled: boolean,
    autoLockEnabled: boolean
  ): void {
    if (!this.isActive) {
      console.log('Session timeout not active, skipping reset');
      return;
    }

    console.log('Resetting session timeout due to user activity');
    this.startSessionTimeout(onTimeout, isPinEnabled, autoLockEnabled);
  }

  /**
   * Update session timeout settings and restart if needed
   */
  static updateSessionTimeout(
    timeout: SessionTimeout,
    onTimeout: () => void,
    isPinEnabled: boolean,
    autoLockEnabled: boolean
  ): void {
    this.setSessionTimeout(timeout).then(() => {
      if (this.isActive) {
        this.startSessionTimeout(onTimeout, isPinEnabled, autoLockEnabled);
      }
    });
  }

  /**
   * Check if session timeout is currently active
   */
  static isSessionTimeoutActive(): boolean {
    return this.isActive;
  }

  /**
   * Convert timeout string to milliseconds
   */
  private static getTimeoutMs(timeout: SessionTimeout): number {
    switch (timeout) {
      case '1min':
        return 1 * 60 * 1000; // 1 minute
      case '5min':
        return 5 * 60 * 1000; // 5 minutes
      case '15min':
        return 15 * 60 * 1000; // 15 minutes
      case '30min':
        return 30 * 60 * 1000; // 30 minutes
      case '1hour':
        return 60 * 60 * 1000; // 1 hour
      case 'never':
        return 0; // Never timeout
      default:
        return 30 * 60 * 1000; // Default to 30 minutes
    }
  }

  /**
   * Get human-readable timeout description
   */
  static getTimeoutDescription(timeout: SessionTimeout): string {
    switch (timeout) {
      case '1min':
        return '1 minute';
      case '5min':
        return '5 minutes';
      case '15min':
        return '15 minutes';
      case '30min':
        return '30 minutes';
      case '1hour':
        return '1 hour';
      case 'never':
        return 'Never';
      default:
        return '30 minutes';
    }
  }
}
