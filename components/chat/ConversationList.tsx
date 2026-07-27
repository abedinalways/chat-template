// components/chat/ConversationList.tsx
// Sidebar showing the list of conversations with search and unread badges.

'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Bell } from 'lucide-react';
import { useChat } from './ChatProvider';
import { getCurrentUserId } from '@/lib/auth';
import { formatTime } from '@/lib/utils';

export function ConversationList() {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    unreadCount,
    unreadConversations,
  } = useChat();

  const [searchTerm, setSearchTerm] = useState('');
  const meId = getCurrentUserId();

  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const otherUser = conv.participants.find((p) => p.id !== meId);
      return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm, meId]);

  return (
    <div className="border-r border-gray-200 h-full overflow-y-auto bg-white">
      <div className="p-4">
        {/* Header with unread count */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          {unreadCount > 0 && (
            <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
              <Bell className="w-3 h-3" />
              <span>{unreadCount}</span>
            </div>
          )}
        </div>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Conversation list */}
        <div className="space-y-2">
          {filteredConversations.map((conv) => {
            const otherUser = conv.participants.find((p) => p.id !== meId);
            const isActive = activeConversationId === conv.id;
            const unread = unreadConversations[conv.id] || 0;

            return (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                  ${
                    isActive
                      ? 'bg-blue-50 ring-1 ring-blue-200'
                      : 'hover:bg-gray-50'
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {otherUser?.avatar ? (
                    <Image
                      src={otherUser.avatar}
                      alt={otherUser.name || 'User'}
                      width={44}
                      height={44}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gray-300 flex items-center justify-center text-lg">
                      {otherUser?.name?.[0] || '?'}
                    </div>
                  )}
                  {otherUser?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">
                      {otherUser?.name || 'Unknown'}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                    {unread > 0 && (
                      <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
