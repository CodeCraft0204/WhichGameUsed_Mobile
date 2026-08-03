/**
 * Pure notification → route resolution (no Expo router).
 * Used by notification-routing.ts and unit tests.
 */

export type NotificationNavTarget =
  | { type: 'messages'; conversationId: string }
  | { type: 'profile'; profileId: string }
  | { type: 'own_profile' }
  | { type: 'leaderboard' }
  | { type: 'database_card'; cardId: string }
  | { type: 'wishlist' }
  | { type: 'mw_contributions' }
  | { type: 'mw_solved' }
  | { type: 'mw_detail'; huntId: string }
  | { type: 'advocacy_detail'; campaignId: string }
  | { type: 'advocacy' }
  | null;

export function resolveLinkPath(path: string | null | undefined): NotificationNavTarget {
  const trimmed = path?.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('/messages/')) {
    const conversationId = trimmed.replace('/messages/', '').split('/')[0];
    return conversationId ? { type: 'messages', conversationId } : null;
  }

  if (trimmed === '/profile/profile' || trimmed === '/profile') {
    return { type: 'own_profile' };
  }

  if (trimmed.startsWith('/profile/')) {
    const profileId = trimmed.replace('/profile/', '').split('/')[0];
    return profileId ? { type: 'profile', profileId } : null;
  }

  if (trimmed === '/leaderboard' || trimmed.startsWith('/leaderboard/')) {
    return { type: 'leaderboard' };
  }

  if (trimmed.startsWith('/database/card/')) {
    const cardId = trimmed.replace('/database/card/', '').split('/')[0];
    return cardId ? { type: 'database_card', cardId } : null;
  }

  if (trimmed === '/database/wishlist' || trimmed.startsWith('/database/wishlist')) {
    return { type: 'wishlist' };
  }

  if (trimmed === '/mostwanted/contributions') {
    return { type: 'mw_contributions' };
  }

  if (trimmed === '/mostwanted/solved') {
    return { type: 'mw_solved' };
  }

  if (trimmed.startsWith('/mostwanted/')) {
    const huntId = trimmed.replace('/mostwanted/', '').split('/')[0];
    if (huntId && huntId !== 'contributions' && huntId !== 'solved' && huntId !== 'watched') {
      return { type: 'mw_detail', huntId };
    }
  }

  if (trimmed === '/advocacy' || trimmed === '/advocacy/advocacy') {
    return { type: 'advocacy' };
  }

  if (trimmed.startsWith('/advocacy/')) {
    const campaignId = trimmed.replace('/advocacy/', '').split('/')[0];
    if (campaignId && campaignId !== 'advocacy' && campaignId !== 'my-support') {
      return { type: 'advocacy_detail', campaignId };
    }
  }

  return null;
}

export function resolvePushNotificationTarget(data: Record<string, unknown>): NotificationNavTarget {
  const conversationId = typeof data.conversationId === 'string' ? data.conversationId : null;
  const actorId = typeof data.actorId === 'string' ? data.actorId : null;
  const kind = typeof data.kind === 'string' ? data.kind : null;
  const linkPath =
    typeof data.linkPath === 'string'
      ? data.linkPath
      : typeof data.link_path === 'string'
        ? data.link_path
        : null;
  const huntId =
    typeof data.huntId === 'string' ? data.huntId : typeof data.hunt_id === 'string' ? data.hunt_id : null;

  if (kind === 'social_message' && conversationId) {
    return { type: 'messages', conversationId };
  }
  if (kind === 'social_follower' && actorId) {
    return { type: 'profile', profileId: actorId };
  }

  if (linkPath) {
    return resolveLinkPath(linkPath);
  }

  if (huntId) {
    return { type: 'mw_detail', huntId };
  }

  if (
    kind === 'most_wanted_evidence_approved' ||
    kind === 'most_wanted_evidence_rejected' ||
    kind === 'most_wanted_evidence_needs_more_info' ||
    kind === 'evidence_approved' ||
    kind === 'evidence_rejected' ||
    kind === 'evidence_needs_more_info'
  ) {
    return { type: 'mw_contributions' };
  }

  if (kind === 'wishlist_promoted_to_most_wanted') {
    return { type: 'wishlist' };
  }

  if (kind === 'most_wanted_solved') {
    return { type: 'mw_solved' };
  }

  if (
    kind === 'wishlist_added_to_database' ||
    kind === 'wishlist_catalog_ready' ||
    kind === 'card_request_approved'
  ) {
    return { type: 'wishlist' };
  }

  if (
    kind === 'donut_received' ||
    kind === 'rank_advanced' ||
    kind === 'badge_earned' ||
    kind === 'subtitle_approved' ||
    kind === 'subtitle_rejected'
  ) {
    return { type: 'own_profile' };
  }

  if (
    kind === 'advocacy_update' ||
    kind === 'advocacy_resolved' ||
    kind === 'advocacy_evidence_confirmed' ||
    kind === 'advocacy_evidence_needs_context'
  ) {
    return { type: 'advocacy' };
  }

  return null;
}
