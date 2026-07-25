// types/notification.ts
// Re-exports notification types from chat.ts for backward compatibility.
// The canonical definitions live in types/chat.ts to keep all chat-related
// types in one place.

export type { Notification, NotificationType } from '@/types/chat';
