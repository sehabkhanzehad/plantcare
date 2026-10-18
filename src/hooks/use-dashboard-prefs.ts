import { useCallback, useEffect, useMemo } from 'react';

import { useStorageState } from '@/hooks/use-storage-state';

const PREFS_KEY = 'plantcare_dashboard_prefs';

export type CareChartRange = 'week' | 'month';

type StoredDashboardPrefs = {
  careChartRange: CareChartRange;
};

const DEFAULT: StoredDashboardPrefs = { careChartRange: 'week' };

function parsePrefs(raw: string | null): StoredDashboardPrefs {
  if (!raw) return DEFAULT;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredDashboardPrefs>;
    if (parsed.careChartRange === 'week' || parsed.careChartRange === 'month') {
      return { careChartRange: parsed.careChartRange };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

export function useDashboardPrefs() {
  const [[isLoading, raw], setRaw] = useStorageState(PREFS_KEY);

  useEffect(() => {
    if (isLoading) return;
    if (raw == null) {
      setRaw(JSON.stringify(DEFAULT));
    }
  }, [isLoading, raw, setRaw]);

  const prefs = useMemo(() => parsePrefs(raw), [raw]);

  const setCareChartRange = useCallback(
    (careChartRange: CareChartRange) => {
      setRaw(JSON.stringify({ careChartRange }));
    },
    [setRaw],
  );

  return { careChartRange: prefs.careChartRange, setCareChartRange, isLoading };
}
