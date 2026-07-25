// components/chat/NotificationSound.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export function NotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const showNotification = useSelector(
    (state: RootState) => state.chat.showNotification,
  );

  useEffect(() => {
    // ✅ অডিও ফাইল তৈরি (Web Audio API ব্যবহার করে)
    const createNotificationSound = () => {
      try {
        const audioContext = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();

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

        playTone(800, 0.1);
        setTimeout(() => playTone(1000, 0.1), 150);
      } catch (error) {
        console.log('⚠️ Audio not supported');
      }
    };

    if (showNotification) {
      createNotificationSound();
    }
  }, [showNotification]);

  // 🔄 ব্যাকগ্রাউন্ডে নোটিফিকেশন চেক
  useEffect(() => {
    if (!('Notification' in window)) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // পেজ হাইড থাকলে নোটিফিকেশন পারমিশন চেক
        if (Notification.permission === 'granted') {
          // ব্যাকগ্রাউন্ডে নোটিফিকেশন দেখানোর জন্য
          console.log('📱 App is in background');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // UI কিছু দেখাবে না
}
