// redux/api/chat/chatApi.ts
// RTK Query API for chat REST endpoints.
// Socket events are handled separately in useChatSocket.ts.

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Message, Conversation } from "@/types/chat";

import { getAuthToken } from "@/lib/auth";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Conversations", "Messages"],
  endpoints: (builder) => ({
    // 1️⃣ Get all conversations for the current user
    getConversations: builder.query<Conversation[], void>({
      query: () => "/chat/conversations",
      providesTags: ["Conversations"],
    }),

    // 2️⃣ Get messages for a specific conversation
    getMessages: builder.query<Message[], { conversationId: string }>({
      query: ({ conversationId }) =>
        `/chat/messages?conversationId=${conversationId}`,
      providesTags: (result, error, { conversationId }) => [
        { type: "Messages", id: conversationId },
      ],
    }),

    // 3️⃣ Send a message (also emitted via socket for real-time delivery)
    sendMessage: builder.mutation<
      Message,
      {
        conversationId: string;
        receiverId?: string;
        content: string;
        type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
      }
    >({
      query: (body) => {
        const { receiverId, ...rest } = body;
        const cleanBody = receiverId ? { ...rest, receiverId } : rest;
        return {
          url: "/chat/messages",
          method: "POST",
          body: cleanBody,
        };
      },
      // Invalidate cache so the new message appears in the list
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Messages", id: conversationId },
        "Conversations",
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;
