import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0–100
  height?: number;
  color?: string;
}

/**
 * A simple horizontal progress bar that fills according to the
 * provided percentage.  Accepts optional height and color props.
 * Uses metallic palette and theme system.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 10, color }) => {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  const fillGradient = color ? [color, color] : ['#60a5fa', '#f59e42'];
  const bgColor = themeColors.backgroundTertiary;

  return (
    <View style={[styles.container, { height, backgroundColor: bgColor }] }>
      <View style={[styles.fill, { width: `${progress}%` }]}> 
        <LinearGradient
          colors={fillGradient as [string, string]}
          style={styles.fill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  gradient: {
    flex: 1,
    height: '100%',
    borderRadius: 4,
  },
});

export default ProgressBar;