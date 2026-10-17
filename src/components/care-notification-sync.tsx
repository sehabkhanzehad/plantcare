import { useEffect } from 'react';

import { useCarePreferences } from '@/context/care-preferences';
import { usePlants } from '@/context/plants';
import { syncCareNotifications } from '@/lib/care-notifications';

export function CareNotificationSync() {
  const { plants, isLoading } = usePlants();
  const { reminderHour, reminderMinute, isLoading: prefsLoading } = useCarePreferences();

  useEffect(() => {
    if (isLoading || prefsLoading) return;
    syncCareNotifications(plants, reminderHour, reminderMinute).catch(() => {
      /* permissions denied or simulator limitation */
    });
  }, [isLoading, plants, prefsLoading, reminderHour, reminderMinute]);

  return null;
}
