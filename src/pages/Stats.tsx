import React, { useMemo } from 'react';
import { FaChartLine, FaTrophy, FaFire, FaClock } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/Card';
import { formatDuration } from '../utils/dateUtils';
import { parseISO, subDays, format } from 'date-fns';

export const Stats: React.FC = () => {
  const { sessions, progress } = useUser();

  const completedSessions = useMemo(() => {
    return sessions.filter((s) => s.completed);
  }, [sessions]);

  const last7DaysSessions = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    return completedSessions.filter((s) => {
      const sessionDate = parseISO(s.date);
      return sessionDate >= sevenDaysAgo;
    });
  }, [completedSessions]);

  const last30DaysSessions = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    return completedSessions.filter((s) => {
      const sessionDate = parseISO(s.date);
      return sessionDate >= thirtyDaysAgo;
    });
  }, [completedSessions]);

  const averageTime = useMemo(() => {
    if (completedSessions.length === 0) return 0;
    const total = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    return Math.round(total / completedSessions.length);
  }, [completedSessions]);

  const longestPlank = useMemo(() => {
    if (completedSessions.length === 0) return 0;
    return Math.max(...completedSessions.map((s) => s.duration));
  }, [completedSessions]);

  const last7DaysAverage = useMemo(() => {
    if (last7DaysSessions.length === 0) return 0;
    const total = last7DaysSessions.reduce((sum, s) => sum + s.duration, 0);
    return Math.round(total / last7DaysSessions.length);
  }, [last7DaysSessions]);

  const completionRate = useMemo(() => {
    if (last30DaysSessions.length === 0) return 0;
    return Math.round((last30DaysSessions.length / 30) * 100);
  }, [last30DaysSessions]);

  // Simple bar chart data for last 7 days
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateString = format(date, 'yyyy-MM-dd');
      const session = completedSessions.find((s) => s.date === dateString);
      days.push({
        date: format(date, 'EEE'),
        duration: session?.duration || 0,
        hasSession: !!session,
      });
    }
    return days;
  }, [completedSessions]);

  const maxDuration = Math.max(...chartData.map((d) => d.duration), 60);

  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 mb-2">
            Statistics
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Track your progress and improvements</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card variant="elevated">
            <div className="text-center">
              <FaChartLine className="text-3xl text-primary-500 dark:text-primary-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formatDuration(averageTime)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Average Duration
              </div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="text-center">
              <FaTrophy className="text-3xl text-accent-500 dark:text-accent-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formatDuration(longestPlank)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Longest Plank</div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="text-center">
              <FaFire className="text-3xl text-orange-500 dark:text-orange-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {progress.streakData.bestStreak}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Best Streak</div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="text-center">
              <FaClock className="text-3xl text-primary-500 dark:text-primary-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formatDuration(progress.totalPlankTime)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Time</div>
            </div>
          </Card>
        </div>

        {/* Last 7 Days Chart */}
        <Card variant="elevated" className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Last 7 Days
          </h2>
          <div className="flex items-end justify-between gap-2 h-48 mb-4">
            {chartData.map((day, index) => {
              const heightPercent = (day.duration / maxDuration) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex-1 flex items-end justify-center">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        day.hasSession
                          ? 'bg-gradient-to-t from-primary-500 to-accent-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      title={
                        day.hasSession
                          ? `${formatDuration(day.duration)}`
                          : 'No session'
                      }
                    ></div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                    {day.date}
                  </div>
                  {day.hasSession && (
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {formatDuration(day.duration)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Recent Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Last 7 Days Average</span>
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {formatDuration(last7DaysAverage)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Sessions This Week</span>
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {last7DaysSessions.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Current Target</span>
                <span className="text-xl font-bold text-accent-600 dark:text-accent-400">
                  {formatDuration(progress.currentTargetDuration)}
                </span>
              </div>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Overall Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total Sessions</span>
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {completedSessions.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">30-Day Completion</span>
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {completionRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Baseline Average</span>
                <span className="text-xl font-bold text-accent-600 dark:text-accent-400">
                  {progress.baselineData.isComplete
                    ? formatDuration(progress.baselineData.averageTime)
                    : 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
