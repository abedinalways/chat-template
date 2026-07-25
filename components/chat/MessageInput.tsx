// components/chat/MessageInput.tsx
// Message input component with typing indicators, send button, and attachment support.
// Integrates with the chat context for real-time messaging.

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Paperclip, Send, X } from 'lucide-react';
import { useChat } from './ChatProvider';
import { useDebounce } from '@/hooks/useDebounce';

export function MessageInput() {
  const { sendMessage, activeConversationId, emitTyping } = useChat();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce text changes to avoid spamming typing events
  const debouncedText = useDebounce(text, 800);

  // Emit typing indicator when text changes
  useEffect(() => {
    if (!activeConversationId) return;

    const isTyping = debouncedText.length > 0 || attachments.length > 0;
    emitTyping(activeConversationId, isTyping);

    // Cleanup: emit stopped typing when component unmounts or conversation changes
    return () => {
      if (activeConversationId) {
        emitTyping(activeConversationId, false);
      }
    };
  }, [debouncedText, attachments.length, activeConversationId, emitTyping]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [text]);

  // Handle sending a message
  const handleSend = useCallback(async () => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending || !activeConversationId) return;

    setIsSending(true);
    try {
      await sendMessage(trimmedText);
      setText('');
      setAttachments([]);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('[MessageInput] Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }, [text, isSending, activeConversationId, sendMessage]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
      <div className="p-4 border-t border-gray-200 bg-gray-50">
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

      <div className="flex items-end gap-2">
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
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-all"
          title="Attach files"
        >
          <Paperclip className="w-5 h-5" />
        </label>

        {/* Message textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-[120px] text-sm"
          rows={1}
          disabled={isSending}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${
              text.trim() && !isSending
                ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          type="button"
          title="Send message"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Helper text */}
      <div className="text-xs text-gray-400 mt-2">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</kbd> to send,{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Shift + Enter</kbd> for new line
      </div>
    </div>
  );
}