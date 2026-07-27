// hooks/useChatSocket.ts
// React hook that manages the Socket.io connection and wires real-time
// events into Redux (RTK Query cache + chat slice).
//
// Key design decisions:
// - Uses the SocketService singleton (lib/socket.ts) so there is only
//   ONE socket connection per app, even if multiple components call this hook.
// - Subscribes to connection state changes via React state.
// - Cleans up all event listeners on unmount.
// - Emits userId alongside every socket event so the server can identify
//   the sender.

import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { SocketService } from "@/lib/socket";
import { chatApi } from "@/redux/api/chat/chatApi";
import {
  incrementUnread,
  setUserTyping,
  addNotification,
} from "@/redux/api/chat/chatSlice";
import { useNotification } from "./useNotification";
import { getCurrentUserId, getAuthToken } from "@/lib/auth";
import type { AppDispatch } from "@/redux/store";
import type { Conversation, Message, Notification as ChatNotification } from "@/types/chat";

export function useChatSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { sendNotification } = useNotification();
  // Store socket instance in ref to avoid repeated getInstance calls
  const socketServiceRef = useRef<SocketService | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

    socketServiceRef.current = SocketService.getInstance({
      url: socketUrl,
      token,
    });
    socketServiceRef.current.connect();

    // Subscribe to connection state changes
    const unsubscribeConnection =
      socketServiceRef.current.onConnectionChange(setIsConnected);

    // Listen for new messages from the server
    const unsubscribeNewMessage = socketServiceRef.current.on(
      "newMessage",
      (message: Message) => {
        const meId = getCurrentUserId() || message.receiverId;
        const isMe = message.senderId === meId;

        // Update RTK Query cache so the message appears immediately
        dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            { conversationId: message.conversationId },
            (draft: Message[]) => {
              const exists = draft.some((m) => m.id === message.id);
              if (!exists) {
                draft.push(message);
              }
            },
          ),
        );

        // Update conversations cache for lastMessage
        dispatch(
          chatApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft: Conversation[]) => {
              const convIndex = draft.findIndex(
                (c) => c.id === message.conversationId,
              );
              if (convIndex !== -1) {
                draft[convIndex] = {
                  ...draft[convIndex],
                  lastMessage: message,
                  updatedAt: message.createdAt,
                };
                const updated = draft[convIndex];
                draft.splice(convIndex, 1);
                draft.unshift(updated);
              }
            },
          ),
        );

        // Only notify for messages from others
        if (!isMe) {
          dispatch(incrementUnread({ conversationId: message.conversationId }));

          const notification: ChatNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: "message",
            title: message.senderId,
            body: message.content || "Attachment",
            timestamp: new Date().toISOString(),
            isRead: false,
            conversationId: message.conversationId,
            messageId: message.id,
            senderId: message.senderId,
          };

          sendNotification(notification);
        }
      },
    );

    // Listen for typing indicators
    const unsubscribeTyping = socketServiceRef.current.on(
      "typing",
      ({ conversationId, userId, isTyping }) => {
        const meId = getCurrentUserId();
        if (!meId || userId === meId) return; // Ignore our own typing events
        dispatch(setUserTyping({ conversationId, userId, isTyping }));
      },
    );

    // Listen for message read receipts - update RTK cache
    const unsubscribeMessageRead = socketServiceRef.current.on(
      "messageRead",
      ({ messageId, userId, conversationId }) => {
        const meId = getCurrentUserId();
        if (!meId || userId === meId) return;

        dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            { conversationId },
            (draft: Message[]) => {
              const msgIndex = draft.findIndex((m) => m.id === messageId);
              if (msgIndex !== -1) {
                draft[msgIndex] = {
                  ...draft[msgIndex],
                  status: "read",
                  isRead: true,
                };
              }
            },
          ),
        );
      },
    );

    // Listen for user status updates - update conversations cache with online status
    const unsubscribeUserStatus = socketServiceRef.current.on(
      "userStatus",
      ({ userId, isOnline }) => {
        dispatch(
          chatApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft: Conversation[]) => {
              for (let i = 0; i < draft.length; i++) {
                const conv = draft[i];
                for (let j = 0; j < conv.participants.length; j++) {
                  if (conv.participants[j].id === userId) {
                    draft[i].participants[j] = {
                      ...conv.participants[j],
                      isOnline,
                    };
                  }
                }
              }
            },
          ),
        );
      },
    );

    return () => {
      unsubscribeConnection();
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeMessageRead();
      unsubscribeUserStatus();
    };
  }, [dispatch, sendNotification]);

  // Get socket instance (memoized reference)
  const getSocketService = useCallback(() => {
    if (!socketServiceRef.current) {
      const token = getAuthToken();
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
      socketServiceRef.current = SocketService.getInstance({
        url: socketUrl,
        token: token || undefined,
      });
    }
    return socketServiceRef.current;
  }, []);

  // Join a conversation room
  const joinRoom = useCallback(
    (conversationId: string) => {
      const userId = getCurrentUserId();
      if (!userId) return;

      getSocketService().emit("joinRoom", { conversationId, userId });
    },
    [getSocketService],
  );

  // Leave a conversation room
  const leaveRoom = useCallback(
    (conversationId: string) => {
      const userId = getCurrentUserId();
      if (!userId) return;

      getSocketService().emit("leaveRoom", { conversationId, userId });
    },
    [getSocketService],
  );

  // Emit typing indicator
  const emitTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      const userId = getCurrentUserId();
      if (!userId) return;

      getSocketService().emit("typing", { conversationId, userId, isTyping });
    },
    [getSocketService],
  );

  // Mark a message as read
  const markMessageRead = useCallback(
    (messageId: string, conversationId: string) => {
      const userId = getCurrentUserId();
      if (!userId) return;

      getSocketService().emit("markRead", { messageId, conversationId });
    },
    [getSocketService],
  );

  return {
    joinRoom,
    leaveRoom,
    emitTyping,
    markMessageRead,
    isConnected,
  };
}
