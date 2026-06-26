import { useEffect, useState } from 'react';
import type { ContextHeaderMessage, ContextHeaderPageKey } from '@/constants/contextHeaderContent';
import {
  fetchContextHeaderMessages,
  getLocalContextHeaderMessages
} from '@/lib/context-header-content';

export function useContextHeaderMessages(pageKey: ContextHeaderPageKey): {
  messages: ContextHeaderMessage[];
  loading: boolean;
} {
  const [messages, setMessages] = useState<ContextHeaderMessage[]>(() =>
    getLocalContextHeaderMessages(pageKey)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setMessages(getLocalContextHeaderMessages(pageKey));

    void fetchContextHeaderMessages(pageKey).then((rows) => {
      if (!mounted) return;
      setMessages(rows);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [pageKey]);

  return { messages, loading };
}
