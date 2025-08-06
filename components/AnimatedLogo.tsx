import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

interface AnimatedLogoProps {
  size?: number;
  showGradient?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ 
  size = 80, 
  showGradient = true 
}) => {
  const theme = useColorScheme() ?? 'light';
  const safeTheme = theme === 'light' || theme === 'dark' ? theme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  
  const pulse = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    return () => {
      pulseAnimation.stop();
    };
  }, [pulse]);

  const gradientColors = React.useMemo(() => {
    if (themeColors.gradient.accent.length === 2) {
      return themeColors.gradient.accent as [string, string];
    }
    return themeColors.gradient.accent;
  }, [themeColors.gradient.accent]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulse }] }]}>
      {showGradient && (
        <LinearGradient
          colors={gradientColors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      {!showGradient && (
        <View style={styles.placeholder} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    borderRadius: 60, // Changed from BorderRadius.round to 60 for consistency with new code
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Changed from Spacing.lg to 20 for consistency with new code
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60, // Changed from BorderRadius.round to 60 for consistency with new code
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60, // Changed from BorderRadius.round to 60 for consistency with new code
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Example background for placeholder
  },
}); 