import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import { HapticTab } from '../../components/HapticTab';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  
  // State for responsive design
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  
  // Listen for screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  const { width, height } = screenDimensions;
  const isWeb = Platform.OS === 'web';
  const isSmallScreen = width < 768; // Mobile breakpoint
  
  // Calculate responsive tab bar dimensions
  const getTabBarHeight = () => {
    if (isWeb) {
      return isSmallScreen ? 60 : 70; // Smaller on mobile web, larger on desktop
    }
    return Platform.OS === 'ios' ? 88 : 60;
  };
  
  const getTabBarPadding = () => {
    if (isWeb) {
      return isSmallScreen ? 8 : 12; // Responsive padding for web
    }
    return Platform.OS === 'ios' ? 34 : 8;
  };
  
  const getTabBarTopPadding = () => {
    if (isWeb) {
      return isSmallScreen ? 6 : 8; // Responsive top padding for web
    }
    return 8;
  };
  
  const getTabBarFontSize = () => {
    if (isWeb) {
      return isSmallScreen ? 11 : 12; // Smaller font on mobile web
    }
    return 12;
  };
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[safeTheme].accent,
        tabBarInactiveTintColor: Colors[safeTheme].textSecondary,
        tabBarStyle: {
          backgroundColor: Colors[safeTheme].background,
          borderTopColor: Colors[safeTheme].border,
          borderTopWidth: 1,
          paddingBottom: getTabBarPadding(),
          height: getTabBarHeight(),
          paddingTop: getTabBarTopPadding(),
          // Web-specific styles
          ...(isWeb && {
            minHeight: getTabBarHeight(),
            maxHeight: getTabBarHeight(),
            position: 'fixed' as any,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }),
        },
        tabBarLabelStyle: {
          fontSize: getTabBarFontSize(),
          fontWeight: '500',
          // Web-specific label styles
          ...(isWeb && {
            marginTop: isSmallScreen ? 2 : 4,
          }),
        },
        tabBarIconStyle: {
          // Web-specific icon styles
          ...(isWeb && {
            marginBottom: isSmallScreen ? 2 : 4,
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Skills',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size + 4} color={Colors[safeTheme].accent} />
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
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
    </Tabs>
  );
}