import React, { useCallback } from 'react';
import { FaPause, FaPlay, FaStop } from 'react-icons/fa';
import { useTimer } from '../hooks/useTimer';
import { CountdownOverlay } from './CountdownOverlay';
import { Button } from './Button';
import { formatTime } from '../utils/dateUtils';

interface PlankTimerProps {
  targetDuration: number; // seconds
  mode: 'baseline' | 'progression';
  onComplete: (duration: number) => void;
  onAbort: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export const PlankTimer: React.FC<PlankTimerProps> = ({
  targetDuration,
  mode,
  onComplete,
  onAbort,
  soundEnabled = true,
  vibrationEnabled = true,
}) => {
  const timerMode = mode === 'baseline' ? 'stopwatch' : 'countdown';

  const handleComplete = useCallback(() => {
    if (mode === 'baseline') {
      onComplete(timeRemaining);
    } else {
      onComplete(targetDuration);
    }
  }, [mode, targetDuration, onComplete]);

  const {
    timeRemaining,
    timerState,
    countdownNumber,
    startCountdown,
    pause,
    resume,
    stop,
  } = useTimer({
    initialTime: targetDuration,
    mode: timerMode,
    onComplete: handleComplete,
    soundEnabled,
    vibrationEnabled,
  });

  const handleStop = () => {
    stop();
    if (mode === 'baseline') {
      // For baseline, we want to record the time even if stopped early
      onComplete(timeRemaining);
    } else {
      onAbort();
    }
  };

  const displayTime = mode === 'baseline' ? timeRemaining : timeRemaining;
  const progress = mode === 'progression' ? ((targetDuration - timeRemaining) / targetDuration) * 100 : 0;

  return (
    <>
      <CountdownOverlay number={countdownNumber} />

      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        {/* Timer Display */}
        <div className="relative mb-12">
          {/* Progress Ring for Countdown Mode */}
          {mode === 'progression' && timerState !== 'idle' && (
            <svg className="absolute inset-0 -rotate-90" width="320" height="320">
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="#e2e8f0"
                className="dark:stroke-slate-700"
                strokeWidth="20"
                fill="none"
              />
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="url(#gradient)"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 140}`}
                strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {/* Time Display */}
          <div className="flex items-center justify-center w-80 h-80">
            <div className="text-center">
              <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-accent-600 mb-4">
                {formatTime(displayTime)}
              </div>
              <div className="text-xl font-semibold text-slate-600 dark:text-slate-400">
                {mode === 'baseline' ? 'Hold your plank!' : `Target: ${formatTime(targetDuration)}`}
              </div>
              {mode === 'baseline' && (
                <div className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  Stopwatch Mode
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          {timerState === 'idle' && (
            <Button
              variant="primary"
              size="lg"
              onClick={startCountdown}
              aria-label="Start plank timer"
            >
              Start Plank
            </Button>
          )}

          {timerState === 'running' && (
            <>
              <Button
                variant="secondary"
                size="lg"
                onClick={pause}
                aria-label="Pause timer"
              >
                <FaPause className="mr-2" />
                Pause
              </Button>
              <Button
                variant="danger"
                size="lg"
                onClick={handleStop}
                aria-label="Stop plank"
              >
                <FaStop className="mr-2" />
                {mode === 'baseline' ? 'Stop' : 'Give Up'}
              </Button>
            </>
          )}

          {timerState === 'paused' && (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={resume}
                aria-label="Resume timer"
              >
                <FaPlay className="mr-2" />
                Resume
              </Button>
              <Button
                variant="danger"
                size="lg"
                onClick={handleStop}
                aria-label="Stop plank"
              >
                <FaStop className="mr-2" />
                {mode === 'baseline' ? 'Stop' : 'Give Up'}
              </Button>
            </>
          )}
        </div>

        {/* State Indicator */}
        {timerState === 'paused' && (
          <div className="mt-8 px-6 py-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full font-semibold">
            Timer Paused
          </div>
        )}
      </div>
    </>
  );
};
