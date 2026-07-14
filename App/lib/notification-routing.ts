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
    return;
  }

  if (path === '/database/wishlist' || path.startsWith('/database/wishlist')) {
    router.push(databaseWishlistHref());
    return;
  }

  if (path === '/mostwanted/contributions') {
    router.push(mostWantedContributionsHref());
    return;
  }

  if (path === '/mostwanted/solved') {
    router.push(mostWantedSolvedHref());
    return;
  }

  if (path.startsWith('/mostwanted/')) {
    const huntId = path.replace('/mostwanted/', '').split('/')[0];
    if (huntId && huntId !== 'contributions' && huntId !== 'solved' && huntId !== 'watched') {
      router.push(mostWantedDetailHref(huntId));
    }
  }
}

export function openPushNotificationData(
  router: Router,
  data: Record<string, unknown>
): void {
  const conversationId = typeof data.conversationId === 'string' ? data.conversationId : null;
  const actorId = typeof data.actorId === 'string' ? data.actorId : null;
  const kind = typeof data.kind === 'string' ? data.kind : null;
  const linkPath = typeof data.linkPath === 'string' ? data.linkPath : typeof data.link_path === 'string' ? data.link_path : null;
  const huntId = typeof data.huntId === 'string' ? data.huntId : typeof data.hunt_id === 'string' ? data.hunt_id : null;

  if (kind === 'social_message' && conversationId) {
    router.push(messageConversationHref(conversationId));
    return;
  }
  if (kind === 'social_follower' && actorId) {
    router.push(publicProfileHref(actorId));
    return;
  }

  if (linkPath) {
    openNotificationTarget(router, {
      id: '',
      kind: kind ?? 'push',
      title: '',
      body: null,
      link_path: linkPath,
      read_at: null,
      created_at: new Date().toISOString()
    });
    return;
  }

  if (huntId) {
    router.push(mostWantedDetailHref(huntId));
    return;
  }

  if (
    kind === 'most_wanted_evidence_approved' ||
    kind === 'most_wanted_evidence_rejected' ||
    kind === 'most_wanted_evidence_needs_more_info' ||
    kind === 'evidence_approved' ||
    kind === 'evidence_rejected' ||
    kind === 'evidence_needs_more_info'
  ) {
    router.push(mostWantedContributionsHref());
    return;
  }

  if (kind === 'wishlist_promoted_to_most_wanted' || kind === 'most_wanted_solved') {
    router.push(mostWantedSolvedHref());
    return;
  }

  if (kind === 'wishlist_added_to_database' || kind === 'wishlist_catalog_ready') {
    router.push(databaseWishlistHref());
  }
}
