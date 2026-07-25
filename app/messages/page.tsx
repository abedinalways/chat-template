// app/messages/page.tsx
// Dedicated messaging page with full chat interface.
// This page is separate from the main dashboard and home page.

'use client';

import React from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import type { User } from '@/types/chat';

// Mock current user - replace with actual user from your auth system
const currentUser: User = {
  id: 'user-1',
  name: 'John Doe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  isOnline: true,
};

export default function MessagesPage() {
  return (
    <div className="h-screen w-full bg-gray-100">
      <ChatContainer currentUser={currentUser} />
    </div>
  );
}