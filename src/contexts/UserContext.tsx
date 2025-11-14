import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProgress, PlankSession, UserSettings } from '../types';
import { useAuth } from './AuthContext';
import {
  getUserProgress,
  saveUserProgress,
  getUserSessions,
  savePlankSession,
  getUserSettings,
  saveUserSettings,
  initializeUserData,
} from '../services/firestoreService';
import {
  saveUserProgress as saveLocalProgress,
  loadUserProgress as loadLocalProgress,
  saveSessions as saveLocalSessions,
  loadSessions as loadLocalSessions,
  saveSettings as saveLocalSettings,
  loadSettings as loadLocalSettings,
  addToOfflineQueue,
  getOfflineQueue,
  clearOfflineQueue,
} from '../utils/storageUtils';
import {
  calculateStreak,
  calculateTotalPlankTime,
  getCompletedSessionsCount,
} from '../utils/progressionUtils';

interface UserContextType {
  progress: UserProgress | null;
  sessions: PlankSession[];
  settings: UserSettings | null;
  loading: boolean;
  isOnline: boolean;
  updateProgress: (progress: Partial<UserProgress>) => Promise<void>;
  addSession: (session: PlankSession) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  refreshData: () => Promise<void>;
  syncOfflineData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

const DEFAULT_SETTINGS: UserSettings = {
  dailyIncrement: 3,
  reminderEnabled: false,
  reminderTime: '19:00',
  streakWarningEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  hasCompletedOnboarding: false,
  darkMode: false,
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [sessions, setSessions] = useState<PlankSession[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (settings?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.darkMode]);

  // Load user data
  useEffect(() => {
    console.log('UserContext: User changed', user ? user.uid : 'no user');

    if (user) {
      loadUserData();
    } else {
      console.log('UserContext: No user, clearing data');
      setProgress(null);
      setSessions([]);
      setSettings(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    console.log('UserContext: Loading user data for', user.uid, 'isGuest:', user.isGuest);
    setLoading(true);

    // Add timeout protection
    const timeoutId = setTimeout(() => {
      console.warn('UserContext: Loading timeout - forcing loading to false');
      setLoading(false);
    }, 5000);

    try {
      if (user.isGuest || !isOnline) {
        console.log('UserContext: Loading from local storage (guest or offline)');
        // Load from local storage for guest or offline
        const localProgress = loadLocalProgress();
        const localSessions = loadLocalSessions();
        const localSettings = loadLocalSettings();

        console.log('UserContext: Loaded local data', {
          hasProgress: !!localProgress,
          sessionsCount: localSessions.length,
          hasSettings: !!localSettings
        });

        setProgress(localProgress);
        setSessions(localSessions);
        setSettings(localSettings || DEFAULT_SETTINGS);
      } else {
        console.log('UserContext: Loading from Firestore');
        // Load from Firestore for authenticated users
        const [fetchedProgress, fetchedSessions, fetchedSettings] = await Promise.all([
          getUserProgress(user.uid),
          getUserSessions(user.uid),
          getUserSettings(user.uid),
        ]);

        console.log('UserContext: Loaded Firestore data', {
          hasProgress: !!fetchedProgress,
          sessionsCount: fetchedSessions.length,
          hasSettings: !!fetchedSettings
        });

        // If no data exists, initialize it
        if (!fetchedProgress || !fetchedSettings) {
          console.log('UserContext: No data found, initializing new user');
          await initializeUserData(user.uid);

          // Fetch again after initialization
          const [newProgress, newSessions, newSettings] = await Promise.all([
            getUserProgress(user.uid),
            getUserSessions(user.uid),
            getUserSettings(user.uid),
          ]);

          setProgress(newProgress);
          setSessions(newSessions);
          setSettings(newSettings || DEFAULT_SETTINGS);
        } else {
          setProgress(fetchedProgress);
          setSessions(fetchedSessions);
          setSettings(fetchedSettings || DEFAULT_SETTINGS);

          // Also save to local storage as backup
          if (fetchedProgress) saveLocalProgress(fetchedProgress);
          saveLocalSessions(fetchedSessions);
          if (fetchedSettings) saveLocalSettings(fetchedSettings);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to local storage
      const localProgress = loadLocalProgress();
      const localSessions = loadLocalSessions();
      const localSettings = loadLocalSettings();
      setProgress(localProgress);
      setSessions(localSessions);
      setSettings(localSettings || DEFAULT_SETTINGS);
    } finally {
      clearTimeout(timeoutId);
      console.log('UserContext: Setting loading to false');
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<UserProgress>) => {
    if (!user || !progress) return;

    const updatedProgress: UserProgress = {
      ...progress,
      ...updates,
      lastUpdated: new Date(),
    };

    setProgress(updatedProgress);
    saveLocalProgress(updatedProgress);

    if (!user.isGuest && isOnline) {
      try {
        await saveUserProgress(updatedProgress);
      } catch (error) {
        console.error('Error saving progress to Firestore:', error);
      }
    }
  };

  const addSession = async (session: PlankSession) => {
    if (!user) return;

    const updatedSessions = [session, ...sessions];
    setSessions(updatedSessions);
    saveLocalSessions(updatedSessions);

    // Update progress with new session
    if (progress) {
      const newStreak = calculateStreak(updatedSessions, progress.streakData);
      const totalPlankTime = calculateTotalPlankTime(updatedSessions);
      const totalSessions = getCompletedSessionsCount(updatedSessions);

      await updateProgress({
        streakData: newStreak,
        totalPlankTime,
        totalSessions,
      });
    }

    if (!user.isGuest && isOnline) {
      try {
        await savePlankSession(session);
      } catch (error) {
        console.error('Error saving session to Firestore:', error);
        addToOfflineQueue(session);
      }
    } else if (!user.isGuest && !isOnline) {
      // Add to offline queue for later sync
      addToOfflineQueue(session);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;

    const updatedSettings: UserSettings = {
      ...settings,
      ...updates,
    };

    setSettings(updatedSettings);
    saveLocalSettings(updatedSettings);

    if (!user.isGuest && isOnline) {
      try {
        await saveUserSettings(user.uid, updatedSettings);
      } catch (error) {
        console.error('Error saving settings to Firestore:', error);
      }
    }
  };

  const refreshData = async () => {
    await loadUserData();
  };

  const syncOfflineData = async () => {
    if (!user || user.isGuest || !isOnline) return;

    const offlineQueue = getOfflineQueue();
    if (offlineQueue.length === 0) return;

    try {
      // Sync offline sessions
      for (const session of offlineQueue) {
        await savePlankSession(session);
      }
      clearOfflineQueue();

      // Refresh data after sync
      await refreshData();
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  const value: UserContextType = {
    progress,
    sessions,
    settings,
    loading,
    isOnline,
    updateProgress,
    addSession,
    updateSettings,
    refreshData,
    syncOfflineData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
