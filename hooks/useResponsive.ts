import { Dimensions } from 'react-native';
import { Spacing } from '../constants/Colors';

export const useResponsive = () => {
  const width = Dimensions.get('window').width;
  const isSmall = width < 375;
  const isVerySmall = width < 360;
  const isLarge = width > 414;
  
  return {
    isSmall,
    isVerySmall,
    isLarge,
    width,
    scale: isSmall ? (isVerySmall ? 0.85 : 0.9) : 1,
    spacing: isSmall 
      ? { ...Spacing, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 }
      : Spacing,
    fontSize: {
      h1: isSmall ? 24 : 28,
      h2: isSmall ? 20 : 24,
      h3: isSmall ? 18 : 20,
      h4: isSmall ? 16 : 18,
      body: isSmall ? 14 : 16,
      bodySmall: isSmall ? 12 : 14,
      caption: isSmall ? 10 : 12,
    },
  };
};
