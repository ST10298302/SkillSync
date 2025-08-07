import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import Logo from './Logo';

interface AnimatedLogoProps {
  size?: number;
  style?: ViewStyle;
  bounceIntensity?: number;
  wiggleIntensity?: number;
  animationDuration?: number;
}

/**
 * Animated Logo component with bouncing and wiggling effects
 */
export default function AnimatedLogo({ 
  size = 120, 
  style,
  bounceIntensity = 0.1,
  wiggleIntensity = 5,
  animationDuration = 2000
}: AnimatedLogoProps) {
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Initial scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Continuous bounce and wiggle animation
    const startAnimations = () => {
      // Bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1 + bounceIntensity,
            duration: animationDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: animationDuration / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wiggle animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(wiggleAnim, {
            toValue: wiggleIntensity,
            duration: animationDuration / 4,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnim, {
            toValue: -wiggleIntensity,
            duration: animationDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnim, {
            toValue: 0,
            duration: animationDuration / 4,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Start animations after a short delay
    const timer = setTimeout(startAnimations, 500);
    return () => clearTimeout(timer);
  }, [bounceAnim, wiggleAnim, scaleAnim, bounceIntensity, wiggleIntensity, animationDuration]);

  return (
    <Animated.View
      style={[
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, bounceAnim) },
            { rotate: wiggleAnim.interpolate({
              inputRange: [-wiggleIntensity, wiggleIntensity],
              outputRange: [`-${wiggleIntensity}deg`, `${wiggleIntensity}deg`],
            }) },
          ],
        },
        style,
      ]}
    >
      <Logo size={size} />
    </Animated.View>
  );
} 