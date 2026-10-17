import { useCallback, useMemo } from 'react';

import { useStorageState } from '@/hooks/use-storage-state';

const BOOKMARKS_KEY = 'plantcare_bookmarked_posts';

export function useBookmarkedPosts() {
  const [[isLoading, raw], setRaw] = useStorageState(BOOKMARKS_KEY);

  const ids = useMemo<string[]>(() => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [raw]);

  const toggleBookmark = useCallback(
    (postId: string) => {
      const next = ids.includes(postId)
        ? ids.filter((id) => id !== postId)
        : [...ids, postId];
      setRaw(JSON.stringify(next));
    },
    [ids, setRaw],
  );

  const isBookmarked = useCallback((postId: string) => ids.includes(postId), [ids]);

  return { ids, toggleBookmark, isBookmarked, isLoading };
}
