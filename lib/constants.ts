// lib/constants.ts
// Centralized constants and configuration for the chat application.

/** Application configuration constants */
export const CHAT_CONFIG = {
  /** Maximum number of notifications to keep in state */
  MAX_NOTIFICATIONS: 100,

  /** Auto-close timeout for browser notifications (milliseconds) */
  NOTIFICATION_AUTO_CLOSE: 10000,

  /** Mobile breakpoint (matches Tailwind's md: breakpoint) */
  MOBILE_BREAKPOINT: 768,

  /** Default socket reconnection settings */
  SOCKET: {
    RECONNECTION_DELAY: 1000,
    RECONNECTION_DELAY_MAX: 5000,
    CONNECTION_TIMEOUT: 10000,
    TRANSPORTS: ['websocket', 'polling'] as const,
  },

  /** Default socket server URL */
  DEFAULT_SOCKET_URL: 'http://localhost:5000',

  /** Default API base URL */
  DEFAULT_API_URL: '/api',

  /** Avatar generation service */
  AVATAR_SERVICE: 'https://api.dicebear.com/7.x/avataaars/svg?seed=',
} as const;

/** RTK Query cache tags */
export const CACHE_TAGS = {
  CONVERSATIONS: 'Conversations' as const,
  MESSAGES: 'Messages' as const,
} as const;

/** Socket event names */
export const SOCKET_EVENTS = {
  NEW_MESSAGE: 'newMessage',
  TYPING: 'typing',
  MESSAGE_READ: 'messageRead',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  USER_STATUS: 'userStatus',
} as const;

/** Socket emit events */
export const SOCKET_EMIT = {
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  TYPING: 'typing',
  SEND_MESSAGE: 'sendMessage',
  MARK_READ: 'markRead',
} as const;