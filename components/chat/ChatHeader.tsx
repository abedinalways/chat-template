// components/chat/ChatHeader.tsx
// Chat header showing conversation name, avatar, online status, and typing indicator.

import React from 'react';
import Image from 'next/image';
import type { User } from '@/types/chat';

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  isOnline?: boolean;
  typingUsers?: string[];
  onBack?: () => void;
}

export function ChatHeader({
  name,
  avatar,
  isOnline = false,
  typingUsers = [],
  onBack,
}: ChatHeaderProps) {
  const displayText =
    typingUsers.length > 0
      ? `${typingUsers.length} person${typingUsers.length > 1 ? 's' : ''} typing...`
      : name;

  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
      {onBack && (
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back"
        >
          ←
        </button>
      )}

      <div className="relative">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg">
            {name?.[0] || '?'}
          </div>
        )}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        {typingUsers.length > 0 && (
          <p className="text-xs text-gray-500 animate-pulse">
            {displayText}
          </p>
        )}
      </div>
    </div>
  );
}
