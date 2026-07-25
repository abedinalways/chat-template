// app/providers.tsx
// Client-side providers: Redux store + Chat context.
// The notification permission request is handled inside useNotification
// (called by useChatSocket), so no separate permission component is needed.

'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ChatProvider } from '@/components/chat/ChatProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ChatProvider>{children}</ChatProvider>
    </Provider>
  );
}
