import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
  id: number;
  text: string;
  timestamp: number; // Store raw timestamp
  read: boolean;
}

export interface DisplayNotification extends Notification {
  time: string; // Display string (e.g., "5 min ago")
}

interface NotificationContextType {
  notifications: DisplayNotification[];
  unreadCount: number;
  addNotification: (text: string) => void;
  markAllRead: () => void;
  markAsRead: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

const getRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
  return `${Math.floor(diffInSeconds / 86400)} day ago`;
};

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: "New user registered", timestamp: Date.now() - 5 * 60 * 1000, read: false },
    { id: 2, text: "Sales report available", timestamp: Date.now() - 60 * 60 * 1000, read: false },
    { id: 3, text: "System update scheduled", timestamp: Date.now() - 2 * 60 * 60 * 1000, read: true },
  ]);
  const [, setNow] = useState(Date.now());

  // Update relative time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Reset notifications when user changes (login/logout)
  useEffect(() => {
    setNotifications([
      { id: 1, text: "New user registered", timestamp: Date.now() - 5 * 60 * 1000, read: false },
      { id: 2, text: "Sales report available", timestamp: Date.now() - 60 * 60 * 1000, read: false },
      { id: 3, text: "System update scheduled", timestamp: Date.now() - 2 * 60 * 60 * 1000, read: true },
    ]);
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (text: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      text,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const displayNotifications: DisplayNotification[] = notifications.map(n => ({
    ...n,
    time: getRelativeTime(n.timestamp)
  }));

  const value = {
    notifications: displayNotifications,
    unreadCount,
    addNotification,
    markAllRead,
    markAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
