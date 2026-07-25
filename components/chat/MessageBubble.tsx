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
    <div className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
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

      {/* Spacer when avatar is hidden for alignment */}
      {!isMe && !showAvatar && <div className="w-10 flex-shrink-0" />}

      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isMe
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        {/* Message text */}
        {message.text && <p className="text-sm break-words">{message.text}</p>}

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

        {/* Timestamp and status */}
        <div
          className={`flex items-center gap-1 mt-1 text-xs ${
            isMe ? 'text-blue-100' : 'text-gray-400'
          }`}
        >
          <span>{time}</span>
          {isMe && (
            <span
              className={
                message.status === 'read' ? 'text-blue-200' : 'opacity-60'
              }
              title={message.status}
            >
              {statusIcons[message.status]}
            </span>
          )}
        </div>
      </div>

      {/* Spacer for alignment when it's the current user's message */}
      {isMe && <div className="w-10 flex-shrink-0" />}
    </div>
  );
}
