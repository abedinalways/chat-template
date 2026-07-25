// hooks/useChatSocket.ts
// React hook that manages the Socket.io connection and wires real-time
// events into Redux (RTK Query cache + chat slice).
//
// Key design decisions:
// - Uses the SocketService singleton (lib/socket.ts) so there is only
//   ONE socket connection per app, even if multiple components call this hook.
// - Subscribes to connection state changes via React state.
// - Cleans up all event listeners on unmount.
// - Emits userId alongside every socket event so the server can identify
//   the sender.

import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SocketService } from '@/lib/socket';
import { chatApi } from '@/redux/api/chat/chatApi';
import { incrementUnread, addNotification } from '@/redux/api/chat/chatSlice';
import { useNotification } from './useNotification';
import type { AppDispatch } from '@/redux/store';
import type { Message, Notification as ChatNotification } from '@/types/chat';

/** Safely read the current user's ID from localStorage (SSR-safe). */
function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userId');
}

export function useChatSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { sendNotification } = useNotification();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

    const socketService = SocketService.getInstance({
      url: socketUrl,
      token,
    });

    socketService.connect();

    // Subscribe to connection state changes
    const unsubscribeConnection = socketService.onConnectionChange(setIsConnected);

    // Listen for new messages from the server
    const unsubscribeNewMessage = socketService.on('newMessage', (message: Message) => {
      const meId = getCurrentUserId();
      const isMe = message.senderId === meId;

      // Update RTK Query cache so the message appears immediately
      dispatch(
        chatApi.util.updateQueryData(
          'getMessages',
          { conversationId: message.conversationId },
          (draft: Message[]) => {
            const exists = draft.some((m) => m.id === message.id);
            if (!exists) {
              draft.push(message);
            }
          },
        ),
      );

      // Only notify for messages from others
      if (!isMe) {
        dispatch(incrementUnread({ conversationId: message.conversationId }));

        const notification: ChatNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'message',
          title: message.senderId,
          body: message.text || '📎 Attachment',
          timestamp: new Date().toISOString(),
          isRead: false,
          conversationId: message.conversationId,
          messageId: message.id,
          senderId: message.senderId,
        };

        dispatch(addNotification(notification));
        sendNotification(notification);
      }
    });

    // Listen for typing indicators
    const unsubscribeTyping = socketService.on('typing', ({ conversationId, userId, isTyping }) => {
      const meId = getCurrentUserId();
      if (userId === meId) return; // Ignore our own typing events
      console.log(`[useChatSocket] User ${userId} is ${isTyping ? 'typing' : 'stopped typing'} in ${conversationId}`);
    });

    // Listen for message read receipts
    const unsubscribeMessageRead = socketService.on('messageRead', ({ messageId, userId }) => {
      const meId = getCurrentUserId();
      if (userId === meId) return;
      console.log(`[useChatSocket] Message ${messageId} read by ${userId}`);
    });

    return () => {
      unsubscribeConnection();
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeMessageRead();
    };
  }, [dispatch, sendNotification]);

  // Join a conversation room
  const joinRoom = useCallback((conversationId: string) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    const socketService = SocketService.getInstance({
      url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    });
    socketService.emit('joinRoom', { conversationId, userId });
  }, []);

  // Leave a conversation room
  const leaveRoom = useCallback((conversationId: string) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    const socketService = SocketService.getInstance({
      url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    });
    socketService.emit('leaveRoom', { conversationId, userId });
  }, []);

  // Emit typing indicator
  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    const socketService = SocketService.getInstance({
      url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    });
    socketService.emit('typing', { conversationId, userId, isTyping });
  }, []);

  // Mark a message as read
  const markMessageRead = useCallback((messageId: string, conversationId: string) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    const socketService = SocketService.getInstance({
      url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    });
    socketService.emit('markRead', { messageId, conversationId });
  }, []);

  return {
    joinRoom,
    leaveRoom,
    emitTyping,
    markMessageRead,
    isConnected,
  };
}
