import { format, startOfDay, isToday, parseISO } from 'date-fns';

/**
 * Get date in YYYY-MM-DD format
 */
export const getDateString = (date: Date = new Date()): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Check if a date string is today
 */
export const isDateToday = (dateString: string): boolean => {
  try {
    return isToday(parseISO(dateString));
  } catch {
    return false;
  }
};

/**
 * Get start of day for a given date
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  return startOfDay(date);
};

/**
 * Format seconds to MM:SS
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format seconds to a readable string (e.g., "1m 30s" or "45s")
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

/**
 * Parse time string (HH:mm) to hours and minutes
 */
export const parseTimeString = (timeString: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours: hours || 0, minutes: minutes || 0 };
};

/**
 * Check if two dates are consecutive days
 */
export const areConsecutiveDays = (date1: string, date2: string): boolean => {
  const d1 = parseISO(date1);
  const d2 = parseISO(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};
