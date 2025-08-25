import { fireEvent } from '@testing-library/react-native';
import React from 'react';
import SkillCard from '../../components/SkillCard';
import { renderWithProviders } from '../../test-utils';

// Mock the translation functionality
jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      // Return actual translations for common keys
      const translations: Record<string, string> = {
        'complete': 'Complete',
        'progress': 'Progress',
        'entries': 'entries',
        'streak': 'streak',
        'lastUpdated': 'Last Updated',
        'daysAgo': 'days ago',
        'delete': 'Delete',
        'cancel': 'Cancel',
      };
      return translations[key] || key;
    },
    currentLanguage: 'en',
    translateText: jest.fn(async (text: string) => text),
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const baseProps = {
  id: '1',
  name: 'React Native',
  progress: 70,
  description: 'Build mobile apps',
  onPress: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  lastUpdated: new Date().toISOString(),
  totalEntries: 3,
  streak: 2,
};

describe('SkillCard', () => {
  it('renders skill info', () => {
    const { getByText } = renderWithProviders(<SkillCard {...baseProps} />);
    expect(getByText('React Native')).toBeTruthy();
    expect(getByText('70%\nProgress')).toBeTruthy();
    expect(getByText('Build mobile apps')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('entries')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(<SkillCard {...baseProps} onPress={onPress} />);
    fireEvent.press(getByText('React Native'));
    expect(onPress).toHaveBeenCalled();
  });

  it('calls onEdit when edit button pressed', async () => {
    const onEdit = jest.fn();
    const { getByTestId } = renderWithProviders(<SkillCard {...baseProps} onEdit={onEdit} />);
    fireEvent.press(getByTestId('edit-button'));
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});


