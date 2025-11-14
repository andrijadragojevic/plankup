export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
  createdAt: Date;
}

export interface UserSettings {
  dailyIncrement: number; // seconds to add per day (default: 3)
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm format
  streakWarningEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  hasCompletedOnboarding: boolean;
  darkMode: boolean;
}

export interface BaselineData {
  isComplete: boolean;
  sessions: number[]; // Array of durations in seconds
  averageTime: number; // Calculated average
}

export interface PlankSession {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  duration: number; // seconds
  targetDuration: number; // seconds
  type: 'baseline' | 'progression';
  completed: boolean;
  timestamp: Date;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD format
}

export interface UserProgress {
  userId: string;
  baselineData: BaselineData;
  streakData: StreakData;
  currentTargetDuration: number; // seconds
  totalSessions: number;
  totalPlankTime: number; // total seconds spent planking
  lastUpdated: Date;
}

export interface DailyTarget {
  date: string; // YYYY-MM-DD
  targetDuration: number; // seconds
  completed: boolean;
  actualDuration?: number; // seconds
}

export type TimerState = 'idle' | 'countdown' | 'running' | 'paused' | 'completed';

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface NotificationPermission {
  granted: boolean;
  prompt: boolean;
  denied: boolean;
}
