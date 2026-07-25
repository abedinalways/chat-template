// app/providers.tsx
// Client-side providers: Redux store + Chat context.
// Also requests browser notification permission on mount.

'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ChatProvider } from '@/components/chat/ChatProvider';
import { requestNotificationPermission } from '@/lib/notification';

export function Providers({ children }: { children: React.ReactNode }) {
  // Request notification permission when the app loads
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }
  }, []);

  return (
    <Provider store={store}>
      <ChatProvider>{children}</ChatProvider>
    </Provider>
  );
}
