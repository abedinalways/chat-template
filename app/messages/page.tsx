// app/messages/page.tsx
// Dedicated messaging page with full chat interface.
// This page is separate from the main dashboard and home page.

'use client';

import React, { useState, useEffect } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { Loader } from '@/components/ui/Loader';
import type { User } from '@/types/chat';
import { getCurrentUserId } from '@/lib/auth';
import { safeLocalStorage } from '@/lib/utils';

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current user from localStorage or auth state
    // Replace this with your actual auth implementation
    const loadUser = async () => {
      const userId = getCurrentUserId();
      
      if (!userId) {
        // No user logged in - redirect to login or show placeholder
        setLoading(false);
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

  if (loading) {
    return (
      <div className="h-screen w-full bg-gray-100 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-screen w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Please log in to access messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-100">
      <ChatContainer currentUser={currentUser} />
    </div>
  );
}
