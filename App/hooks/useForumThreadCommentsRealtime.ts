import { useEffect } from 'react';
import { subscribeForumThreadComments } from '@/lib/forum';

export function useForumThreadCommentsRealtime(
  threadId: string | undefined,
  onCommentsChange: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled || !threadId) return;
    return subscribeForumThreadComments(threadId, onCommentsChange);
  }, [enabled, threadId, onCommentsChange]);
}
