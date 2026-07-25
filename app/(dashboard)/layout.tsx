// app/(dashboard)/layout.tsx
// Dashboard layout with chat sidebar, notification bell, and main content area.

'use client';

import React from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { NotificationBell } from '@/components/chat/NotificationBell';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      {/* Left sidebar: conversation list */}
      <div className="w-80 flex-shrink-0 bg-white border-r">
        <ConversationList />
      </div>

      {/* Right side: chat area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header with notification bell */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="font-semibold">Chat</h2>
          <NotificationBell />
        </div>
        {children}
      </div>
    </div>
  );
}
