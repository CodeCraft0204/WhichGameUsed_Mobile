import { useEffect, useRef } from 'react';
import { subscribeMostWantedChanges } from '@/lib/most-wanted';

const DEBOUNCE_MS = 800;

export function useMostWantedRealtime(onRefresh: () => void, enabled = true) {
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

    const unsubscribe = subscribeMostWantedChanges(scheduleRefresh);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      unsubscribe();
    };
  }, [enabled]);
}
