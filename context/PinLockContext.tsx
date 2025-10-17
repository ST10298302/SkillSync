import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { PinService } from '../services/pinService';
import { useAuth } from './AuthContext';


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
  const hasRedirectedRef = useRef(false);
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  const checkPinStatus = async () => {
    if (hasCheckedPinRef.current || !isLoggedIn || !user) return; // Only check if user is logged in
    
    try {
      hasCheckedPinRef.current = true;
      hasRedirectedRef.current = false; // Reset redirect flag
      const pinEnabled = await PinService.isPinEnabled();
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
    // Check PIN status when user logs in
    if (isLoggedIn && user) {
      hasCheckedPinRef.current = false; // Reset the ref when user changes
      checkPinStatus();
    } else {
      // Reset state when user logs out
      setIsPinEnabled(false);
      setIsLocked(false);
      hasCheckedPinRef.current = false;
      hasRedirectedRef.current = false;
    }
  }, [isLoggedIn, user?.id]); // Run when login status or user changes

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
    console.log('PIN lock context: isLocked =', isLocked, 'isPinEnabled =', isPinEnabled, 'hasCheckedPin =', hasCheckedPinRef.current, 'hasRedirected =', hasRedirectedRef.current);
    if (isLocked && isPinEnabled && hasCheckedPinRef.current && !hasRedirectedRef.current) {
      console.log('Redirecting to PIN verification');
      hasRedirectedRef.current = true;
      // Use a small delay to prevent navigation conflicts
      setTimeout(() => {
        router.replace('/pin-verification');
      }, 100);
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
