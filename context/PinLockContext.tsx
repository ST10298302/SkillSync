import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';


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
  const hasCheckedPinRef = useRef(false);
  const router = useRouter();

  const checkPinStatus = async () => {
    if (hasCheckedPinRef.current) return; // Prevent multiple checks
    
    try {
      hasCheckedPinRef.current = true;
      // Temporarily disable PIN lock to fix white screen
      const pinEnabled = false; // await PinService.isPinEnabled();
      console.log('PIN enabled status:', pinEnabled);
      setIsPinEnabled(pinEnabled);
      
      if (pinEnabled) {
        console.log('Setting app as locked');
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Error checking PIN status:', error);
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
    if (isLocked && isPinEnabled && hasCheckedPinRef.current) {
      console.log('Redirecting to PIN verification');
      router.push('/pin-verification');
    }
  }, [isLocked, isPinEnabled]);

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
