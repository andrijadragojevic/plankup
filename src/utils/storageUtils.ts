import type { PlankSession, UserProgress, UserSettings } from '../types';

const STORAGE_KEYS = {
  USER_PROGRESS: 'plankup_user_progress',
  SESSIONS: 'plankup_sessions',
  SETTINGS: 'plankup_settings',
  OFFLINE_QUEUE: 'plankup_offline_queue',
  GUEST_DATA: 'plankup_guest_data',
} as const;

/**
 * Save data to localStorage with error handling
 */
const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

/**
 * Load data from localStorage with error handling
 */
const loadFromStorage = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return null;
  }
};

/**
 * Remove data from localStorage
 */
const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

// User Progress
export const saveUserProgress = (progress: UserProgress): void => {
  saveToStorage(STORAGE_KEYS.USER_PROGRESS, progress);
};

export const loadUserProgress = (): UserProgress | null => {
  return loadFromStorage<UserProgress>(STORAGE_KEYS.USER_PROGRESS);
};

// Sessions
export const saveSessions = (sessions: PlankSession[]): void => {
  saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
};

export const loadSessions = (): PlankSession[] => {
  return loadFromStorage<PlankSession[]>(STORAGE_KEYS.SESSIONS) || [];
};

// Settings
export const saveSettings = (settings: UserSettings): void => {
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
};

export const loadSettings = (): UserSettings | null => {
  return loadFromStorage<UserSettings>(STORAGE_KEYS.SETTINGS);
};

// Offline Queue (for syncing when back online)
export const addToOfflineQueue = (session: PlankSession): void => {
  const queue = loadFromStorage<PlankSession[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
  queue.push(session);
  saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, queue);
};

export const getOfflineQueue = (): PlankSession[] => {
  return loadFromStorage<PlankSession[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
};

export const clearOfflineQueue = (): void => {
  removeFromStorage(STORAGE_KEYS.OFFLINE_QUEUE);
};

// Guest Data
export const saveGuestData = (data: {
  progress: UserProgress;
  sessions: PlankSession[];
  settings: UserSettings;
}): void => {
  saveToStorage(STORAGE_KEYS.GUEST_DATA, data);
};

export const loadGuestData = (): {
  progress: UserProgress;
  sessions: PlankSession[];
  settings: UserSettings;
} | null => {
  return loadFromStorage(STORAGE_KEYS.GUEST_DATA);
};

export const clearGuestData = (): void => {
  removeFromStorage(STORAGE_KEYS.GUEST_DATA);
};

/**
 * Clear all app data from localStorage
 */
export const clearAllStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
};

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};
