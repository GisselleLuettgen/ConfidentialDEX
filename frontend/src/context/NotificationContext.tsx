import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`glass-card p-4 rounded-xl border-l-4 max-w-md animate-fade-in ${
            notification.type === 'success'
              ? 'border-l-green-500'
              : notification.type === 'error'
              ? 'border-l-red-500'
              : notification.type === 'warning'
              ? 'border-l-yellow-500'
              : 'border-l-blue-500'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className={`font-semibold ${
                notification.type === 'success'
                  ? 'text-green-400'
                  : notification.type === 'error'
                  ? 'text-red-400'
                  : notification.type === 'warning'
                  ? 'text-yellow-400'
                  : 'text-blue-400'
              }`}>
                {notification.title}
              </h4>
              {notification.message && (
                <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-white ml-2"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};