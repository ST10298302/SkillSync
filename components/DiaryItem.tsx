import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DiaryItemProps {
  text: string;
  date: string;
}

/**
 * Displays a single diary entry with its date.  Dates are
 * formatted as a simple locale string.
 */
const DiaryItem: React.FC<DiaryItemProps> = ({ text, date }) => {
  const formattedDate = new Date(date).toLocaleString();
  return (
    <View style={styles.container}>
      <Text style={styles.date}>{formattedDate}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
  },
});

export default DiaryItem;