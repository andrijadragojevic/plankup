import React, { useState, useEffect } from 'react';
import { FaFire, FaTrophy, FaCalendarCheck } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PlankTimer } from '../components/PlankTimer';
import { CompletionModal } from '../components/CompletionModal';
import { Onboarding } from '../components/Onboarding';
import type { PlankSession } from '../types';
import {
  isBaselineComplete,
  calculateBaselineAverage,
  calculateNextTarget,
  hasCompletedToday,
} from '../utils/progressionUtils';
import { formatDuration, getDateString } from '../utils/dateUtils';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { progress, sessions, settings, addSession, updateProgress, updateSettings } =
    useUser();

  const [isPlankActive, setIsPlankActive] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedDuration, setCompletedDuration] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (settings && !settings.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [settings]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await updateSettings({ hasCompletedOnboarding: true });
  };

  if (!user || !progress || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your data...</p>
        </div>
      </div>
    );
  }

  const baselineComplete = isBaselineComplete(progress.baselineData);
  const completedToday = hasCompletedToday(sessions);
  const currentStreak = progress.streakData.currentStreak;
  const bestStreak = progress.streakData.bestStreak;

  const mode: 'baseline' | 'progression' = baselineComplete ? 'progression' : 'baseline';
  const baselineSessionsLeft = 3 - progress.baselineData.sessions.length;

  const handlePlankComplete = async (duration: number) => {
    setIsPlankActive(false);
    setCompletedDuration(duration);

    const sessionId = `${user.uid}_${Date.now()}`;
    const today = getDateString();

    const session: PlankSession = {
      id: sessionId,
      userId: user.uid,
      date: today,
      duration,
      targetDuration: progress.currentTargetDuration,
      type: mode,
      completed: true,
      timestamp: new Date(),
    };

    await addSession(session);

    // Update progress based on mode
    if (mode === 'baseline') {
      const newBaselineSessions = [...progress.baselineData.sessions, duration];

      if (newBaselineSessions.length === 3) {
        // Baseline complete - calculate average and set initial target
        const average = calculateBaselineAverage(newBaselineSessions);
        await updateProgress({
          baselineData: {
            isComplete: true,
            sessions: newBaselineSessions,
            averageTime: average,
          },
          currentTargetDuration: average,
        });
      } else {
        // Still in baseline
        await updateProgress({
          baselineData: {
            ...progress.baselineData,
            sessions: newBaselineSessions,
          },
        });
      }
    } else {
      // Progression mode - increase target for tomorrow
      const nextTarget = calculateNextTarget(
        progress.currentTargetDuration,
        settings.dailyIncrement
      );
      await updateProgress({
        currentTargetDuration: nextTarget,
      });
    }

    setShowCompletion(true);
  };

  const handlePlankAbort = () => {
    setIsPlankActive(false);
  };

  const handleStartPlank = () => {
    if (completedToday) {
      // Could show a modal asking if they want to do another session
      const confirm = window.confirm(
        "You've already completed today's plank. Do another session anyway?"
      );
      if (!confirm) return;
    }
    setIsPlankActive(true);
  };

  return (
    <>
      <Onboarding
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        canSkip={true}
      />

      <CompletionModal
        isOpen={showCompletion}
        onClose={() => setShowCompletion(false)}
        duration={completedDuration}
        streak={currentStreak}
      />

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 mb-2">
              {mode === 'baseline' ? 'Baseline Assessment' : 'Daily Plank'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {mode === 'baseline'
                ? `Complete ${baselineSessionsLeft} more baseline session${
                    baselineSessionsLeft !== 1 ? 's' : ''
                  } to start your progression`
                : completedToday
                ? "Great job! You've completed today's plank."
                : "Ready for today's challenge?"}
            </p>
          </div>

          {!isPlankActive ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card variant="elevated">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                      <FaFire className="text-2xl text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {currentStreak}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Day Streak</div>
                    </div>
                  </div>
                </Card>

                <Card variant="elevated">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl">
                      <FaTrophy className="text-2xl text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {bestStreak}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Best Streak</div>
                    </div>
                  </div>
                </Card>

                <Card variant="elevated">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl">
                      <FaCalendarCheck className="text-2xl text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {progress.totalSessions}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Sessions</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Main Action Card */}
              <Card variant="elevated" className="text-center p-12">
                <div className="mb-6">
                  {mode === 'baseline' ? (
                    <>
                      <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 mb-4">
                        Baseline {4 - baselineSessionsLeft}/3
                      </div>
                      <p className="text-lg text-slate-600 dark:text-slate-400">
                        Hold your plank as long as you can. We'll use this to set
                        your starting target.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 mb-4">
                        {formatDuration(progress.currentTargetDuration)}
                      </div>
                      <p className="text-lg text-slate-600 dark:text-slate-400">Today's Target</p>
                      {!completedToday && (
                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                          Tomorrow's target will be{' '}
                          {formatDuration(
                            progress.currentTargetDuration + settings.dailyIncrement
                          )}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartPlank}
                  aria-label="Start plank session"
                  className="text-xl px-12 py-6"
                >
                  {completedToday ? 'Do Another Plank' : 'Start Plank'}
                </Button>

                {completedToday && (
                  <div className="mt-4 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full inline-block text-sm font-semibold">
                    Completed for today!
                  </div>
                )}
              </Card>
            </>
          ) : (
            <PlankTimer
              targetDuration={progress.currentTargetDuration}
              mode={mode}
              onComplete={handlePlankComplete}
              onAbort={handlePlankAbort}
              soundEnabled={settings.soundEnabled}
              vibrationEnabled={settings.vibrationEnabled}
            />
          )}
        </div>
      </div>
    </>
  );
};
