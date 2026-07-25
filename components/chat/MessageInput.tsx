// components/chat/MessageInput.tsx
// Message input area with typing indicator, send button, and attachment support.

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from './ChatProvider';
import { useDebounce } from '@/hooks/useDebounce';

export function MessageInput() {
  const { sendMessage, setTyping, activeConversationId, emitTyping } = useChat();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Debounce text changes to avoid spamming the server with typing events
  const debouncedText = useDebounce(text, 1000);

  // Emit typing indicator when debounced text changes
  useEffect(() => {
    if (activeConversationId) {
      const isTyping = debouncedText.length > 0;
      setTyping(isTyping);
      emitTyping(activeConversationId, isTyping);
    }
  }, [debouncedText, setTyping, activeConversationId, emitTyping]);

  // Send a message
  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(trimmedText);
      setText('');
      if (activeConversationId) {
        emitTyping(activeConversationId, false);
      }
      setTyping(false);
    } catch (error) {
      console.error('[MessageInput] Failed to send:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Send on Enter (without Shift)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show placeholder when no conversation is selected
  if (!activeConversationId) {
    return (
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-gray-400">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-[120px]"
          rows={1}
          disabled={isSending}
        />

        <button
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => alert('File upload coming soon!')}
          title="Attach file"
          type="button"
        >
          📎
        </button>

        <button
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className={`
            px-4 py-2 rounded-lg text-white font-medium transition-all
            ${
              text.trim() && !isSending
                ? 'bg-blue-500 hover:bg-blue-600 active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }
          `}
          type="button"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Send'
          )}
        </button>
      </div>
    </div>
  );
}
