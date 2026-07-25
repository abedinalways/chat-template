// components/chat/ChatProvider.tsx
// Context provider that ties together Redux, RTK Query, and Socket.io.
// Provides chat state and actions to all child components via React Context.

'use client';

import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} from '@/redux/api/chat/chatApi';
import {
  setActiveConversation,
  setTyping,
  resetUnread,
} from '@/redux/api/chat/chatSlice';
import { useChatSocket } from '@/hooks/useChatSocket';
import { getCurrentUserId } from '@/lib/utils';
import type { Conversation, Message } from '@/types/chat';

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  isTyping: boolean;
  unreadCount: number;
  unreadConversations: Record<string, number>;
  isConnected: boolean;
  selectConversation: (id: string) => void;
  sendMessage: (text: string) => Promise<void>;
  setTyping: (value: boolean) => void;
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
  markMessageRead: (messageId: string, conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used inside ChatProvider');
  }
  return context;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { activeConversationId, isTyping, unreadCount, unreadConversations } =
    useSelector((state: RootState) => state.chat);

  const { joinRoom, leaveRoom, emitTyping, markMessageRead, isConnected } =
    useChatSocket();

  const { data: conversations = [] } = useGetConversationsQuery();

  const { data: messages = [] } = useGetMessagesQuery(
    { conversationId: activeConversationId! },
    { skip: !activeConversationId },
  );

  const [sendMessageApi] = useSendMessageMutation();

  // Auto-select the first conversation if none is active
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      dispatch(setActiveConversation(conversations[0].id));
    }
  }, [conversations, activeConversationId, dispatch]);

  // Join/leave socket room when the active conversation changes
  useEffect(() => {
    if (activeConversationId && isConnected) {
      joinRoom(activeConversationId);
      if (unreadConversations[activeConversationId] > 0) {
        dispatch(resetUnread(activeConversationId));
      }
    }
    return () => {
      if (activeConversationId && isConnected) {
        leaveRoom(activeConversationId);
      }
    };
  }, [activeConversationId, isConnected, joinRoom, leaveRoom, dispatch, unreadConversations]);

  // Send a message via the REST API
  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId || !text.trim()) return;

      const conversation = conversations.find((c) => c.id === activeConversationId);
      if (!conversation) return;

      const meId = getCurrentUserId();
      const receiverId = conversation.participants.find((p) => p.id !== meId)?.id;
      if (!receiverId) return;

      try {
        await sendMessageApi({
          conversationId: activeConversationId,
          receiverId,
          text,
        }).unwrap();
        dispatch(setTyping(false));
      } catch (error) {
        console.error('[ChatProvider] Failed to send message:', error);
      }
    },
    [activeConversationId, conversations, sendMessageApi, dispatch],
  );

  const value = useMemo(
    () => ({
      conversations,
      messages,
      activeConversationId,
      isTyping,
      unreadCount,
      unreadConversations,
      isConnected,
      selectConversation: (id: string) => {
        dispatch(setActiveConversation(id));
      },
      sendMessage,
      setTyping: (value: boolean) => dispatch(setTyping(value)),
      joinRoom,
      leaveRoom,
      emitTyping,
      markMessageRead,
    }),
    [
      conversations,
      messages,
      activeConversationId,
      isTyping,
      unreadCount,
      unreadConversations,
      isConnected,
      sendMessage,
      joinRoom,
      leaveRoom,
      emitTyping,
      markMessageRead,
      dispatch,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
