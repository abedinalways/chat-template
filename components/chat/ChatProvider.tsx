// components/chat/ChatProvider.tsx
// Context provider that ties together Redux, RTK Query, and Socket.io.
// Provides chat state and actions to all child components via React Context.

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} from "@/redux/api/chat/chatApi";
import {
  setActiveConversation,
  setUserTyping,
  resetUnread,
} from "@/redux/api/chat/chatSlice";
import { useChatSocket } from "@/hooks/useChatSocket";
import { getCurrentUserId } from "@/lib/utils";
import type { Conversation, Message } from "@/types/chat";

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  typingUsers: Record<string, string[]>;
  unreadCount: number;
  unreadConversations: Record<string, number>;
  isConnected: boolean;
  selectConversation: (id: string | null) => void;
  sendMessage: (text: string) => Promise<void>;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
  markMessageRead: (messageId: string, conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return context;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    activeConversationId,
    typingUsers,
    unreadCount,
    unreadConversations,
  } = useSelector((state: RootState) => state.chat);

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
  }, [
    activeConversationId,
    isConnected,
    joinRoom,
    leaveRoom,
    dispatch,
    unreadConversations,
  ]);

  // Send a message via the REST API
  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId || !text.trim()) return;

      const conversation = conversations.find(
        (c) => c.id === activeConversationId,
      );
      if (!conversation) return;

      const meId = getCurrentUserId();
      const otherParticipants = conversation.participants.filter(
        (p) => p.id !== meId,
      );
      const receiverId =
        otherParticipants.length === 1 ? otherParticipants[0].id : undefined;

      try {
        await sendMessageApi({
          conversationId: activeConversationId,
          receiverId,
          content: text.trim(),
          type: "TEXT",
        }).unwrap();
        if (meId) {
          dispatch(
            setUserTyping({
              conversationId: activeConversationId,
              userId: meId,
              isTyping: false,
            }),
          );
        }
      } catch (error) {
        console.error("[ChatProvider] Failed to send message:", error);
      }
    },
    [activeConversationId, conversations, sendMessageApi, dispatch],
  );

  const setTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      const meId = getCurrentUserId();
      if (!meId) return;
      dispatch(setUserTyping({ conversationId, userId: meId, isTyping }));
    },
    [dispatch],
  );

  const value = useMemo(
    () => ({
      conversations,
      messages,
      activeConversationId,
      typingUsers,
      unreadCount,
      unreadConversations,
      isConnected,
      selectConversation: (id: string | null) => {
        dispatch(setActiveConversation(id));
      },
      sendMessage,
      setTyping,
      joinRoom,
      leaveRoom,
      emitTyping,
      markMessageRead,
    }),
    [
      conversations,
      messages,
      activeConversationId,
      typingUsers,
      unreadCount,
      unreadConversations,
      isConnected,
      sendMessage,
      setTyping,
      joinRoom,
      leaveRoom,
      emitTyping,
      markMessageRead,
      dispatch,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
