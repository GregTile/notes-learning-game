export type Clef = 'treble' | 'bass';

export type NotePitch = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface NoteDefinition {
  id: string; // e.g. "C4_treble"
  pitch: NotePitch;
  octave: number; // e.g. 4
  clef: Clef;
  // Position index on staff: 0 = middle line of staff
  // Positive = steps above, Negative = steps below
  // For treble: Line 1 (bottom) is E4 (index -4)
  //   Space 1 is F4 (index -3)
  //   Line 2 is G4 (index -2)
  //   Space 2 is A4 (index -1)
  //   Line 3 (middle) is B4 (index 0)
  //   Space 3 is C5 (index 1)
  //   Line 4 is D5 (index 2)
  //   Space 4 is E5 (index 3)
  //   Line 5 (top) is F5 (index 4)
  //   Middle C is C4 (index -6, ledger line)
  //   D4 is index -5 (space below staff)
  //   G5 is index 5 (space above staff)
  //   A5 is index 6 (ledger line above staff)
  staffPosition: number;
  isLine: boolean;
  mnemonicPhrase?: string; // e.g. "Every" or "F"
  mnemonicWord?: string;
  hand: 'right' | 'left';
  frequency: number;
}

export interface LevelConfig {
  id: number;
  title: string;
  clef: Clef | 'mixed';
  description: string;
  mnemonicFocus: string;
  mnemonicRule: string;
  noteIds: string[];
  totalNotes: number;
  timeLimitSec?: number;
  minAccuracyToPass: number; // e.g. 70 (%)
  badgeName: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string; // emoji e.g. '🦄', '🦁', '🦊'
  color: string;
  unlockedLevel: number;
  totalStars: number;
  totalNotesAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  levelRecords: Record<number, {
    stars: number; // 0-3
    bestAccuracy: number;
    bestAvgTimeSec: number;
    completedAt?: string;
  }>;
}

export interface AnswerResult {
  isCorrect: boolean;
  userAnswer: NotePitch;
  correctAnswer: NotePitch;
  timeTakenMs: number;
  note: NoteDefinition;
}
