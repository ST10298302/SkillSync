import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

interface DiaryItemProps {
  text: string;
  date: string;
  hours?: number;
}

/**
 * Displays a single diary entry with its date.  Dates are
 * formatted as a simple locale string. Uses metallic palette and theme system.
 */
const DiaryItem: React.FC<DiaryItemProps> = ({ text, date, hours }) => {
  const theme = useColorScheme() ?? 'light';
  const formattedDate = new Date(date).toLocaleString();
  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].backgroundTertiary }]}> 
      <View style={styles.header}>
        <Text style={[styles.date, { color: Colors[theme].textSecondary }]}>{formattedDate}</Text>
        {hours && hours > 0 && (
          <Text style={[styles.hours, { color: Colors[theme].accent }]}>{hours}h</Text>
        )}
      </View>
      <Text style={[styles.text, { color: Colors[theme].text }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  hours: {
    fontSize: 12,
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
  },
});

export default DiaryItem;