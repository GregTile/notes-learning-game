import { ChildProfile } from '../types';

const PROFILES_STORAGE_KEY = 'piano_trainer_profiles_v2';
const ACTIVE_PROFILE_KEY = 'piano_trainer_active_child_v2';

export const DEFAULT_PROFILES: ChildProfile[] = [
  {
    id: 'child_player_one',
    name: 'Player One',
    avatar: '🦄',
    color: '#8b5cf6', // purple
    unlockedLevel: 1,
    totalStars: 0,
    totalNotesAnswered: 0,
    totalCorrect: 0,
    bestStreak: 0,
    levelRecords: {},
  },
  {
    id: 'child_player_two',
    name: 'Player Two',
    avatar: '🌸',
    color: '#ec4899', // pink
    unlockedLevel: 1,
    totalStars: 0,
    totalNotesAnswered: 0,
    totalCorrect: 0,
    bestStreak: 0,
    levelRecords: {},
  },
];

export function loadProfiles(): ChildProfile[] {
  try {
    const saved = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let hasChanges = false;
        // Strip out any legacy 'age' field and migrate Isabelle/Anya to Player One/Player Two
        const migrated = parsed.map((p) => {
          let name = p.name;
          if (name === 'Isabelle') {
            name = 'Player One';
            hasChanges = true;
          } else if (name === 'Anya') {
            name = 'Player Two';
            hasChanges = true;
          }
          const { age: _age, ...rest } = p as ChildProfile & { age?: number };
          return { ...rest, name };
        });

        if (hasChanges) {
          saveProfiles(migrated);
        }
        return migrated;
      }
    }
  } catch {
    // fallback
  }

  // Initialize with Player One and Player Two
  saveProfiles(DEFAULT_PROFILES);
  setActiveProfileId(DEFAULT_PROFILES[0].id);
  return DEFAULT_PROFILES;
}

export function saveProfiles(profiles: ChildProfile[]): void {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // ignore
  }
}

export function getActiveProfileId(): string {
  try {
    const active = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (active) return active;
  } catch {
    // fallback
  }
  return DEFAULT_PROFILES[0].id;
}

export function setActiveProfileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch {
    // ignore
  }
}

export function updateProfileProgress(
  profileId: string,
  levelId: number,
  accuracy: number,
  avgTimeSec: number,
  starsEarned: number,
  notesCount: number,
  correctCount: number,
  streakAchieved: number
): ChildProfile[] {
  const profiles = loadProfiles();
  const index = profiles.findIndex((p) => p.id === profileId);
  if (index === -1) return profiles;

  const profile = { ...profiles[index] };
  const currentRecord = profile.levelRecords[levelId] || {
    stars: 0,
    bestAccuracy: 0,
    bestAvgTimeSec: 999,
  };

  const newStars = Math.max(currentRecord.stars, starsEarned);
  const bestAcc = Math.max(currentRecord.bestAccuracy, accuracy);
  const bestTime = Math.min(currentRecord.bestAvgTimeSec, avgTimeSec);

  profile.levelRecords = {
    ...profile.levelRecords,
    [levelId]: {
      stars: newStars,
      bestAccuracy: bestAcc,
      bestAvgTimeSec: bestTime,
      completedAt: new Date().toISOString(),
    },
  };

  // Recalculate total stars
  profile.totalStars = Object.values(profile.levelRecords).reduce((sum, r) => sum + r.stars, 0);
  profile.totalNotesAnswered += notesCount;
  profile.totalCorrect += correctCount;
  profile.bestStreak = Math.max(profile.bestStreak, streakAchieved);

  // If passed with at least 1 star, unlock next level
  if (starsEarned >= 1 && levelId >= profile.unlockedLevel) {
    profile.unlockedLevel = Math.min(8, levelId + 1);
  }

  profiles[index] = profile;
  saveProfiles(profiles);
  return profiles;
}

export function resetProfileProgress(profileId: string): ChildProfile[] {
  const profiles = loadProfiles();
  const index = profiles.findIndex((p) => p.id === profileId);
  if (index === -1) return profiles;

  const profile = { ...profiles[index] };
  profile.unlockedLevel = 1;
  profile.totalStars = 0;
  profile.totalNotesAnswered = 0;
  profile.totalCorrect = 0;
  profile.bestStreak = 0;
  profile.levelRecords = {};

  profiles[index] = profile;
  saveProfiles(profiles);
  return profiles;
}

export function setProfileUnlockedLevel(profileId: string, level: number): ChildProfile[] {
  const profiles = loadProfiles();
  const index = profiles.findIndex((p) => p.id === profileId);
  if (index === -1) return profiles;

  const profile = { ...profiles[index] };
  profile.unlockedLevel = Math.max(1, Math.min(8, level));

  profiles[index] = profile;
  saveProfiles(profiles);
  return profiles;
}
