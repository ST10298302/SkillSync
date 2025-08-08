import React from 'react';
import { Image, ImageStyle } from 'react-native';

interface LogoProps {
  size?: number;
  style?: ImageStyle;
}

/**
 * Logo component for displaying the SkillSync logo
 */
export default function Logo({ size = 120, style }: LogoProps) {
  return (
    <Image
      source={require('../assets/images/skillsync-logo.png')}
      style={[
        {
          width: size,
          height: size,
          resizeMode: 'contain',
        },
        style,
      ]}
    />
  );
}
