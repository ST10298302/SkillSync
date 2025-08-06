/**
 * Utility functions for calculating streaks and activity patterns
 */

export interface ActivityDay {
  date: string; // YYYY-MM-DD format
  entries: number;
  hours: number;
  progressUpdates: number;
}

/**
 * Calculate the current streak for a skill based on its entries and progress updates
 */
export function calculateSkillStreak(entries: any[], progressUpdates: any[]): number {
  if (!entries.length && !progressUpdates.length) return 0;

  // Combine all activity dates
  const activityDates = new Set<string>();
  
  // Add entry dates
  entries.forEach(entry => {
    const date = new Date(entry.date || entry.created_at).toISOString().split('T')[0];
    activityDates.add(date);
  });
  
  // Add progress update dates
  progressUpdates.forEach(update => {
    const date = new Date(update.created_at).toISOString().split('T')[0];
    activityDates.add(date);
  });

  // Sort dates in descending order
  const sortedDates = Array.from(activityDates).sort((a, b) => b.localeCompare(a));
  
  if (sortedDates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  let streak = 0;
  let currentDate = today;
  
  // Check if there was activity today or yesterday to start the streak
  if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
    for (let i = 0; i < sortedDates.length; i++) {
      const activityDate = sortedDates[i];
      
      // If this is the first date and it's today or yesterday, start the streak
      if (i === 0 && (activityDate === today || activityDate === yesterday)) {
        streak = 1;
        currentDate = activityDate;
        continue;
      }
      
      // Check if this date is consecutive to the previous one
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (activityDate === expectedDateStr) {
        streak++;
        currentDate = activityDate;
      } else {
        // Streak broken
        break;
      }
    }
  }
  
  return streak;
}

/**
 * Calculate the overall user streak across all skills
 */
export function calculateUserStreak(skills: any[]): number {
  if (!skills.length) return 0;
  
  // Get all activity dates across all skills
  const allActivityDates = new Set<string>();
  
  skills.forEach(skill => {
    // Add entry dates
    skill.entries?.forEach((entry: any) => {
      const date = new Date(entry.date || entry.created_at).toISOString().split('T')[0];
      allActivityDates.add(date);
    });
    
    // Add progress update dates
    skill.progressUpdates?.forEach((update: any) => {
      const date = new Date(update.created_at).toISOString().split('T')[0];
      allActivityDates.add(date);
    });
  });
  
  // Sort dates in descending order
  const sortedDates = Array.from(allActivityDates).sort((a, b) => b.localeCompare(a));
  
  if (sortedDates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  let streak = 0;
  let currentDate = today;
  
  // Check if there was activity today or yesterday to start the streak
  if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
    for (let i = 0; i < sortedDates.length; i++) {
      const activityDate = sortedDates[i];
      
      // If this is the first date and it's today or yesterday, start the streak
      if (i === 0 && (activityDate === today || activityDate === yesterday)) {
        streak = 1;
        currentDate = activityDate;
        continue;
      }
      
      // Check if this date is consecutive to the previous one
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (activityDate === expectedDateStr) {
        streak++;
        currentDate = activityDate;
      } else {
        // Streak broken
        break;
      }
    }
  }
  
  return streak;
}

/**
 * Get activity data for the last N days
 */
export function getActivityData(skills: any[], days: number = 7): ActivityDay[] {
  const activityMap = new Map<string, ActivityDay>();
  const today = new Date();
  
  // Initialize the last N days
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    activityMap.set(dateStr, {
      date: dateStr,
      entries: 0,
      hours: 0,
      progressUpdates: 0,
    });
  }
  
  // Count activity for each skill
  skills.forEach(skill => {
    // Count entries
    skill.entries?.forEach((entry: any) => {
      const date = new Date(entry.date || entry.created_at).toISOString().split('T')[0];
      const dayData = activityMap.get(date);
      if (dayData) {
        dayData.entries++;
        dayData.hours += entry.hours || 0;
      }
    });
    
    // Count progress updates
    skill.progressUpdates?.forEach((update: any) => {
      const date = new Date(update.created_at).toISOString().split('T')[0];
      const dayData = activityMap.get(date);
      if (dayData) {
        dayData.progressUpdates++;
      }
    });
  });
  
  // Return sorted array (most recent first)
  return Array.from(activityMap.values()).sort((a, b) => b.date.localeCompare(a.date));
} 