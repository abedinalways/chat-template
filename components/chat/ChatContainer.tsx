// components/chat/ChatContainer.tsx
// Main chat container that orchestrates the chat UI components.
// Fully responsive design: adapts layout for mobile, tablet, and desktop.
// Uses the ChatProvider context for state management and real-time updates.

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { MessageInput } from "./MessageInput";
import { ConversationList } from "./ConversationList";
import { useChat } from "./ChatProvider";
import { getCurrentUserId } from "@/lib/auth";
import type { User, Conversation } from "@/types/chat";

interface ChatContainerProps {
  currentUser: User;
  className?: string;
}

/**
 * Main chat container component with responsive design.
 *
 * Mobile behavior:
 * - Shows conversation list by default
 * - When a conversation is selected, shows chat area with back button
 * - Smooth transitions between views
 *
 * Desktop behavior:
 * - Shows both conversation list and chat area side by side
 *
 * @example
 * ```tsx
 * <ChatContainer currentUser={user} />
 * ```
 */
export function ChatContainer({
  currentUser,
  className = "",
}: ChatContainerProps) {
  const {
    conversations,
    messages,
    activeConversationId,
    typingUsers,
    unreadCount,
    isConnected,
    selectConversation,
    sendMessage,
    setTyping,
    joinRoom,
    leaveRoom,
    emitTyping,
    markMessageRead,
  } = useChat();

  // Track mobile view state
  const [isMobileView, setIsMobileView] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Compute mobile view directly from state (no useEffect needed)
  const mobileView = isMobileView
    ? activeConversationId
      ? "chat"
      : "list"
    : "list";

  // Get the active conversation
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  // Build participant map for quick name lookup (useful for group chat typing display)
  const participantMap = useMemo(() => {
    const map: Record<string, User> = {};
    activeConversation?.participants.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [activeConversation]);

  // Get the other user in a 1-on-1 conversation
  // For group chats, this is null and the header shows the conversation instead
  const otherUser =
    activeConversation?.participants.length === 2
      ? activeConversation.participants.find((p) => p.id !== currentUser.id)
      : undefined;

  // Handle conversation selection
  const handleConversationSelect = (id: string) => {
    selectConversation(id);
  };

  // Handle back button (mobile) - deselect conversation
  const handleBack = () => {
    selectConversation(null);
  };

  // Determine what to show
  const showConversationList = !isMobileView || mobileView === "list";
  const showChatArea = !isMobileView || mobileView === "chat";

  return (
    <div className={`flex h-full bg-white overflow-hidden ${className}`}>
      {/* Conversation List Sidebar */}
      {/* Mobile: Show as full screen overlay when active */}
      {/* Desktop: Show as fixed sidebar */}
      {showConversationList && (
        <div
          className={`
            ${isMobileView ? "absolute inset-0 z-20 bg-white" : "w-80 border-r border-gray-200 flex-shrink-0"}
          `}
        >
          <ConversationList />
        </div>
      )}

      {/* Chat Area */}
      {showChatArea && (
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <ChatHeader
                name={
                  otherUser?.name ||
                  activeConversation.participants.map((p) => p.name).join(", ")
                }
                avatar={otherUser?.avatar}
                isOnline={otherUser?.isOnline}
                typingUsers={
                  activeConversationId
                    ? typingUsers[activeConversationId] || []
                    : []
                }
                participantMap={participantMap}
                onBack={isMobileView ? handleBack : undefined}
              />

              {/* Messages */}
              <ChatMessages
                messages={messages}
                currentUserId={currentUser.id}
                otherUser={otherUser}
              />

              {/* Message Input */}
              <MessageInput />
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center text-gray-400 p-4">
              <div className="text-center">
                <p className="text-6xl mb-4">💬</p>
                <p className="text-xl font-medium mb-2 text-gray-700">
                  Welcome to Chat
                </p>
                <p className="text-sm text-gray-500">
                  Select a conversation to start messaging
                </p>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-4">
                    Connecting to server...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
