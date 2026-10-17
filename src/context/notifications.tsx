import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type PropsWithChildren,
} from 'react';

import { usePlants } from '@/context/plants';
import { useStorageState } from '@/hooks/use-storage-state';
import {
  getFertilizerStatus,
  getWaterStatus,
  isCarePaused,
  dateKey,
} from '@/lib/care';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: 'care' | 'system' | 'order';
  createdAt: string;
  plantId?: string;
};

type AddNotificationInput = {
  title: string;
  message: string;
  type: 'system' | 'order';
};

type NotificationsContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  isRead: (id: string) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (input: AddNotificationInput) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);
const READ_KEY = 'plantcare_read_notifications';
const EXTRA_KEY = 'plantcare_extra_notifications';

function parseList<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useNotifications() {
  const value = useContext(NotificationsContext);
  if (!value) {
    throw new Error('useNotifications must be wrapped in a <NotificationsProvider />');
  }
  return value;
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const { plants } = usePlants();
  const [[isReadLoading, raw], setRaw] = useStorageState(READ_KEY);
  const [[isExtraLoading, extraRaw], setExtraRaw] = useStorageState(EXTRA_KEY);

  const readIds = useMemo<string[]>(() => parseList<string>(raw), [raw]);

  useEffect(() => {
    if (isExtraLoading) return;
    if (extraRaw == null) {
      setExtraRaw(JSON.stringify([]));
    }
  }, [extraRaw, isExtraLoading, setExtraRaw]);

  const extraNotifications = useMemo<AppNotification[]>(
    () => parseList<AppNotification>(extraRaw),
    [extraRaw],
  );

  const notifications = useMemo<AppNotification[]>(() => {
    const today = dateKey(new Date());
    const careNotifications: AppNotification[] = [];

    for (const plant of plants) {
      if (plant.reminderEnabled === false) continue;
      if (isCarePaused(plant, today)) continue;

      const water = getWaterStatus(plant, today);
      if (water !== 'Healthy') {
        careNotifications.push({
          id: `care-water-${plant.id}-${water}`,
          title: water === 'Overdue' ? 'Watering overdue' : 'Watering reminder',
          message:
            water === 'Overdue'
              ? `${plant.name} needs water as soon as possible.`
              : `${plant.name} is ready for its next watering.`,
          type: 'care',
          createdAt: new Date().toISOString(),
          plantId: plant.id,
        });
      }

      const feed = getFertilizerStatus(plant, today);
      if (feed !== 'Healthy') {
        careNotifications.push({
          id: `care-feed-${plant.id}-${feed}`,
          title: feed === 'Overdue' ? 'Fertilizer overdue' : 'Fertilizer reminder',
          message:
            feed === 'Overdue'
              ? `${plant.name} is overdue for feeding.`
              : `${plant.name} could use fertilizer soon.`,
          type: 'care',
          createdAt: new Date().toISOString(),
          plantId: plant.id,
        });
      }
    }

    return [...extraNotifications, ...careNotifications].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }, [extraNotifications, plants]);

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

  const addNotification = useCallback(
    (input: AddNotificationInput) => {
      const next: AppNotification = {
        id: `extra-${Date.now()}`,
        title: input.title,
        message: input.message,
        type: input.type,
        createdAt: new Date().toISOString(),
      };
      setExtraRaw(JSON.stringify([next, ...extraNotifications]));
    },
    [extraNotifications, setExtraRaw],
  );

  const isLoading = isReadLoading || isExtraLoading;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount: isLoading ? 0 : notifications.filter((item) => !readIds.includes(item.id)).length,
        isRead: (id) => readIds.includes(id),
        markAsRead,
        markAllAsRead,
        addNotification,
      }}>
      {children}
    </NotificationsContext.Provider>
  );
}
