// redux/api/chat/chatSlice.ts
// Chat state slice: active conversation, typing, unread counts, notifications.
// Uses Immer (via createSlice) so "mutations" on draft state are safe.

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/types/chat';
import { CHAT_CONFIG } from '@/lib/constants';

interface ChatState {
  activeConversationId: string | null;
  // Per-conversation typing: Record<conversationId, Set of userIds who are typing>
  typingUsers: Record<string, string[]>;
  unreadConversations: Record<string, number>; // Per-conversation unread counts
  notifications: Notification[]; // In-app notification list
}

const initialState: ChatState = {
  activeConversationId: null,
  typingUsers: {},
  unreadConversations: {},
  notifications: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Set the active conversation (pass null to clear) and reset its unread count
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      if (action.payload) {
        state.unreadConversations[action.payload] = 0;
      }
    },

    // Set a user's typing state for a specific conversation
    setUserTyping: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>,
    ) => {
      const { conversationId, userId, isTyping } = action.payload;
      const currentTypers = state.typingUsers[conversationId] || [];

      if (isTyping) {
        if (!currentTypers.includes(userId)) {
          state.typingUsers[conversationId] = [...currentTypers, userId];
        }
      } else {
        state.typingUsers[conversationId] = currentTypers.filter((id) => id !== userId);
      }
    },

    // Increment unread count for a conversation (if it's not the active one)
    incrementUnread: (state, action: PayloadAction<{ conversationId: string }>) => {
      const { conversationId } = action.payload;
      if (state.activeConversationId !== conversationId) {
        state.unreadConversations[conversationId] =
          (state.unreadConversations[conversationId] || 0) + 1;
      }
    },

    // Reset unread count for a conversation
    resetUnread: (state, action: PayloadAction<string>) => {
      state.unreadConversations[action.payload] = 0;
    },

    // Add an in-app notification
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      // Keep only the max most recent notifications
      if (state.notifications.length > CHAT_CONFIG.MAX_NOTIFICATIONS) {
        state.notifications = state.notifications.slice(0, CHAT_CONFIG.MAX_NOTIFICATIONS);
      }
    },

    // Mark a single notification as read
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      if (notification) {
        notification.isRead = true;
      }
    },

    // Mark all notifications as read
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => (n.isRead = true));
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

/** Helper: sum all values in the unreadConversations record. */
function sumUnread(record: Record<string, number>): number {
  return Object.values(record).reduce((sum, count) => sum + count, 0);
}

export const {
  setActiveConversation,
  setUserTyping,
  incrementUnread,
  resetUnread,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} = chatSlice.actions;

// Selectors for derived state
export const selectUnreadCount = (state: { chat: ChatState }) =>
  Object.values(state.chat.unreadConversations).reduce((sum, count) => sum + count, 0);

export default chatSlice.reducer;
