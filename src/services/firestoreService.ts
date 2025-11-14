import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProgress, PlankSession, UserSettings } from '../types';

const COLLECTIONS = {
  USERS: 'users',
  SESSIONS: 'sessions',
  SETTINGS: 'settings',
} as const;

/**
 * Get user progress
 */
export const getUserProgress = async (userId: string): Promise<UserProgress | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      } as UserProgress;
    }
    return null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
};

/**
 * Save user progress
 */
export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, progress.userId);
    await setDoc(docRef, {
      ...progress,
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
};

/**
 * Get user sessions
 */
export const getUserSessions = async (userId: string): Promise<PlankSession[]> => {
  try {
    const sessionsRef = collection(db, COLLECTIONS.SESSIONS);
    const q = query(
      sessionsRef,
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    // Sort locally instead of using orderBy to avoid index requirement
    const sessions = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as PlankSession;
    });

    // Sort by date descending
    return sessions.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error getting user sessions:', error);
    throw error;
  }
};

/**
 * Save plank session
 */
export const savePlankSession = async (session: PlankSession): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.SESSIONS, session.id);
    await setDoc(docRef, {
      ...session,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving plank session:', error);
    throw error;
  }
};

/**
 * Save multiple sessions (for offline sync)
 */
export const saveMultipleSessions = async (sessions: PlankSession[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    sessions.forEach((session) => {
      const docRef = doc(db, COLLECTIONS.SESSIONS, session.id);
      batch.set(docRef, {
        ...session,
        timestamp: Timestamp.now(),
      });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error saving multiple sessions:', error);
    throw error;
  }
};

/**
 * Get user settings
 */
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};

/**
 * Save user settings
 */
export const saveUserSettings = async (
  userId: string,
  settings: UserSettings
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, userId);
    await setDoc(docRef, settings);
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

/**
 * Initialize user data (first time setup)
 */
export const initializeUserData = async (userId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // Initialize progress
    const progressRef = doc(db, COLLECTIONS.USERS, userId);
    const initialProgress: UserProgress = {
      userId,
      baselineData: {
        isComplete: false,
        sessions: [],
        averageTime: 0,
      },
      streakData: {
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
      },
      currentTargetDuration: 30,
      totalSessions: 0,
      totalPlankTime: 0,
      lastUpdated: new Date(),
    };
    batch.set(progressRef, {
      ...initialProgress,
      lastUpdated: Timestamp.now(),
    });

    // Initialize settings
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
    const initialSettings: UserSettings = {
      dailyIncrement: 3,
      reminderEnabled: false,
      reminderTime: '19:00',
      streakWarningEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      hasCompletedOnboarding: false,
      darkMode: false,
    };
    batch.set(settingsRef, initialSettings);

    await batch.commit();
  } catch (error) {
    console.error('Error initializing user data:', error);
    throw error;
  }
};

/**
 * Delete all user data
 */
export const deleteUserData = async (userId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // Delete progress
    const progressRef = doc(db, COLLECTIONS.USERS, userId);
    batch.delete(progressRef);

    // Delete settings
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
    batch.delete(settingsRef);

    // Delete all sessions
    const sessionsRef = collection(db, COLLECTIONS.SESSIONS);
    const q = query(sessionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};
