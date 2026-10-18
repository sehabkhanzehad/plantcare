import { useCallback, useEffect, useMemo } from 'react';

import { useStorageState } from '@/hooks/use-storage-state';

const PREFS_KEY = 'plantcare_plants_ui';

export type PlantsViewMode = 'grid' | 'list';

type StoredPlantsUiPrefs = {
  viewMode: PlantsViewMode;
};

const DEFAULT: StoredPlantsUiPrefs = { viewMode: 'grid' };

function parsePrefs(raw: string | null): StoredPlantsUiPrefs {
  if (!raw) return DEFAULT;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredPlantsUiPrefs>;
    if (parsed.viewMode === 'grid' || parsed.viewMode === 'list') {
      return { viewMode: parsed.viewMode };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

export function usePlantsUiPrefs() {
  const [[isLoading, raw], setRaw] = useStorageState(PREFS_KEY);

  useEffect(() => {
    if (isLoading) return;
    if (raw == null) {
      setRaw(JSON.stringify(DEFAULT));
    }
  }, [isLoading, raw, setRaw]);

  const prefs = useMemo(() => parsePrefs(raw), [raw]);

  const setViewMode = useCallback(
    (viewMode: PlantsViewMode) => {
      setRaw(JSON.stringify({ viewMode }));
    },
    [setRaw],
  );

  return { viewMode: prefs.viewMode, setViewMode, isLoading };
}
