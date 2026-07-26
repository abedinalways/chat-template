// types/chat.ts
// Centralized type definitions for the chat system.
// All types use camelCase for consistency across the codebase.

/** A user in the system */
export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

/** A file attachment on a message */
export interface Attachment {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

/** A single chat message */
export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: Attachment[];
  isRead?: boolean;
}

/** A conversation between two or more users */
export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  updatedAt: string;
  unreadCount?: number;
}

/** Notification types for in-app notifications */
export type NotificationType = 'message' | 'mention' | 'system';

/** An in-app notification */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  timestamp: string;
  isRead: boolean;
  conversationId?: string;
  messageId?: string;
  senderId?: string;
}

/** Configuration for the chat UI */
export interface ChatConfig {
  showHeader?: boolean;
  showConversationList?: boolean;
  enableAttachments?: boolean;
  enableVoiceMessages?: boolean;
  maxMessages?: number;
}

/** Socket events emitted from the server */
export interface SocketEvents {
  newMessage: (message: Message) => void;
  typing: (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
  messageRead: (data: { messageId: string; userId: string }) => void;
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  userStatus: (data: { userId: string; isOnline: boolean }) => void;
}

/** Socket events emitted to the server */
export interface SocketEmitEvents {
  joinRoom: (data: { conversationId: string; userId: string }) => void;
  leaveRoom: (data: { conversationId: string; userId: string }) => void;
  typing: (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
  sendMessage: (message: Omit<Message, 'id' | 'status' | 'createdAt'>) => void;
  markRead: (data: { messageId: string; conversationId: string }) => void;
}
