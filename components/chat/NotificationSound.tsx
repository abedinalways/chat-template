// components/chat/NotificationSound.tsx
// Component that plays a sound when new notifications arrive.
// Uses Web Audio API to generate notification sounds without external files.

'use client';

import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

/**
 * Play a notification sound using Web Audio API.
 * Creates a two-tone "ding-dong" sound.
 */
function playNotificationSound(): void {
  if (typeof window === 'undefined') return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();

    const playTone = (frequency: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration,
      );

      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    };

    // Play two-tone notification sound
    playTone(800, 0.1);
    setTimeout(() => playTone(1000, 0.1), 150);

    // Clean up audio context after playback
    setTimeout(() => audioContext.close().catch(() => {}), 500);
  } catch (error) {
    console.warn('[NotificationSound] Audio not supported:', error);
  }
}

export function NotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notifications = useSelector((state: RootState) => state.chat.notifications);

  // Play sound when a new notification arrives
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      // Only play sound for unread notifications
      if (!latestNotification.isRead) {
        playNotificationSound();
      }
    }
  }, [notifications.length]); // Trigger when notification count changes

  // Monitor page visibility for background notifications
  useEffect(() => {
    if (!('Notification' in window)) return;

    const handleVisibilityChange = () => {
      if (document.hidden && Notification.permission === 'granted') {
        console.log('[NotificationSound] App is in background');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // This component doesn't render any UI
}
