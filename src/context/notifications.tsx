import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react';

import { usePlants } from '@/context/plants';
import { useStorageState } from '@/hooks/use-storage-state';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: 'care' | 'system';
  createdAt: string;
  plantId?: string;
};

type NotificationsContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  isRead: (id: string) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);
const READ_KEY = 'plantcare_read_notifications';

export function useNotifications() {
  const value = useContext(NotificationsContext);
  if (!value) {
    throw new Error('useNotifications must be wrapped in a <NotificationsProvider />');
  }
  return value;
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const { plants } = usePlants();
  const [[isLoading, raw], setRaw] = useStorageState(READ_KEY);
  const readIds = useMemo<string[]>(() => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [raw]);

  const notifications = useMemo<AppNotification[]>(() => {
    const careNotifications = plants
      .filter((plant) => plant.status !== 'Healthy' && plant.reminderEnabled !== false)
      .map((plant) => ({
        id: `care-${plant.id}-${plant.status}`,
        title: plant.status === 'Overdue' ? 'Watering overdue' : 'Care reminder',
        message:
          plant.status === 'Overdue'
            ? `${plant.name} needs water as soon as possible.`
            : `${plant.name} is ready for its next watering.`,
        type: 'care' as const,
        createdAt: new Date().toISOString(),
        plantId: plant.id,
      }));

    return careNotifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [plants]);

  const markAsRead = useCallback(
    (id: string) => {
      if (!readIds.includes(id)) {
        setRaw(JSON.stringify([...readIds, id]));
      }
    },
    [readIds, setRaw],
  );

  const markAllAsRead = useCallback(() => {
    setRaw(JSON.stringify(Array.from(new Set([...readIds, ...notifications.map((item) => item.id)]))));
  }, [notifications, readIds, setRaw]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount: isLoading ? 0 : notifications.filter((item) => !readIds.includes(item.id)).length,
        isRead: (id) => readIds.includes(id),
        markAsRead,
        markAllAsRead,
      }}>
      {children}
    </NotificationsContext.Provider>
  );
}
