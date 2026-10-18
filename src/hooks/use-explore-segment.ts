import { useCallback, useEffect, useMemo } from 'react';

import { useStorageState } from '@/hooks/use-storage-state';

const SEGMENT_KEY = 'plantcare_explore_segment';

export type ExploreSegment = 'community' | 'shop';

const DEFAULT: ExploreSegment = 'community';

function parseSegment(raw: string | null): ExploreSegment {
  return raw === 'shop' || raw === 'community' ? raw : DEFAULT;
}

export function useExploreSegment() {
  const [[isLoading, raw], setRaw] = useStorageState(SEGMENT_KEY);

  useEffect(() => {
    if (isLoading) return;
    if (raw == null) {
      setRaw(DEFAULT);
    }
  }, [isLoading, raw, setRaw]);

  const segment = useMemo(() => parseSegment(raw), [raw]);

  const setSegment = useCallback(
    (next: ExploreSegment) => {
      setRaw(next);
    },
    [setRaw],
  );

  return { segment, setSegment, isLoading };
}
