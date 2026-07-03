import type { Router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { UserNotification } from '@/lib/notifications';
import {
  databaseCardHref,
  messageConversationHref,
  publicProfileHref
} from '@/constants/navigation';

export function subscribeUserNotifications(
  userId: string,
  onInsert: (row: UserNotification) => void
): () => void {
  const channel = supabase
    .channel(`user-notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onInsert(payload.new as UserNotification);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function openNotificationTarget(router: Router, item: UserNotification): void {
  const path = item.link_path?.trim();
  if (!path) return;

  if (path.startsWith('/messages/')) {
    const conversationId = path.replace('/messages/', '').split('/')[0];
    if (conversationId) router.push(messageConversationHref(conversationId));
    return;
  }

  if (path.startsWith('/profile/')) {
    const profileId = path.replace('/profile/', '').split('/')[0];
    if (profileId) router.push(publicProfileHref(profileId));
    return;
  }

  if (path.startsWith('/database/card/')) {
    const cardId = path.replace('/database/card/', '').split('/')[0];
    if (cardId) router.push(databaseCardHref(cardId));
  }
}

export function openPushNotificationData(
  router: Router,
  data: Record<string, unknown>
): void {
  const conversationId = typeof data.conversationId === 'string' ? data.conversationId : null;
  const actorId = typeof data.actorId === 'string' ? data.actorId : null;
  const kind = typeof data.kind === 'string' ? data.kind : null;

  if (kind === 'social_message' && conversationId) {
    router.push(messageConversationHref(conversationId));
    return;
  }
  if (kind === 'social_follower' && actorId) {
    router.push(publicProfileHref(actorId));
  }
}
