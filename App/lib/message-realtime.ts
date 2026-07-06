import { supabase } from '@/lib/supabase';

type VoidListener = () => void;

let inboxChannel: ReturnType<typeof supabase.channel> | null = null;
let inboxUserId: string | null = null;
const inboxListeners = new Set<VoidListener>();

let threadChannel: ReturnType<typeof supabase.channel> | null = null;
let threadConversationId: string | null = null;
const threadListeners = new Map<string, Set<VoidListener>>();

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

const emitInbox = debounce(() => {
  for (const listener of inboxListeners) listener();
}, 350);

function emitThread(conversationId: string) {
  const listeners = threadListeners.get(conversationId);
  if (!listeners) return;
  for (const listener of listeners) listener();
}

export function subscribeConversationInbox(userId: string, onChange: VoidListener): () => void {
  inboxListeners.add(onChange);

  if (inboxUserId !== userId) {
    if (inboxChannel) {
      void supabase.removeChannel(inboxChannel);
      inboxChannel = null;
    }
    inboxUserId = userId;

    inboxChannel = supabase
      .channel(`messages-inbox:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'collector_conversations' },
        () => emitInbox()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'collector_messages' },
        () => emitInbox()
      )
      .subscribe();
  }

  return () => {
    inboxListeners.delete(onChange);
    if (inboxListeners.size === 0 && inboxChannel) {
      void supabase.removeChannel(inboxChannel);
      inboxChannel = null;
      inboxUserId = null;
    }
  };
}

export function subscribeConversationThread(
  conversationId: string,
  onChange: VoidListener
): () => void {
  if (!threadListeners.has(conversationId)) {
    threadListeners.set(conversationId, new Set());
  }
  threadListeners.get(conversationId)!.add(onChange);

  if (threadConversationId !== conversationId) {
    if (threadChannel) {
      void supabase.removeChannel(threadChannel);
      threadChannel = null;
    }
    threadConversationId = conversationId;

    threadChannel = supabase
      .channel(`messages-thread:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collector_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => emitThread(conversationId)
      )
      .subscribe();
  }

  return () => {
    const listeners = threadListeners.get(conversationId);
    listeners?.delete(onChange);
    if (listeners && listeners.size === 0) {
      threadListeners.delete(conversationId);
    }
    if (threadListeners.size === 0 && threadChannel) {
      void supabase.removeChannel(threadChannel);
      threadChannel = null;
      threadConversationId = null;
    }
  };
}
