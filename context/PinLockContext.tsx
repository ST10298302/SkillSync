import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { PinService } from '../services/pinService';
import { SessionTimeoutService } from '../services/sessionTimeoutService';
import { SupabaseService } from '../services/supabaseService';
import { useAuth } from './AuthContext';


interface PinLockContextType {
  isLocked: boolean;
  isPinEnabled: boolean;
  autoLockEnabled: boolean;
  sessionTimeout: string;
  lockApp: () => void;
  unlockApp: () => void;
  checkPinStatus: () => Promise<void>;
  refreshPinStatus: () => Promise<void>;
  resetSessionTimeout: () => void;
  refreshSessionTimeout: () => Promise<void>;
}

const PinLockContext = createContext<PinLockContextType | undefined>(undefined);

interface PinLockProviderProps {
  children: ReactNode;
}

export function PinLockProvider({ children }: PinLockProviderProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30min');
  const hasCheckedPinRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  const checkPinStatus = async () => {
    if (hasCheckedPinRef.current || !isLoggedIn || !user) return; // Only check if user is logged in
    
    try {
      hasCheckedPinRef.current = true;
      hasRedirectedRef.current = false; // Reset redirect flag
      
      // Check PIN status
      const pinEnabled = await PinService.isPinEnabled();
      console.log('PIN enabled status:', pinEnabled);
      setIsPinEnabled(pinEnabled);
      
      // Load security settings (auto lock and session timeout)
      const securitySettings = await SupabaseService.getSecuritySettings(user.id);
      setAutoLockEnabled(securitySettings.autoLock);
      setSessionTimeout(securitySettings.sessionTimeout);
      
          if (pinEnabled) {
            console.log('Setting app as locked');
            setIsLocked(true);
          } else {
            console.log('PIN disabled, checking auto lock settings...');
            console.log('securitySettings.autoLock:', securitySettings.autoLock);
            console.log('securitySettings.sessionTimeout:', securitySettings.sessionTimeout);
            
            // Auto-lock feature disabled for now
            console.log('Auto-lock feature disabled');
          }
    } catch (error) {
      console.error('Error checking PIN status:', error);
    }
  };

  const refreshPinStatus = async () => {
    if (!isLoggedIn || !user) return;
    
    try {
      console.log('Refreshing PIN status...');
      hasCheckedPinRef.current = false; // Reset the ref to allow re-checking
      hasRedirectedRef.current = false; // Reset redirect flag
      
      // Check PIN status
      const pinEnabled = await PinService.isPinEnabled();
      console.log('Refreshed PIN enabled status:', pinEnabled);
      setIsPinEnabled(pinEnabled);
      
      // Load security settings
      const securitySettings = await SupabaseService.getSecuritySettings(user.id);
      setAutoLockEnabled(securitySettings.autoLock);
      setSessionTimeout(securitySettings.sessionTimeout);
      
      if (pinEnabled) {
        console.log('Setting app as locked after refresh');
        setIsLocked(true);
      } else {
        console.log('PIN disabled, unlocking app');
        setIsLocked(false);
        // Stop session timeout when PIN is disabled
        SessionTimeoutService.stopSessionTimeout();
      }
    } catch (error) {
      console.error('Error refreshing PIN status:', error);
    }
  };


      const lockApp = () => {
        if (isPinEnabled) {
          console.log('lockApp called - setting app as locked');
          setIsLocked(true);
          // Reset redirect flag so PIN verification can show
          hasRedirectedRef.current = false;
          // Stop session timeout when app is locked
          SessionTimeoutService.stopSessionTimeout();
        }
      };

      const unlockApp = () => {
        console.log('unlockApp called');
        setIsLocked(false);
        // Auto-lock feature disabled for now
        console.log('Auto-lock feature disabled - not starting session timeout');
      };

      const resetSessionTimeout = () => {
        // Auto-lock feature disabled for now
        console.log('Auto-lock feature disabled - resetSessionTimeout called but not doing anything');
      };

  const refreshSessionTimeout = async () => {
    if (!isLoggedIn || !user) return;
    
    try {
      console.log('Refreshing session timeout settings...');
      
      // Load updated security settings
      const securitySettings = await SupabaseService.getSecuritySettings(user.id);
      setAutoLockEnabled(securitySettings.autoLock);
      setSessionTimeout(securitySettings.sessionTimeout);
      
      console.log('Updated session timeout settings:', securitySettings.sessionTimeout);
      
      // Auto-lock feature disabled for now
      console.log('Auto-lock feature disabled - not restarting session timeout');
    } catch (error) {
      console.error('Error refreshing session timeout:', error);
    }
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
      setAutoLockEnabled(true);
      setSessionTimeout('30min');
      hasCheckedPinRef.current = false;
      hasRedirectedRef.current = false;
      // Stop session timeout when user logs out
      SessionTimeoutService.stopSessionTimeout();
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
    autoLockEnabled,
    sessionTimeout,
    lockApp,
    unlockApp,
    checkPinStatus,
    refreshPinStatus,
    resetSessionTimeout,
    refreshSessionTimeout,
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
