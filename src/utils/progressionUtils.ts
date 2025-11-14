import type { BaselineData, PlankSession, StreakData } from '../types';
import { getDateString, areConsecutiveDays } from './dateUtils';

/**
 * Calculate baseline average from 3 sessions
 */
export const calculateBaselineAverage = (sessions: number[]): number => {
  if (sessions.length !== 3) {
    throw new Error('Baseline requires exactly 3 sessions');
  }
  const sum = sessions.reduce((acc, val) => acc + val, 0);
  const average = Math.round(sum / 3);
  // Ensure minimum of 30 seconds
  return Math.max(30, average);
};

/**
 * Check if baseline is complete
 */
export const isBaselineComplete = (baselineData: BaselineData): boolean => {
  return baselineData.isComplete && baselineData.sessions.length === 3;
};

/**
 * Calculate next day's target duration
 */
export const calculateNextTarget = (
  currentTarget: number,
  dailyIncrement: number = 3
): number => {
  return currentTarget + dailyIncrement;
};

/**
 * Calculate streak based on sessions
 */
export const calculateStreak = (
  sessions: PlankSession[],
  currentStreakData: StreakData
): StreakData => {
  if (sessions.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: currentStreakData.bestStreak,
      lastCompletedDate: null,
    };
  }

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions]
    .filter(s => s.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sortedSessions.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: currentStreakData.bestStreak,
      lastCompletedDate: null,
    };
  }

  const today = getDateString();
  const latestSession = sortedSessions[0];

  // Check if streak is broken (last session wasn't today or yesterday)
  const daysSinceLastSession = getDaysDifference(latestSession.date, today);
  if (daysSinceLastSession > 1) {
    return {
      currentStreak: 0,
      bestStreak: currentStreakData.bestStreak,
      lastCompletedDate: latestSession.date,
    };
  }

  // Count consecutive days
  let streak = 1;
  let currentDate = latestSession.date;

  for (let i = 1; i < sortedSessions.length; i++) {
    const prevDate = sortedSessions[i].date;
    if (areConsecutiveDays(prevDate, currentDate)) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  const bestStreak = Math.max(streak, currentStreakData.bestStreak);

  return {
    currentStreak: streak,
    bestStreak,
    lastCompletedDate: latestSession.date,
  };
};

/**
 * Get difference in days between two date strings
 */
const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate total plank time from sessions
 */
export const calculateTotalPlankTime = (sessions: PlankSession[]): number => {
  return sessions
    .filter(s => s.completed)
    .reduce((total, session) => total + session.duration, 0);
};

/**
 * Get completed sessions count
 */
export const getCompletedSessionsCount = (sessions: PlankSession[]): number => {
  return sessions.filter(s => s.completed).length;
};

/**
 * Check if user has completed plank today
 */
export const hasCompletedToday = (sessions: PlankSession[]): boolean => {
  const today = getDateString();
  return sessions.some(s => s.date === today && s.completed);
};

/**
 * Get today's session if it exists
 */
export const getTodaysSession = (sessions: PlankSession[]): PlankSession | null => {
  const today = getDateString();
  return sessions.find(s => s.date === today) || null;
};
