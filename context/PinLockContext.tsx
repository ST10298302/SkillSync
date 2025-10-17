import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { PinService } from '../services/pinService';

interface PinLockContextType {
  isLocked: boolean;
  isPinEnabled: boolean;
  lockApp: () => void;
  unlockApp: () => void;
  checkPinStatus: () => Promise<void>;
}

const PinLockContext = createContext<PinLockContextType | undefined>(undefined);

interface PinLockProviderProps {
  children: ReactNode;
}

export function PinLockProvider({ children }: PinLockProviderProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [hasCheckedPin, setHasCheckedPin] = useState(false);
  const router = useRouter();

  const checkPinStatus = async () => {
    if (hasCheckedPin) return; // Prevent multiple checks
    
    try {
      const pinEnabled = await PinService.isPinEnabled();
      console.log('PIN enabled status:', pinEnabled);
      setIsPinEnabled(pinEnabled);
      setHasCheckedPin(true);
      
      if (pinEnabled) {
        console.log('Setting app as locked');
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Error checking PIN status:', error);
      setHasCheckedPin(true);
    }
  };

  const lockApp = () => {
    if (isPinEnabled) {
      setIsLocked(true);
    }
  };

  const unlockApp = () => {
    setIsLocked(false);
  };

  useEffect(() => {
    // Check PIN status on app start (only once)
    checkPinStatus();
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is going to background, lock it if PIN is enabled
        if (isPinEnabled) {
          lockApp();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isPinEnabled]);

  // Redirect to PIN verification when locked
  useEffect(() => {
    if (isLocked && isPinEnabled && hasCheckedPin) {
      console.log('Redirecting to PIN verification');
      router.push('/pin-verification');
    }
  }, [isLocked, isPinEnabled, hasCheckedPin]);

  const value: PinLockContextType = {
    isLocked,
    isPinEnabled,
    lockApp,
    unlockApp,
    checkPinStatus,
  };

  return (
    <PinLockContext.Provider value={value}>
      {children}
    </PinLockContext.Provider>
  );
}

export function usePinLock() {
  const context = useContext(PinLockContext);
  if (context === undefined) {
    throw new Error('usePinLock must be used within a PinLockProvider');
  }
  return context;
}
