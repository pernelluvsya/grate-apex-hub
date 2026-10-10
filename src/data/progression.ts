// Presentation helpers for XP, levels and streaks.
// They only READ existing progress data — they never change it.

// Must match the level rule in progress.ts:
// level = Math.floor(xp / 100) + 1
export const XP_PER_LEVEL = 100;

export type LevelProgress = {
  level: number;
  nextLevel: number;
  xpIntoLevel: number; // XP earned inside the current level
  xpForLevel: number; // XP needed to complete a level
  xpToNextLevel: number; // XP still needed for the next level
  percent: number; // 0–100, for the progress bar
};

export function getLevelProgress(xp: number): LevelProgress {
  const safeXp = Number.isFinite(xp) && xp > 0 ? Math.floor(xp) : 0;
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = safeXp - (level - 1) * XP_PER_LEVEL;

  return {
    level,
    nextLevel: level + 1,
    xpIntoLevel,
    xpForLevel: XP_PER_LEVEL,
    xpToNextLevel: XP_PER_LEVEL - xpIntoLevel,
    percent: Math.round((xpIntoLevel / XP_PER_LEVEL) * 100),
  };
}

// Same date format the streak logic in progress.ts uses (YYYY-MM-DD).
function dayKey(date: Date) {
  return date.toISOString().split('T')[0];
}

export type StreakStatus =
  | 'none' // no streak yet
  | 'activeToday' // a lesson was completed today
  | 'continueToday' // last lesson was yesterday: keep it going
  | 'lapsed'; // a day was missed: the next lesson starts a new streak

export function getStreakStatus(
  streak: number,
  lastActivityDate: string | null,
  now: Date = new Date()
): StreakStatus {
  if (!lastActivityDate || streak <= 0) {
    return 'none';
  }

  if (lastActivityDate === dayKey(now)) {
    return 'activeToday';
  }

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  if (lastActivityDate === dayKey(yesterday)) {
    return 'continueToday';
  }

  return 'lapsed';
}

// One short, honest encouragement line based on real progress data.
export function getMotivationMessage(
  status: StreakStatus,
  streak: number,
  levelProgress: LevelProgress
) {
  switch (status) {
    case 'activeToday':
      return `You've studied today — nice work. ${levelProgress.xpToNextLevel} XP to reach Level ${levelProgress.nextLevel}.`;
    case 'continueToday':
      return `Complete a lesson today to keep your ${streak}-day streak going.`;
    case 'lapsed':
      return 'Welcome back! Complete a lesson to start a new streak.';
    default:
      return 'Complete your first lesson to start your streak.';
  }
}
