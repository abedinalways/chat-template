// components/chat/ChatMessages.tsx
// Messages area with auto-scroll, date grouping, and load-more support.

import React, { useEffect, useRef, useState, useMemo } from 'react';

import { Loader } from '@/components/ui/Loader';
import { formatDate } from '@/lib/utils';
import type { Message, User } from '@/types/chat';
import { MessageBubble } from './MessageBubble';

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  maxMessages?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  otherUser?: User;
}

export function ChatMessages({
  messages,
  currentUserId,
  isLoading = false,
  maxMessages = 50,
  onLoadMore,
  hasMore = false,
  otherUser,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  // Auto-scroll to bottom when new messages arrive (if already at bottom)
  useEffect(() => {
    if (isScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledToBottom]);

  // Track scroll position for auto-scroll and load-more
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const bottom = scrollHeight - scrollTop <= clientHeight + 50;
      setIsScrolledToBottom(bottom);

      // Load more when scrolled to top
      if (scrollTop === 0 && hasMore && !isLoading) {
        onLoadMore?.();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, onLoadMore]);

  // Group messages by date for display
  const groupedMessages = useMemo(() => {
    const groups: Record<string, Message[]> = {};

    messages.forEach((msg) => {
      const key = formatDate(msg.createdAt);

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(msg);
    });

    return groups;
  }, [messages]);

  // Render loading state
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Render empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-2xl mb-2">💬</p>
          <p className="text-lg">No messages yet</p>
          <p className="text-sm">Say hello to start the conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Load more indicator */}
      {hasMore && (
        <div className="flex justify-center py-2">
          {isLoading ? (
            <Loader size="sm" />
          ) : (
            <button
              onClick={onLoadMore}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Load older messages
            </button>
          )}
        </div>
      )}

      {/* Messages grouped by date */}
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          {/* Date header */}
          <div className="flex justify-center my-4">
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {date}
            </span>
          </div>

          {/* Messages */}
          {msgs.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            const showAvatar =
              !isMe &&
              (index === 0 || msgs[index - 1]?.senderId !== msg.senderId);

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMe={isMe}
                showAvatar={showAvatar}
                otherUser={otherUser}
              />
            );
          })}
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}
