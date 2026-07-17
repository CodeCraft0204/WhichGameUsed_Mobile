import type { Router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { UserNotification } from '@/lib/notifications';
import {
  databaseCardHref,
  databaseWishlistHref,
  messageConversationHref,
  mostWantedContributionsHref,
  mostWantedDetailHref,
  mostWantedSolvedHref,
  publicProfileHref
} from '@/constants/navigation';
import {
  resolveLinkPath,
  resolvePushNotificationTarget,
  type NotificationNavTarget
} from '@/lib/notification-routing-resolve';

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

function navigateToTarget(router: Router, target: NotificationNavTarget): void {
  if (!target) return;
  switch (target.type) {
    case 'messages':
      router.push(messageConversationHref(target.conversationId));
      return;
    case 'profile':
      router.push(publicProfileHref(target.profileId));
      return;
    case 'database_card':
      router.push(databaseCardHref(target.cardId));
      return;
    case 'wishlist':
      router.push(databaseWishlistHref());
      return;
    case 'mw_contributions':
      router.push(mostWantedContributionsHref());
      return;
    case 'mw_solved':
      router.push(mostWantedSolvedHref());
      return;
    case 'mw_detail':
      router.push(mostWantedDetailHref(target.huntId));
      return;
  }
}

export function openNotificationTarget(router: Router, item: UserNotification): void {
  navigateToTarget(router, resolveLinkPath(item.link_path));
}

export function openPushNotificationData(
  router: Router,
  data: Record<string, unknown>
): void {
  navigateToTarget(router, resolvePushNotificationTarget(data));
}
