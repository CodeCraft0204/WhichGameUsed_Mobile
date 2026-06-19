import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FORUM_CLAP_DEBOUNCE_MS,
  FORUM_CLAP_HOLD_INTERVAL_MS,
  FORUM_MAX_CLAPS_PER_USER
} from '@/constants/discussionContent';
import { addForumThreadClaps } from '@/lib/forum';

type ClapBubble = { id: number; key: number };

type UseThreadClapsOptions = {
  threadId: string;
  initialTotalClaps: number;
  initialUserClaps: number;
  enabled?: boolean;
  onSynced?: (state: { total_claps: number; user_clap_count: number }) => void;
  onError?: (message: string) => void;
};

export function useThreadClaps({
  threadId,
  initialTotalClaps,
  initialUserClaps,
  enabled = true,
  onSynced,
  onError
}: UseThreadClapsOptions) {
  const [displayTotal, setDisplayTotal] = useState(initialTotalClaps);
  const [displayUser, setDisplayUser] = useState(initialUserClaps);
  const [bubbles, setBubbles] = useState<ClapBubble[]>([]);
  const [syncing, setSyncing] = useState(false);

  const pendingDeltaRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bubbleIdRef = useRef(0);
  const displayUserRef = useRef(initialUserClaps);
  const displayTotalRef = useRef(initialTotalClaps);

  useEffect(() => {
    setDisplayTotal(initialTotalClaps);
    setDisplayUser(initialUserClaps);
    displayTotalRef.current = initialTotalClaps;
    displayUserRef.current = initialUserClaps;
    pendingDeltaRef.current = 0;
  }, [threadId, initialTotalClaps, initialUserClaps]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (holdRef.current) clearInterval(holdRef.current);
    };
  }, []);

  const spawnBubble = useCallback(() => {
    const id = bubbleIdRef.current++;
    setBubbles((prev) => [...prev, { id, key: id }]);
    setTimeout(() => {
      setBubbles((prev) => prev.filter((row) => row.id !== id));
    }, 700);
  }, []);

  const flushPending = useCallback(async () => {
    const delta = pendingDeltaRef.current;
    if (delta <= 0) return;

    pendingDeltaRef.current = 0;
    setSyncing(true);

    const rollbackTotal = displayTotalRef.current;
    const rollbackUser = displayUserRef.current;

    const { error, total_claps, user_clap_count, claps_added } = await addForumThreadClaps(
      threadId,
      delta
    );

    setSyncing(false);

    if (error) {
      const restoredTotal = rollbackTotal - delta;
      const restoredUser = rollbackUser - delta;
      displayTotalRef.current = restoredTotal;
      displayUserRef.current = restoredUser;
      setDisplayTotal(restoredTotal);
      setDisplayUser(restoredUser);
      pendingDeltaRef.current = delta;
      onError?.(error);
      return;
    }

    if (claps_added != null && claps_added < delta) {
      const diff = delta - claps_added;
      const adjustedTotal = displayTotalRef.current - diff;
      const adjustedUser = displayUserRef.current - diff;
      displayTotalRef.current = adjustedTotal;
      displayUserRef.current = adjustedUser;
      setDisplayTotal(adjustedTotal);
      setDisplayUser(adjustedUser);
    }

    if (total_claps != null && user_clap_count != null) {
      displayTotalRef.current = total_claps;
      displayUserRef.current = user_clap_count;
      setDisplayTotal(total_claps);
      setDisplayUser(user_clap_count);
      onSynced?.({ total_claps, user_clap_count });
    }
  }, [onError, onSynced, threadId]);

  const scheduleFlush = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void flushPending();
    }, FORUM_CLAP_DEBOUNCE_MS);
  }, [flushPending]);

  const addLocalClap = useCallback(() => {
    if (!enabled) return false;
    if (displayUserRef.current >= FORUM_MAX_CLAPS_PER_USER) return false;

    displayUserRef.current += 1;
    displayTotalRef.current += 1;
    setDisplayUser(displayUserRef.current);
    setDisplayTotal(displayTotalRef.current);
    pendingDeltaRef.current += 1;
    spawnBubble();
    scheduleFlush();
    return true;
  }, [enabled, scheduleFlush, spawnBubble]);

  const onPressIn = useCallback(() => {
    if (!enabled) return;
    addLocalClap();
    if (displayUserRef.current >= FORUM_MAX_CLAPS_PER_USER) return;
    if (holdRef.current) clearInterval(holdRef.current);
    holdRef.current = setInterval(() => {
      const added = addLocalClap();
      if (!added && holdRef.current) {
        clearInterval(holdRef.current);
        holdRef.current = null;
      }
    }, FORUM_CLAP_HOLD_INTERVAL_MS);
  }, [addLocalClap, enabled]);

  const onPressOut = useCallback(() => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  }, []);

  return {
    displayTotal,
    displayUser,
    bubbles,
    syncing,
    maxed: displayUser >= FORUM_MAX_CLAPS_PER_USER,
    onPressIn,
    onPressOut
  };
}
