import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socket = io('http://localhost:5000');
      
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        socket.emit('join', { userId: user.uid });
      });

      socket.on('notification', (newNotification: Notification) => {
        setNotifications(prev => [newNotification, ...prev]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
    // TODO: Update read status on the server
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="relative">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500">No new notifications</p>
            ) : (
              <ul className="space-y-2">
                {notifications.map(notif => (
                  <li key={notif.id} className={`p-2 rounded ${notif.read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900'}`}>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs text-blue-500 mt-1 hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;