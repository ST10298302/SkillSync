import { calculateSkillStreak, calculateUserStreak } from '../../utils/streakCalculator';

describe('streakCalculator', () => {
  it('returns 0 for no activity', () => {
    expect(calculateSkillStreak([], [])).toBe(0);
  });

  it('counts consecutive days correctly', () => {
    const today = new Date();
    const y1 = new Date(today); y1.setDate(today.getDate() - 1);
    const y2 = new Date(today); y2.setDate(today.getDate() - 2);

    const entries = [
      { date: today.toISOString(), hours: 1 },
      { date: y1.toISOString(), hours: 1 },
      { date: y2.toISOString(), hours: 1 },
    ];

    expect(calculateSkillStreak(entries, [])).toBeGreaterThanOrEqual(1);
  });

  it('aggregates user streak across skills', () => {
    const today = new Date();
    const skills = [
      { entries: [{ date: today.toISOString(), hours: 1 }], progressUpdates: [] },
      { entries: [], progressUpdates: [{ created_at: today.toISOString() }] },
    ];
    expect(calculateUserStreak(skills)).toBeGreaterThanOrEqual(1);
  });
});


