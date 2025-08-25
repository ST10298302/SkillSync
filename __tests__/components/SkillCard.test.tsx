import { fireEvent } from '@testing-library/react-native';
import React from 'react';
import SkillCard from '../../components/SkillCard';
import { renderWithProviders } from '../../test-utils';

const baseProps = {
  id: '1',
  name: 'React Native',
  progress: 70,
  description: 'Build mobile apps',
  onPress: jest.fn(),
  lastUpdated: new Date().toISOString(),
  totalEntries: 3,
  streak: 2,
};

describe('SkillCard', () => {
  it('renders skill info', () => {
    const { getByText } = renderWithProviders(<SkillCard {...baseProps} />);
    expect(getByText('React Native')).toBeTruthy();
    expect(getByText('70% Complete')).toBeTruthy();
    expect(getByText('Build mobile apps')).toBeTruthy();
    expect(getByText('3 entries')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(<SkillCard {...baseProps} onPress={onPress} />);
    fireEvent.press(getByText('React Native'));
    expect(onPress).toHaveBeenCalled();
  });

  it('calls onEdit when edit button pressed', () => {
    const onEdit = jest.fn();
    const { getByTestId } = renderWithProviders(<SkillCard {...baseProps} onEdit={onEdit} />);
    fireEvent.press(getByTestId('edit-button'));
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});


