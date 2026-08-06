// lib/demoData.ts
// Demo/mock data for chat UI testing without backend.
// Easily replaceable with real API calls when backend is ready.

import type { User, Conversation, Message } from '@/types/chat';

// Demo users
export const demoUsers: Record<string, User> = {
  'demo-user-123': {
    id: 'demo-user-123',
    name: 'Maria',
    avatar: undefined,
    isOnline: true,
  },
  'care-team-1': {
    id: 'care-team-1',
    name: 'Care Team',
    avatar: undefined,
    isOnline: true,
  },
};

// Demo messages for the care team conversation
export const demoMessages: Message[] = [
  {
    id: 'msg-1',
    content: 'Hi Maria,\n\nThank you for completing your assessment. Your treatment has been reviewed by our physician and has been approved. You\'ll receive a shipping confirmation once your medication is on the way.',
    senderId: 'care-team-1',
    receiverId: 'demo-user-123',
    conversationId: 'conv-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    status: 'read',
    type: 'TEXT',
  },
  {
    id: 'msg-2',
    content: 'Thank you! When can I expect my medication to be shipped?',
    senderId: 'demo-user-123',
    receiverId: 'care-team-1',
    conversationId: 'conv-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: 'read',
    type: 'TEXT',
  },
  {
    id: 'msg-3',
    content: 'You\'re welcome! Your medication will be shipped within 1-2 business days. You will get an email with tracking information as soon as it\'s on the way.',
    senderId: 'care-team-1',
    receiverId: 'demo-user-123',
    conversationId: 'conv-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    status: 'read',
    type: 'TEXT',
  },
  {
    id: 'msg-4',
    content: 'Great!',
    senderId: 'demo-user-123',
    receiverId: 'care-team-1',
    conversationId: 'conv-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    status: 'read',
    type: 'TEXT',
  },
];

// Demo conversations
export const demoConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [demoUsers['demo-user-123'], demoUsers['care-team-1']],
    lastMessage: demoMessages[demoMessages.length - 1],
    updatedAt: demoMessages[demoMessages.length - 1].createdAt,
    unreadCount: 0,
  },
];

// Helper to check if demo mode should be used
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  const demoMode = localStorage.getItem('demoMode');
  return demoMode !== null ? demoMode === 'true' : true; // Default to demo mode
}

// Toggle demo mode
export function setDemoMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('demoMode', String(enabled));
}