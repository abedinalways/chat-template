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
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <p className="text-xs text-gray-500 mt-0.5">Communicate with our APSU care team.</p>
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search messages"
            className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

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
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all relative
                  ${
                    isActive
                      ? 'bg-[#E8F5E9]'
                      : 'hover:bg-gray-100'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500 rounded-r-full" />
                )}

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
                    <p className="font-medium text-sm truncate">
                      {otherUser?.name || 'Unknown'}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {unread > 0 && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                      )}
                      <p className={`text-sm truncate ${unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
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
