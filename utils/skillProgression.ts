// Skill progression utilities
// Handles level advancement and progress reset when skills reach 100%

export type SkillLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'expert';

export interface SkillProgressionResult {
  newLevel: SkillLevel;
  progressReset: boolean;
  message: string;
}

/**
 * Get the next level in the progression chain
 */
export function getNextLevel(currentLevel: SkillLevel): SkillLevel | null {
  const progression: SkillLevel[] = ['beginner', 'novice', 'intermediate', 'advanced', 'expert'];
  const currentIndex = progression.indexOf(currentLevel);
  
  if (currentIndex === -1 || currentIndex === progression.length - 1) {
    return null; // Already at max level or invalid level
  }
  
  return progression[currentIndex + 1];
}

/**
 * Check if skill should progress to next level
 * Returns the next level and whether progress should be reset
 */
export function shouldProgressLevel(
  currentLevel: SkillLevel,
  currentProgress: number
): SkillProgressionResult | null {
  // Only progress if at 100% completion
  if (currentProgress < 100) {
    return null;
  }
  
  const nextLevel = getNextLevel(currentLevel);
  
  if (!nextLevel) {
    // Already at expert level - no further progression
    return {
      newLevel: currentLevel,
      progressReset: false,
      message: 'Congratulations! You\'ve reached the expert level! 🎉'
    };
  }
  
  return {
    newLevel: nextLevel,
    progressReset: true,
    message: `🎉 Level Up! You've advanced from ${currentLevel} to ${nextLevel}! Progress will reset to continue your journey.`
  };
}

/**
 * Apply level progression to a skill
 * Resets progress to 0 if leveling up
 */
export function applyLevelProgression(
  currentLevel: SkillLevel,
  currentProgress: number
): { level: SkillLevel; progress: number } {
  const progressionResult = shouldProgressLevel(currentLevel, currentProgress);
  
  if (!progressionResult) {
    return { level: currentLevel, progress: currentProgress };
  }
  
  if (progressionResult.progressReset) {
    return {
      level: progressionResult.newLevel,
      progress: 0
    };
  }
  
  return {
    level: progressionResult.newLevel,
    progress: currentProgress
  };
}
