// lib/auth.ts
// Centralized authentication utilities.
// Single source of truth for retrieving user and token from storage.

/**
 * Safely retrieve the current user's ID from localStorage.
 * SSR-safe: returns null on the server side.
 */
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userId');
}

/**
 * Safely retrieve the auth token from localStorage.
 * SSR-safe: returns null on the server side.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Check if user is authenticated (has both token and userId).
 */
export function isAuthenticated(): boolean {
  return !!(getAuthToken() && getCurrentUserId());
}

/**
 * Clear all auth data from localStorage (for logout).
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
}