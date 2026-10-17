import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';

import { useStorageState } from '@/hooks/use-storage-state';

type CarePreferencesValue = {
  reminderHour: number;
  reminderMinute: number;
  setReminderTime: (hour: number, minute: number) => void;
  isLoading: boolean;
};

const CarePreferencesContext = createContext<CarePreferencesValue | null>(null);
const PREFS_KEY = 'plantcare_care_prefs';

type StoredPrefs = {
  reminderHour: number;
  reminderMinute: number;
};

const DEFAULT: StoredPrefs = { reminderHour: 8, reminderMinute: 0 };

export function useCarePreferences() {
  const value = useContext(CarePreferencesContext);
  if (!value) {
    throw new Error('useCarePreferences must be wrapped in <CarePreferencesProvider />');
  }
  return value;
}

export function CarePreferencesProvider({ children }: PropsWithChildren) {
  const [[isLoading, raw], setRaw] = useStorageState(PREFS_KEY);

  const prefs = useMemo<StoredPrefs>(() => {
    if (!raw) return DEFAULT;
    try {
      const parsed = JSON.parse(raw) as StoredPrefs;
      if (
        typeof parsed.reminderHour === 'number' &&
        typeof parsed.reminderMinute === 'number'
      ) {
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return DEFAULT;
  }, [raw]);

  const setReminderTime = useCallback(
    (hour: number, minute: number) => {
      setRaw(JSON.stringify({ reminderHour: hour, reminderMinute: minute }));
    },
    [setRaw],
  );

  return (
    <CarePreferencesContext.Provider
      value={{
        reminderHour: prefs.reminderHour,
        reminderMinute: prefs.reminderMinute,
        setReminderTime,
        isLoading,
      }}>
      {children}
    </CarePreferencesContext.Provider>
  );
}
