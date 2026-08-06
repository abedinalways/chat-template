// components/chat/MessageInput.tsx
// Message input component with typing indicators, send button, and attachment support.
// Integrates with the chat context for real-time messaging.

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Paperclip, X } from 'lucide-react';
import { useChat } from './ChatProvider';

export function MessageInput() {
  const { sendMessage, activeConversationId, emitTyping, setTyping } = useChat();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus input when conversation changes
  useEffect(() => {
    if (activeConversationId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeConversationId]);

  // Local handlers to avoid context dependency issues
  const handleTyping = useCallback((isTyping: boolean) => {
    if (activeConversationId) {
      emitTyping(activeConversationId, isTyping);
      setTyping(activeConversationId, isTyping);
    }
  }, [activeConversationId, emitTyping, setTyping]);

  // Emit typing indicator when text changes
  useEffect(() => {
    if (!activeConversationId) return;
    handleTyping(text.length > 0 || attachments.length > 0);
  }, [text, activeConversationId, handleTyping]);

  // Handle sending a message
  const handleSend = useCallback(async () => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending || !activeConversationId) return;

    setIsSending(true);
    try {
      await sendMessage(trimmedText);
      setText('');
      setAttachments([]);
    } catch (error) {
      console.error('[MessageInput] Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }, [text, isSending, activeConversationId, sendMessage]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove an attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Show placeholder when no conversation is selected
  if (!activeConversationId) {
    return (
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-center text-gray-400 text-sm">
          Select a conversation to start messaging
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
            >
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 truncate max-w-[200px]">
                {file.name}
              </span>
              <button
                onClick={() => handleRemoveAttachment(index)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Camera icon */}
        <button
          type="button"
          className="p-2 bg-gray-700 text-white hover:bg-gray-800 rounded-full transition-all flex-shrink-0"
          title="Camera"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* File attachment button */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="p-2 bg-gray-700 text-white hover:bg-gray-800 rounded-full cursor-pointer transition-all flex-shrink-0"
          title="Attach files"
        >
          <Paperclip className="w-5 h-5" />
        </label>

        {/* Message input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a new message.."
          className="flex-1 min-w-0 border border-gray-300 rounded-full px-4 py-2 text-sm text-black bg-white placeholder-gray-400 h-10"
          disabled={isSending}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className={`
            p-2 rounded-full transition-all duration-200 flex-shrink-0
            ${
              text.trim() && !isSending
                ? 'bg-transparent text-gray-600 hover:bg-gray-100'
                : 'bg-transparent text-gray-400 cursor-not-allowed'
            }
          `}
          type="button"
          title="Send message"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
