import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useStorageState } from '@/hooks/use-storage-state';

export type AppearanceMode = 'system' | 'light' | 'dark';

type AppearanceContextValue = {
  mode: AppearanceMode;
  setMode: (mode: AppearanceMode) => void;
  colorScheme: 'light' | 'dark';
};

export const AppearanceContext = createContext<AppearanceContextValue | null>(null);
const APPEARANCE_KEY = 'plantcare_appearance';

export function useAppearanceOptional() {
  return useContext(AppearanceContext);
}

export function useAppearance() {
  const value = useAppearanceOptional();
  if (!value) {
    throw new Error('useAppearance must be wrapped in <AppearanceProvider />');
  }
  return value;
}

export function AppearanceProvider({ children }: PropsWithChildren) {
  const system = useSystemColorScheme();
  const [[isLoading, raw], setRaw] = useStorageState(APPEARANCE_KEY);

  const mode: AppearanceMode =
    raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';

  const colorScheme = useMemo<'light' | 'dark'>(() => {
    if (mode === 'light') return 'light';
    if (mode === 'dark') return 'dark';
    return system === 'dark' ? 'dark' : 'light';
  }, [mode, system]);

  const setMode = useCallback(
    (next: AppearanceMode) => {
      setRaw(next);
    },
    [setRaw],
  );

  const resolvedScheme = isLoading
    ? system === 'dark'
      ? 'dark'
      : 'light'
    : colorScheme;

  return (
    <AppearanceContext.Provider
      value={{ mode, setMode, colorScheme: resolvedScheme }}>
      {children}
    </AppearanceContext.Provider>
  );
}
