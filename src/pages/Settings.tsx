import React, { useState } from 'react';
import {
  FaBell,
  FaVolumeUp,
  FaCog,
  FaSignOutAlt,
  FaTrash,
  FaInfoCircle,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Onboarding } from '../components/Onboarding';
import { useNavigate } from 'react-router-dom';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../services/notificationService';

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { settings, updateSettings, updateProgress, progress } = useUser();
  const navigate = useNavigate();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (!user || !settings || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleResetProgram = async () => {
    try {
      // Reset progress to initial state
      await updateProgress({
        baselineData: {
          isComplete: false,
          sessions: [],
          averageTime: 0,
        },
        streakData: {
          currentStreak: 0,
          bestStreak: progress.streakData.bestStreak,
          lastCompletedDate: null,
        },
        currentTargetDuration: 30,
        totalSessions: 0,
        totalPlankTime: 0,
      });

      setShowResetConfirm(false);
      alert('Program reset successfully! Start with a new baseline.');
    } catch (error) {
      console.error('Error resetting program:', error);
      alert('Failed to reset program. Please try again.');
    }
  };

  const handleToggleReminder = async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestNotificationPermission();

      if (permission.granted) {
        await updateSettings({ reminderEnabled: true });
        scheduleDailyReminder(settings.reminderTime);
      } else {
        alert(
          'Please enable notifications in your browser settings to use reminders.'
        );
      }
    } else {
      await updateSettings({ reminderEnabled: false });
      cancelDailyReminder();
    }
  };

  const handleReminderTimeChange = async (time: string) => {
    await updateSettings({ reminderTime: time });
    if (settings.reminderEnabled) {
      cancelDailyReminder();
      scheduleDailyReminder(time);
    }
  };

  return (
    <>
      <Onboarding
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        canSkip={true}
      />

      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset Program?"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            This will reset your baseline and progression, but keep your best
            streak. All session history will remain intact. Are you sure you want
            to continue?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleResetProgram}>
              Reset Program
            </Button>
          </div>
        </div>
      </Modal>

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 mb-2">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Customize your PlankUP experience</p>
          </div>

          {/* User Info */}
          <Card variant="elevated" className="mb-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                {user.photoURL ? (
                  <>
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-700"
                      referrerPolicy="no-referrer"
                      loading="eager"
                    />
                    <div className="hidden w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg absolute inset-0">
                      {user.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {user.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {user.displayName || 'User'}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {user.isGuest ? 'Guest Account' : user.email}
                </div>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card variant="bordered" className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FaBell className="text-2xl text-primary-500 dark:text-primary-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Daily Reminder
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Get reminded to do your daily plank
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminderEnabled}
                    onChange={(e) => handleToggleReminder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></div>
                </label>
              </div>

              {settings.reminderEnabled && (
                <div className="pl-4 border-l-2 border-primary-200 dark:border-primary-800">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => handleReminderTimeChange(e.target.value)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Streak Warning
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Alert if you haven't planked today
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.streakWarningEnabled}
                    onChange={(e) =>
                      updateSettings({ streakWarningEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* Sound & Haptics */}
          <Card variant="bordered" className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FaVolumeUp className="text-2xl text-primary-500 dark:text-primary-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Sound & Haptics
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Sound Effects</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Play sounds for countdown and completion
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) =>
                      updateSettings({ soundEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Vibration</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Vibrate on countdown and completion
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.vibrationEnabled}
                    onChange={(e) =>
                      updateSettings({ vibrationEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card variant="bordered" className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCog className="text-2xl text-primary-500 dark:text-primary-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Appearance</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Dark Mode</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Switch to dark theme
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) =>
                      updateSettings({ darkMode: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* Progression Settings */}
          <Card variant="bordered" className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCog className="text-2xl text-primary-500 dark:text-primary-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Progression</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Daily Increment (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.dailyIncrement}
                  onChange={(e) =>
                    updateSettings({ dailyIncrement: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  How many seconds to add to your target each day
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card variant="bordered" className="mb-6">
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowOnboarding(true)}
              >
                <FaInfoCircle className="mr-2" />
                View Onboarding Again
              </Button>

              <Button
                variant="danger"
                fullWidth
                onClick={() => setShowResetConfirm(true)}
              >
                <FaTrash className="mr-2" />
                Reset Program
              </Button>

              <Button variant="outline" fullWidth onClick={handleSignOut}>
                <FaSignOutAlt className="mr-2" />
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
