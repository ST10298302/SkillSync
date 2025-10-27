import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import { HapticTab } from '../../components/HapticTab';
import { Colors } from '../../constants/Colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  
  // State for responsive designs
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  
  // Listen for screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  const { width } = screenDimensions;
  const isWeb = Platform.OS === 'web';
  const isSmallScreen = width < 768; // Mobile breakpoint
  const isTablet = width >= 768;
  
  // Calculate responsive tab bar dimensions
  const getTabBarHeight = () => {
    if (isWeb) {
      return isSmallScreen ? 64 : 72;
    }
    return Platform.OS === 'ios' ? 85 : 60;
  };
  
  const getTabBarPadding = () => {
    if (isWeb) {
      return isSmallScreen ? 8 : 14;
    }
    return Platform.OS === 'ios' ? 32 : 6;
  };
  
  const getTabBarTopPadding = () => {
    if (isWeb) {
      return isSmallScreen ? 6 : 10;
    }
    return Platform.OS === 'ios' ? 6 : 4;
  };
  
  const getIconSize = () => {
    if (isWeb) {
      return isSmallScreen ? 24 : 26;
    }
    return Platform.OS === 'ios' ? 24 : 26;
  };

  const themeColors = Colors[safeTheme];
  
  // Glass-morphism background colors with gradient
  const glassBackground = safeTheme === 'dark' 
    ? 'rgba(26, 29, 36, 0.95)' 
    : 'rgba(248, 249, 250, 0.95)';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColors.accent,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: glassBackground,
          borderTopColor: safeTheme === 'dark' ? 'rgba(55, 62, 77, 0.5)' : 'rgba(226, 232, 240, 0.8)',
          borderTopWidth: 1,
          paddingBottom: getTabBarPadding(),
          height: getTabBarHeight(),
          paddingTop: getTabBarTopPadding(),
          paddingHorizontal: isTablet ? 24 : 8,
          // Enhanced shadows
          shadowColor: safeTheme === 'dark' ? '#000' : '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: safeTheme === 'dark' ? 0.3 : 0.08,
          shadowRadius: 12,
          elevation: 20,
          // Web-specific styles
          ...(isWeb && {
            minHeight: getTabBarHeight(),
            maxHeight: getTabBarHeight(),
            position: 'fixed' as any,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            boxShadow: safeTheme === 'dark'
              ? '0 -4px 20px rgba(0, 0, 0, 0.4)'
              : '0 -4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderTop: `1px solid ${safeTheme === 'dark' ? 'rgba(55, 62, 77, 0.5)' : 'rgba(226, 232, 240, 0.8)'}`,
          }),
        },
        tabBarLabelStyle: {
          fontSize: isTablet ? 14 : 12,
          fontWeight: '600',
          marginTop: 4,
          // Web-specific label styles
          ...(isWeb && {
            marginTop: isSmallScreen ? 4 : 6,
          }),
        },
        tabBarIconStyle: {
          marginBottom: 2,
          // Web-specific icon styles
          ...(isWeb && {
            marginBottom: isSmallScreen ? 2 : 4,
          }),
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === 'ios' ? 4 : 2,
          paddingHorizontal: isTablet ? 12 : 4,
          minHeight: 44, // Minimum touch target for iOS
        },
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('skills'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="library" size={getIconSize()} color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: t('add'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="add-circle" size={getIconSize() + 2} color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('skill/new' as any);
          },
        })}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t('community'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="people" size={getIconSize()} color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('analytics'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="analytics" size={getIconSize()} color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="person" size={getIconSize()} color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
    </Tabs>
  );
}

