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
  selectUnreadCount,
} from "@/redux/api/chat/chatSlice";
import { useChatSocket } from "@/hooks/useChatSocket";
import { getCurrentUserId } from "@/lib/auth";
import { isDemoMode, demoConversations, demoMessages, demoUsers } from "@/lib/demoData";
import type { Conversation, Message } from "@/types/chat";

// Demo mode socket hook that does nothing
function useDemoChatSocket() {
  return {
    joinRoom: () => {},
    leaveRoom: () => {},
    emitTyping: () => {},
    markMessageRead: () => {},
    isConnected: false,
  };
}

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
    unreadConversations,
  } = useSelector((state: RootState) => state.chat);

  const unreadCount = selectUnreadCount({ chat: { ...useSelector((state: RootState) => state.chat) } });

  // Demo mode: use mock data when backend is not available
  const demoMode = isDemoMode();
  
  // Always call both hooks to satisfy React rules, then pick the right one
  const realSocketHook = useChatSocket();
  const demoSocketHook = useDemoChatSocket();
  const socketHook = demoMode ? demoSocketHook : realSocketHook;
  const { joinRoom, leaveRoom, emitTyping, markMessageRead, isConnected } = socketHook;
  const { data: conversations = [] } = useGetConversationsQuery();
  const { data: messages = [] } = useGetMessagesQuery(
    { conversationId: activeConversationId! },
    { skip: !activeConversationId },
  );

  // Override with demo data when in demo mode
  const effectiveConversations = demoMode && conversations.length === 0
    ? demoConversations
    : conversations;
  const effectiveMessages = demoMode && messages.length === 0 && activeConversationId
    ? demoMessages.filter(m => m.conversationId === activeConversationId)
    : messages;
  const [sendMessageApi] = useSendMessageMutation();

  // Demo mode: auto-select first conversation
  useEffect(() => {
    if (demoMode && !activeConversationId && effectiveConversations.length > 0) {
      dispatch(setActiveConversation(effectiveConversations[0].id));
    }
  }, [demoMode, activeConversationId, effectiveConversations, dispatch]);

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

      if (demoMode) {
        // Demo mode: create a new message and add it to the local state
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          content: text.trim(),
          senderId: meId || 'demo-user-123',
          receiverId: receiverId || 'care-team-1',
          conversationId: activeConversationId,
          createdAt: new Date().toISOString(),
          status: 'sent',
          type: 'TEXT',
        };
        
        // Add message to demo messages array (in a real app, this would come from the API)
        demoMessages.push(newMessage);
        
        // Update the last message in the conversation
        const updatedConversations = demoConversations.map(conv => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              lastMessage: newMessage,
              updatedAt: newMessage.createdAt,
            };
          }
          return conv;
        });
        
        // Force a re-render by dispatching a dummy action or the component will auto-update
        return;
      }

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
    [activeConversationId, conversations, sendMessageApi, dispatch, demoMode],
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
      conversations: effectiveConversations,
      messages: effectiveMessages,
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
      effectiveConversations,
      effectiveMessages,
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
