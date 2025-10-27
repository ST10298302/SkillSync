import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

interface DiaryItemProps {
  text: string;
  date: string;
  hours?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Displays a single diary entry with its date.  Dates are
 * formatted as a simple locale string. Uses metallic palette and theme system.
 */
const DiaryItem: React.FC<DiaryItemProps> = ({ text, date, hours, onEdit, onDelete }) => {
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;
  const formattedDate = new Date(date).toLocaleString();
  return (
    <View style={[styles.container, { backgroundColor: themeColors.backgroundTertiary }]}> 
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.date, { color: themeColors.textSecondary }]}>{formattedDate}</Text>
          {hours && hours > 0 && (
            <Text style={[styles.hours, { color: themeColors.accent }]}>{hours}h</Text>
          )}
        </View>
        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                <Ionicons name="pencil-outline" size={18} color={themeColors.textSecondary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={18} color={themeColors.error} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <Text style={[styles.text, { color: themeColors.text }]} numberOfLines={10} ellipsizeMode="tail">
        {text || ' '}
      </Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 12,
  },
  hours: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  text: {
    fontSize: 16,
  },
});

export default DiaryItem;