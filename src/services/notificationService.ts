import type { NotificationPermission } from '../types';
import { parseTimeString } from '../utils/dateUtils';

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return { granted: false, prompt: false, denied: true };
  }

  if (Notification.permission === 'granted') {
    return { granted: true, prompt: false, denied: false };
  }

  if (Notification.permission === 'denied') {
    return { granted: false, prompt: false, denied: true };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      granted: permission === 'granted',
      prompt: permission === 'default',
      denied: permission === 'denied',
    };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { granted: false, prompt: false, denied: true };
  }
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return { granted: false, prompt: false, denied: true };
  }

  return {
    granted: Notification.permission === 'granted',
    prompt: Notification.permission === 'default',
    denied: Notification.permission === 'denied',
  };
};

/**
 * Show a notification
 */
export const showNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('Notifications not available or not permitted');
    return;
  }

  try {
    // Check if service worker is available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        ...options,
      });
    } else {
      // Fallback to regular notification
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        ...options,
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

/**
 * Schedule daily reminder notification
 */
export const scheduleDailyReminder = (timeString: string): void => {
  const { hours, minutes } = parseTimeString(timeString);
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const timeUntilNotification = scheduledTime.getTime() - now.getTime();

  // Clear any existing timeout
  if ((window as any).plankupReminderTimeout) {
    clearTimeout((window as any).plankupReminderTimeout);
  }

  // Set timeout for notification
  (window as any).plankupReminderTimeout = setTimeout(() => {
    showNotification('Time for your daily plank!', {
      body: "Don't forget to maintain your streak.",
      tag: 'daily-reminder',
      requireInteraction: false,
    });

    // Reschedule for next day
    scheduleDailyReminder(timeString);
  }, timeUntilNotification);
};

/**
 * Cancel daily reminder
 */
export const cancelDailyReminder = (): void => {
  if ((window as any).plankupReminderTimeout) {
    clearTimeout((window as any).plankupReminderTimeout);
    (window as any).plankupReminderTimeout = null;
  }
};

/**
 * Schedule streak warning notification
 */
export const scheduleStreakWarning = (): void => {
  const now = new Date();
  const warningTime = new Date();
  warningTime.setHours(22, 0, 0, 0); // 10 PM

  // If it's already past 10 PM, don't schedule
  if (now >= warningTime) {
    return;
  }

  const timeUntilWarning = warningTime.getTime() - now.getTime();

  // Clear any existing timeout
  if ((window as any).plankupStreakWarningTimeout) {
    clearTimeout((window as any).plankupStreakWarningTimeout);
  }

  // Set timeout for warning notification
  (window as any).plankupStreakWarningTimeout = setTimeout(() => {
    showNotification("Don't lose your streak!", {
      body: "You haven't done your plank today. Complete it before midnight!",
      tag: 'streak-warning',
      requireInteraction: true,
    });
  }, timeUntilWarning);
};

/**
 * Cancel streak warning
 */
export const cancelStreakWarning = (): void => {
  if ((window as any).plankupStreakWarningTimeout) {
    clearTimeout((window as any).plankupStreakWarningTimeout);
    (window as any).plankupStreakWarningTimeout = null;
  }
};

/**
 * Check if notifications are supported
 */
export const areNotificationsSupported = (): boolean => {
  return 'Notification' in window;
};

/**
 * Trigger vibration (if supported)
 */
export const triggerVibration = (pattern: number | number[] = 200): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

/**
 * Play sound
 */
export const playSound = (soundType: 'countdown' | 'complete' | 'button'): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (soundType) {
      case 'countdown':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'complete':
        // Success sound (ascending tones)
        oscillator.frequency.value = 523.25; // C5
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);

        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.frequency.value = 659.25; // E5
          gain2.gain.value = 0.3;
          osc2.start();
          osc2.stop(audioContext.currentTime + 0.2);
        }, 100);
        break;
      case 'button':
        oscillator.frequency.value = 1000;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
    }
  } catch (error) {
    console.warn('Error playing sound:', error);
  }
};
