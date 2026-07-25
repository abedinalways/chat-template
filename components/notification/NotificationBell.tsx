import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';




interface NotificationBellProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationBell({
  position = 'top-right',
  className = '',
  onNotificationClick,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unread,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotification();

  // ✅ Update unread count
  useEffect(() => {
    setUnreadCount(unread);
  }, [unread]);

  // ✅ Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Keyboard shortcut (Alt + N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // ✅ Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  // ✅ Get position classes
  const getPositionClasses = () => {
    const positions = {
      'top-right': 'right-0 mt-2',
      'top-left': 'left-0 mt-2',
      'bottom-right': 'right-0 mb-2 bottom-full',
      'bottom-left': 'left-0 mb-2 bottom-full',
    };
    return positions[position] || positions['top-right'];
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute ${getPositionClasses()} w-96 max-h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 z-50`}
        >
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={markAllAsRead}
            onDelete={deleteNotification}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
