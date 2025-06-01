'use client';

import { useState, useEffect } from 'react';
import { useEventListener } from '../hooks/useEventBus';
import { CheckCircle, XCircle, X, AlertTriangle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  component: string;
  timestamp: Date;
}

export default function GlobalNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Listen to success messages
  useEventListener('SUCCESS_MESSAGE', ({ message, component }) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'success',
      message,
      component,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  });

  // Listen to error messages
  useEventListener('ERROR_OCCURRED', ({ error, component }) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'error',
      message: error,
      component,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 7 seconds (longer for errors)
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 7000);
  });

  // Listen to warning messages
  useEventListener('WARNING_MESSAGE', ({ message, component }) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'warning',
      message,
      component,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 6 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 6000);
  });

  // Listen to info messages
  useEventListener('INFO_MESSAGE', ({ message, component }) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'info',
      message,
      component,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 4000);
  });

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`min-w-80 max-w-md p-4 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : notification.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : notification.type === 'error' ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : notification.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ) : (
                <Info className="w-5 h-5 text-blue-500" />
              )}
            </div>
            
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {notification.message}
                </p>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs opacity-75 mt-1">
                {notification.component} • {notification.timestamp.toLocaleTimeString('de-DE')}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
} 