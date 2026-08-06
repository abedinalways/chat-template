// app/messages/page.tsx
// Dedicated messaging page with full chat interface.
// This page is separate from the main dashboard and home page.

'use client';

import React, { useState, useEffect } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { Loader } from '@/components/ui/Loader';
import type { User } from '@/types/chat';
import { getCurrentUserId, isAuthenticated, clearAuth } from '@/lib/auth';
import { safeLocalStorage } from '@/lib/utils';
import { setDemoMode } from '@/lib/demoData';

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current user from localStorage or auth state
    // Replace this with your actual auth implementation
    const loadUser = async () => {
      // Demo credentials for testing
      const DEMO_USER_ID = 'demo-user-123';
      const DEMO_TOKEN = 'demo-token-abc';

      // Credential check for messages section
      if (!isAuthenticated()) {
        // Auto-set demo credentials if none exist
        localStorage.setItem('userId', DEMO_USER_ID);
        localStorage.setItem('token', DEMO_TOKEN);
        setDemoMode(true);
      }

      const userId = getCurrentUserId();
      
      if (!userId) {
        clearAuth();
        window.location.href = '/';
        return;
      }

      // Try to get user data from localStorage
      // In a real app, you'd fetch this from your auth API
      const storedUser = safeLocalStorage<User | null>('currentUser', null);
      
      if (storedUser) {
        setCurrentUser(storedUser);
      } else {
        // Fallback: create a basic user object from stored data
        // Replace with actual user fetch from your backend
        setCurrentUser({
          id: userId,
          name: 'User',
          avatar: undefined,
          isOnline: true,
        });
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      window.location.href = '/';
    }
  }, [loading, currentUser]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-gray-100 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-screen w-full bg-gray-100">
      <ChatContainer currentUser={currentUser} />
    </div>
  );
}
