// lib/notification.ts
// Browser notification utilities (Web Notifications API + Web Audio API).
// All functions are SSR-safe — they check for `window` before accessing
// browser-only APIs.

/** Extended NotificationOptions that includes the `vibrate` field. */
interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

/**
 * Request permission for browser notifications.
 * Returns true if permission is granted, false otherwise.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) {
    console.warn('[notification] This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('[notification] Permission denied');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}

/**
 * Send a browser notification (requires permission).
 * The notification auto-closes after 10 seconds.
 */
export function sendBrowserNotification({
  title,
  body,
  icon,
  tag,
  onClick,
}: BrowserNotificationOptions): void {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const options: ExtendedNotificationOptions = {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      tag: tag || `message-${Date.now()}`,
    };

    const notification = new Notification(title, options);

    notification.onclick = () => {
      window.focus();
      notification.close();
      onClick?.();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  } catch (error) {
    console.error('[notification] Failed to send notification:', error);
  }
}

/**
 * Play a short "ding-dong" notification sound using the Web Audio API.
 * Creates a single AudioContext per call and cleans up after playback.
 */
export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioCtor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const audioContext = new AudioCtor();

    const playTone = (frequency: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    };

    playTone(800, 0.1);
    setTimeout(() => playTone(1000, 0.1), 150);

    // Close the audio context after playback to free resources
    setTimeout(() => audioContext.close().catch(() => {}), 500);
  } catch (error) {
    console.warn('[notification] Audio not supported:', error);
  }
}
