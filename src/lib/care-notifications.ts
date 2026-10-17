import { Platform } from 'react-native';

import type { Plant } from '@/context/plants';
import {
  addDays,
  dateKey,
  getFertilizerStatus,
  getWaterStatus,
  isCarePaused,
} from '@/lib/care';

type ExpoNotifications = typeof import('expo-notifications');

let handlerConfigured = false;

async function loadNotifications(): Promise<ExpoNotifications | null> {
  if (Platform.OS === 'web') return null;
  try {
    const Notifications = await import('expo-notifications');
    if (!handlerConfigured) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      handlerConfigured = true;
    }
    return Notifications;
  } catch {
    return null;
  }
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function ensureAndroidChannel(Notifications: ExpoNotifications) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('care-reminders', {
      name: 'Care reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

function waterNotificationId(plantId: string) {
  return `water-${plantId}`;
}

function feedNotificationId(plantId: string) {
  return `feed-${plantId}`;
}

function nextDueDateForWater(plant: Plant, today = dateKey(new Date())): string | null {
  const status = getWaterStatus(plant, today);
  if (status === 'Healthy') {
    const daysUntil = plant.wateringFrequency - Math.max(0, daysSinceWater(plant, today));
    return addDays(today, Math.max(1, daysUntil));
  }
  return today;
}

function daysSinceWater(plant: Plant, today: string): number {
  const start = new Date(`${plant.lastWatered}T00:00:00`).getTime();
  const end = new Date(`${today}T00:00:00`).getTime();
  return Math.floor((end - start) / 86400000);
}

function nextDueDateForFeed(plant: Plant, today = dateKey(new Date())): string | null {
  if (!plant.fertilizingFrequency || plant.fertilizingFrequency < 1) return null;
  const status = getFertilizerStatus(plant, today);
  const last = plant.lastFertilized ?? plant.createdAt.split('T')[0];
  if (status === 'Healthy') {
    const elapsed = Math.floor(
      (new Date(`${today}T00:00:00`).getTime() - new Date(`${last}T00:00:00`).getTime()) /
        86400000,
    );
    const daysUntil = plant.fertilizingFrequency - elapsed;
    return addDays(today, Math.max(1, daysUntil));
  }
  return today;
}

function triggerAt(dueDate: string, hour: number, minute: number): Date {
  const date = new Date(`${dueDate}T00:00:00`);
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

async function scheduleOne(
  Notifications: ExpoNotifications,
  identifier: string,
  title: string,
  body: string,
  plantId: string,
  fireDate: Date,
) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      data: { plantId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
    },
  });
}

export async function syncCareNotifications(
  plants: Plant[],
  reminderHour: number,
  reminderMinute: number,
): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  const granted = await ensureNotificationPermissions();
  if (!granted) return;
  await ensureAndroidChannel(Notifications);

  const today = dateKey(new Date());
  const activeIds = new Set<string>();

  for (const plant of plants) {
    if (plant.reminderEnabled === false) continue;
    if (isCarePaused(plant, today)) continue;

    const waterDue = nextDueDateForWater(plant, today);
    if (waterDue) {
      const id = waterNotificationId(plant.id);
      activeIds.add(id);
      await scheduleOne(
        Notifications,
        id,
        'Watering reminder',
        `${plant.name} is ready for water.`,
        plant.id,
        triggerAt(waterDue, reminderHour, reminderMinute),
      );
    }

    const feedDue = nextDueDateForFeed(plant, today);
    if (feedDue) {
      const id = feedNotificationId(plant.id);
      activeIds.add(id);
      await scheduleOne(
        Notifications,
        id,
        'Fertilizer reminder',
        `${plant.name} could use feeding.`,
        plant.id,
        triggerAt(feedDue, reminderHour, reminderMinute),
      );
    }
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const item of scheduled) {
    const id = item.identifier;
    if ((id.startsWith('water-') || id.startsWith('feed-')) && !activeIds.has(id)) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }
}

export async function cancelPlantNotifications(plantId: string) {
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(waterNotificationId(plantId));
  await Notifications.cancelScheduledNotificationAsync(feedNotificationId(plantId));
}

export async function addNotificationResponseListener(
  onPlantId: (plantId: string) => void,
): Promise<() => void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return () => undefined;

  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const plantId = response.notification.request.content.data?.plantId;
    if (typeof plantId === 'string') {
      onPlantId(plantId);
    }
  });
  return () => subscription.remove();
}
