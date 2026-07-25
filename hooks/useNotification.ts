// hooks/useNotification.ts
// React hook for managing notifications (in-app + browser + sound).
//
// - Requests browser notification permission on mount.
// - Provides `sendNotification` to dispatch an in-app notification,
//   play a sound, and send a browser notification (if permitted).
// - Memoized so the returned functions are stable across renders.

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/redux/api/chat/chatSlice';
import {
  requestNotificationPermission,
  sendBrowserNotification,
  playNotificationSound,
} from '@/lib/notification';
import type { Notification } from '@/types/chat';

export function useNotification() {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const dispatch = useDispatch();
  // Track whether permission has been requested to avoid repeated prompts
  const permissionRequestedRef = useRef(false);

  useEffect(() => {
    if (permissionRequestedRef.current) return;
    permissionRequestedRef.current = true;

    const checkPermission = async () => {
      const granted = await requestNotificationPermission();
      setIsPermissionGranted(granted);
    };
    checkPermission();
  }, []);

  // Memoized so callers don't get a new function reference on every render
  const sendNotification = useCallback(
    (notification: Notification) => {
      // 🔊 Play sound
      playNotificationSound();

      // 📝 Dispatch in-app notification to Redux
      dispatch(addNotification(notification));

      // 🔔 Send browser notification if permitted and tab is hidden
      if (isPermissionGranted && typeof document !== 'undefined' && document.hidden) {
        sendBrowserNotification({
          title: notification.title,
          body: notification.body,
          onClick: () => {
            if (notification.conversationId) {
              window.location.href = `/messages/${notification.conversationId}`;
            }
          },
        });
      }
    },
    [dispatch, isPermissionGranted],
  );

  return {
    sendNotification,
    isPermissionGranted,
  };
}
