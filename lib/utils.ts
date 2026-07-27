// lib/utils.ts
// Shared utility functions used across the application.
// Centralizes common operations to avoid code duplication.

/**
 * Format a timestamp to a human-readable time string.
 * 
 * @param timestamp - ISO timestamp string or Date object
 * @returns Formatted time string (e.g., "2:30 PM")
 * 
 * @example
 * ```typescript
 * const time = formatTime("2024-01-15T14:30:00Z");
 * // Output: "2:30 PM"
 * ```
 */
export function formatTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a timestamp to a human-readable date string.
 * 
 * @param timestamp - ISO timestamp string or Date object
 * @returns Formatted date string (e.g., "Mon, Jan 15, 2024")
 * 
 * @example
 * ```typescript
 * const date = formatDate("2024-01-15T14:30:00Z");
 * // Output: "Mon, Jan 15, 2024"
 * ```
 */
export function formatDate(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Generate a unique ID for messages, notifications, etc.
 * Uses timestamp + random string for uniqueness.
 * 
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 * 
 * @example
 * ```typescript
 * const messageId = generateUniqueId('msg');
 * // Output: "msg-1705312800000-a1b2c3"
 * ```
 */
export function generateUniqueId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Truncate a string to a maximum length and add ellipsis.
 * 
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 * 
 * @example
 * ```typescript
 * truncateText("Hello World", 8);
 * // Output: "Hello..."
 * ```
 */
export function truncateText(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Check if the current environment is the browser (not SSR).
 * 
 * @returns true if running in the browser, false if server-side
 * 
 * @example
 * ```typescript
 * if (isBrowser()) {
 *   // Use browser-only APIs
 *   window.addEventListener('resize', handler);
 * }
 * ```
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safely access localStorage with a fallback value.
 * 
 * @param key - The localStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns The stored value or default value
 * 
 * @example
 * ```typescript
 * const theme = safeLocalStorage('theme', 'light');
 * ```
 */
export function safeLocalStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely set a value in localStorage.
 * 
 * @param key - The localStorage key
 * @param value - The value to store (will be JSON stringified)
 * 
 * @example
 * ```typescript
 * safeLocalStorageSet('user', { id: '123', name: 'John' });
 * ```
 */
export function safeLocalStorageSet(key: string, value: unknown): void {
  if (!isBrowser()) return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[utils] Failed to set localStorage key "${key}":`, error);
  }
}

/**
 * Debounce a function call to limit how often it executes.
 * 
 * @param func - The function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching:', query);
 * }, 300);
 * 
 * debouncedSearch('hello'); // Will execute after 300ms
 * debouncedSearch('world'); // Will reset the timer
 * ```
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}