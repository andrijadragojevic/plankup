import React, { useMemo } from 'react';
import { FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/Card';
import { formatDuration } from '../utils/dateUtils';
import { format, parseISO } from 'date-fns';

export const History: React.FC = () => {
  const { sessions, progress } = useUser();

  const sortedSessions = useMemo(() => {
    return [...sessions]
      .filter((s) => s.completed)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions]);

  const sessionsByMonth = useMemo(() => {
    const grouped: { [key: string]: typeof sortedSessions } = {};

    sortedSessions.forEach((session) => {
      const date = parseISO(session.date);
      const monthKey = format(date, 'MMMM yyyy');

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(session);
    });

    return grouped;
  }, [sortedSessions]);

  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading history...</p>
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
            History
          </h1>
          <p className="text-slate-600 dark:text-slate-400">View your plank journey</p>
        </div>

        {/* Summary Stats */}
        <Card variant="elevated" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {sortedSessions.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-600 dark:text-accent-400 mb-2">
                {formatDuration(progress.totalPlankTime)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {sortedSessions.length > 0
                  ? formatDuration(
                      Math.round(
                        sortedSessions.reduce((sum, s) => sum + s.duration, 0) /
                          sortedSessions.length
                      )
                    )
                  : '0s'}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Average Time</div>
            </div>
          </div>
        </Card>

        {/* Sessions List */}
        {sortedSessions.length === 0 ? (
          <Card variant="bordered" className="text-center py-12">
            <FaCalendarAlt className="text-6xl text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No sessions yet
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              Complete your first plank to start tracking your progress!
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(sessionsByMonth).map(([month, monthSessions]) => (
              <div key={month}>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <FaCalendarAlt className="text-primary-500 dark:text-primary-400" />
                  {month}
                </h2>
                <div className="space-y-3">
                  {monthSessions.map((session) => {
                    const date = parseISO(session.date);
                    const dayName = format(date, 'EEEE');
                    const dayDate = format(date, 'MMM d');
                    const metTarget = session.duration >= session.targetDuration;

                    return (
                      <Card
                        key={session.id}
                        variant="bordered"
                        className="hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-xl ${
                                session.type === 'baseline'
                                  ? 'bg-accent-100 dark:bg-accent-900/30'
                                  : 'bg-primary-100 dark:bg-primary-900/30'
                              }`}
                            >
                              <FaClock
                                className={`text-2xl ${
                                  session.type === 'baseline'
                                    ? 'text-accent-600 dark:text-accent-400'
                                    : 'text-primary-600 dark:text-primary-400'
                                }`}
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {dayName}, {dayDate}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {session.type === 'baseline' ? (
                                  <span className="px-2 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 rounded-full text-xs font-medium">
                                    Baseline
                                  </span>
                                ) : (
                                  <span>
                                    Target: {formatDuration(session.targetDuration)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                              {formatDuration(session.duration)}
                            </div>
                            {session.type === 'progression' && (
                              <div className="flex items-center justify-end gap-1">
                                {metTarget ? (
                                  <>
                                    <FaCheckCircle className="text-green-500 dark:text-green-400" />
                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                      Target Met
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                    {formatDuration(
                                      session.targetDuration - session.duration
                                    )}{' '}
                                    short
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
