// components/chat/MessageBubble.tsx
// Renders a single chat message with avatar, text, timestamp, and status.

import React from 'react';
import Image from 'next/image';
import { formatTime } from '@/lib/utils';
import type { Message, User } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
  currentUser?: User;
  otherUser?: User;
}

const statusIcons = {
  sending: '⏳',
  sent: '✓',
  delivered: '✓✓',
  read: '✓✓',
};

export function MessageBubble({
  message,
  isMe,
  showAvatar = false,
  currentUser,
  otherUser,
}: MessageBubbleProps) {
  const time = formatTime(message.createdAt);

  return (
    <div className={`flex mb-5 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for the other user */}
      {!isMe && showAvatar && otherUser && (
        <div className="flex-shrink-0 mr-2">
          {otherUser.avatar ? (
            <Image
              src={otherUser.avatar}
              alt={otherUser.name}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
              {otherUser.name?.[0] || '?'}
            </div>
          )}
        </div>
      )}

      <div
        className={`max-w-[70%] ${
          isMe ? 'items-end' : 'items-start'
        } flex flex-col`}
      >
        {/* Message text */}
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isMe
              ? 'bg-[#E8F5E9] text-gray-900 rounded-br-none'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
          }`}
        >
          {message.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm underline hover:no-underline"
                >
                  📎 {att.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp below bubble */}
        <span className={`text-[10px] text-gray-400 mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
          {time}
          {isMe && (
            <span className="text-blue-500 ml-0.5">
              {message.status === 'read' ? '✓✓' : '✓'}
            </span>
          )}
        </span>
      </div>

      {/* Spacer for alignment when it's the current user's message */}
      {isMe && <div className="w-10 flex-shrink-0" />}
    </div>
  );
}
