import React, { useState, useEffect, useRef } from 'react';

// import { useChat } from '@chat-template/core/hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ConversationList } from './ConversationList';
import { ChatConversation, ChatMessage, ChatUser } from '@/types/chat';

interface ChatContainerProps {
  currentUser: ChatUser;
  conversations: ChatConversation[];
  activeConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onSendMessage: (message: string, attachments?: File[]) => Promise<void>;
  isLoading?: boolean;
  className?: string;
  config?: {
    showHeader?: boolean;
    showConversationList?: boolean;
    enableAttachments?: boolean;
    enableVoiceMessages?: boolean;
    maxMessages?: number;
  };
}

export function ChatContainer({
  currentUser,
  conversations,
  activeConversationId,
  onConversationSelect,
  onSendMessage,
  isLoading = false,
  className = '',
  config = {
    showHeader: true,
    showConversationList: true,
    enableAttachments: true,
    enableVoiceMessages: true,
    maxMessages: 50,
  },
}: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // ✅ Get active conversation
  const activeConversation = conversations.find(
    c => c.id === activeConversationId,
  );

  // ✅ Handle typing indicator
  useEffect(() => {
    if (!activeConversationId) return;

    // Listen for typing events
    const handleTyping = (data: { user_id: string; is_typing: boolean }) => {
      if (data.user_id === currentUser.id) return;

      setTypingUsers(prev => {
        if (data.is_typing) {
          return [...new Set([...prev, data.user_id])];
        } else {
          return prev.filter(id => id !== data.user_id);
        }
      });
    };

    // Cleanup
    return () => {
      setTypingUsers([]);
    };
  }, [activeConversationId, currentUser.id]);

  // ✅ Get conversation name
  const getConversationName = (conversation: ChatConversation): string => {
    if (conversation.creator_id === currentUser.id) {
      return conversation.participant.name;
    }
    return conversation.creator.name;
  };

  // ✅ Get conversation avatar
  const getConversationAvatar = (conversation: ChatConversation): string => {
    if (conversation.creator_id === currentUser.id) {
      return conversation.participant.avatar || '';
    }
    return conversation.creator.avatar || '';
  };

  // ✅ Render empty state
  if (!activeConversationId && config.showConversationList) {
    return (
      <div className="flex h-full bg-gray-50">
        <div className="w-80 border-r border-gray-200">
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            currentUserId={currentUser.id}
            onSelect={onConversationSelect}
          />
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-lg">Select a conversation</p>
            <p className="text-sm">Choose a conversation to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* ✅ Conversation List */}
      {config.showConversationList && (
        <div className="w-80 border-r border-gray-200 flex-shrink-0">
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            currentUserId={currentUser.id}
            onSelect={onConversationSelect}
          />
        </div>
      )}

      {/* ✅ Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* ✅ Header */}
        {config.showHeader && activeConversation && (
          <ChatHeader
            name={getConversationName(activeConversation)}
            avatar={getConversationAvatar(activeConversation)}
            isOnline={true}
            typingUsers={typingUsers}
            onBack={() => {
              if (config.showConversationList) {
                onConversationSelect('');
              }
            }}
          />
        )}

        {/* ✅ Messages */}
        <ChatMessages
          messages={messages}
          currentUserId={currentUser.id}
          isLoading={isLoading}
          maxMessages={config.maxMessages}
        />

        {/* ✅ Input */}
        <ChatInput
          onSend={onSendMessage}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
          enableAttachments={config.enableAttachments}
          enableVoiceMessages={config.enableVoiceMessages}
          disabled={!activeConversationId}
        />
      </div>
    </div>
  );
}
