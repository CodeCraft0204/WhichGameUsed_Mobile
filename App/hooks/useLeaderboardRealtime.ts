import { useEffect, useRef } from 'react';
import { subscribeLeaderboardChanges } from '@/lib/leaderboard';

const DEBOUNCE_MS = 800;

/** Re-fetch rankings when leaderboard_events change (debounced). */
export function useLeaderboardRealtime(onRefresh: () => void, enabled = true) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!enabled) return;

    const scheduleRefresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onRefreshRef.current();
      }, DEBOUNCE_MS);
    };

    const unsubscribe = subscribeLeaderboardChanges(scheduleRefresh);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      unsubscribe();
    };
  }, [enabled]);
}
