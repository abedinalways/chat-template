// redux/store.ts
// Redux store configuration with RTK Query middleware.

import { configureStore } from '@reduxjs/toolkit';
import { chatApi } from './api/chat/chatApi';
import chatReducer from './api/chat/chatSlice';

export const store = configureStore({
  reducer: {
    // Chat state (active conversation, typing, unread counts, notifications)
    chat: chatReducer,

    // RTK Query API reducer
    [chatApi.reducerPath]: chatApi.reducer,
  },

  // Add RTK Query middleware for caching and auto-refetching
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatApi.middleware),
});

// Infer types from the store for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Selector type helper
export type TypedSelector<T> = (state: RootState) => T;
