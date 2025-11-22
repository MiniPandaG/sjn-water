// components/NotificationBell.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface NotificationCount {
  noLeidas: number;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchNotificationCount();
      
      // Opcional: Actualizar cada 30 segundos para notificaciones en tiempo real
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('/api/notificaciones?page=1&limit=1');
      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.pagination.noLeidas);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session || loading) {
    return (
      <div className="w-5 h-5 bg-gray-400/20 rounded-full animate-pulse"></div>
    );
  }

  return (
    <div className="relative">
      {notificationCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
          {notificationCount > 99 ? '99+' : notificationCount}
        </span>
      )}
    </div>
  );
}