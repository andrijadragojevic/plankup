import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerState } from '../types';
import { playSound, triggerVibration } from '../services/notificationService';

interface UseTimerProps {
  initialTime: number; // seconds
  mode: 'countdown' | 'stopwatch';
  onComplete?: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

interface UseTimerReturn {
  timeRemaining: number;
  timerState: TimerState;
  countdownNumber: number | null;
  startCountdown: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

export const useTimer = ({
  initialTime,
  mode,
  onComplete,
  soundEnabled = true,
  vibrationEnabled = true,
}: UseTimerProps): UseTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startCountdown = useCallback(() => {
    setTimerState('countdown');
    setCountdownNumber(3);

    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNumber(count);
        if (soundEnabled) playSound('countdown');
        if (vibrationEnabled) triggerVibration(100);
      } else {
        setCountdownNumber(null);
        clearInterval(countdownInterval);
        startTimer();
      }
    }, 1000);
  }, [soundEnabled, vibrationEnabled]);

  const startTimer = () => {
    setTimerState('running');
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;

    if (mode === 'countdown') {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = initialTime - elapsed;

        if (remaining <= 0) {
          setTimeRemaining(0);
          clearTimer();
          setTimerState('completed');
          if (soundEnabled) playSound('complete');
          if (vibrationEnabled) triggerVibration([200, 100, 200]);
          onComplete?.();
        } else {
          setTimeRemaining(remaining);
        }
      }, 100);
    } else {
      // Stopwatch mode
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimeRemaining(elapsed);
      }, 100);
    }
  };

  const pause = useCallback(() => {
    if (timerState !== 'running') return;

    clearTimer();
    pausedTimeRef.current = Date.now();
    setTimerState('paused');
  }, [timerState]);

  const resume = useCallback(() => {
    if (timerState !== 'paused') return;

    setTimerState('running');
    const pausedDuration = Date.now() - pausedTimeRef.current;
    startTimeRef.current += pausedDuration;

    if (mode === 'countdown') {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = initialTime - elapsed;

        if (remaining <= 0) {
          setTimeRemaining(0);
          clearTimer();
          setTimerState('completed');
          if (soundEnabled) playSound('complete');
          if (vibrationEnabled) triggerVibration([200, 100, 200]);
          onComplete?.();
        } else {
          setTimeRemaining(remaining);
        }
      }, 100);
    } else {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimeRemaining(elapsed);
      }, 100);
    }
  }, [timerState, mode, initialTime, onComplete, soundEnabled, vibrationEnabled]);

  const stop = useCallback(() => {
    clearTimer();
    setTimerState('idle');
    // Don't reset time so we can see the final value
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setTimeRemaining(initialTime);
    setTimerState('idle');
    setCountdownNumber(null);
  }, [initialTime]);

  return {
    timeRemaining,
    timerState,
    countdownNumber,
    startCountdown,
    pause,
    resume,
    stop,
    reset,
  };
};
