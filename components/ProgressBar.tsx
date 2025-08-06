import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0–100
  height?: number;
  color?: string;
}

/**
 * A simple horizontal progress bar that fills according to the
 * provided percentage.  Accepts optional height and color props.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 10, color = '#4caf50' }) => {
  return (
    <View style={[styles.container, { height }] }>
      <View style={[styles.fill, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

export default ProgressBar;