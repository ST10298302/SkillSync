import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usePinLock } from '../context/PinLockContext';

/**
 * Hook to track app state changes and reset session timeout
 * Lightweight approach that only tracks when app becomes active
 */
export function useUserActivity() {
  const { resetSessionTimeout } = usePinLock();

  useEffect(() => {
    // Track app state changes - only reset when app becomes active
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('App became active - resetting session timeout');
        resetSessionTimeout();
      }
    };

    // Add app state listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, [resetSessionTimeout]);
}
