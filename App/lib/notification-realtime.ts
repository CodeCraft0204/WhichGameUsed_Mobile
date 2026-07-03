import { supabase } from '@/lib/supabase';
import type { UserNotification } from '@/lib/notifications';

type NotificationListener = (notification: UserNotification) => void;

let channel: ReturnType<typeof supabase.channel> | null = null;
let userId: string | null = null;
const listeners = new Set<NotificationListener>();

function mapRow(row: Record<string, unknown>): UserNotification {
  return {
    id: row.id as string,
    kind: row.kind as string,
    title: row.title as string,
    body: (row.body as string | null) ?? null,
    link_path: (row.link_path as string | null) ?? null,
    read_at: (row.read_at as string | null) ?? null,
    created_at: row.created_at as string
  };
}

function emit(notification: UserNotification) {
  for (const listener of listeners) listener(notification);
}

export function subscribeUserNotifications(nextUserId: string, onInsert: NotificationListener): () => void {
  listeners.add(onInsert);

  if (userId !== nextUserId) {
    if (channel) {
      void supabase.removeChannel(channel);
      channel = null;
    }
    userId = nextUserId;

    channel = supabase
      .channel(`user-notifications:${nextUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${nextUserId}`
        },
        (payload) => {
          if (!payload.new) return;
          emit(mapRow(payload.new as Record<string, unknown>));
        }
      )
      .subscribe();
  }

  return () => {
    listeners.delete(onInsert);
    if (listeners.size === 0 && channel) {
      void supabase.removeChannel(channel);
      channel = null;
      userId = null;
    }
  };
}
