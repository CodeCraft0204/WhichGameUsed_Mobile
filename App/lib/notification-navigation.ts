import type { Href } from 'expo-router';
import {
  databaseCardHref,
  databaseWishlistHref,
  messageConversationHref,
  messagesInboxHref,
  mostWantedContributionsHref,
  mostWantedDetailHref,
  mostWantedSolvedHref,
  publicProfileHref
} from '@/constants/navigation';
import type { UserNotification } from '@/lib/notifications';

export function hrefFromNotificationLink(linkPath: string | null): Href | null {
  if (!linkPath) return null;

  const messagesMatch = linkPath.match(/^\/messages\/([^/]+)$/);
  if (messagesMatch?.[1]) {
    return messageConversationHref(messagesMatch[1]);
  }

  const profileMatch = linkPath.match(/^\/profile\/([^/]+)$/);
  if (profileMatch?.[1]) {
    return publicProfileHref(profileMatch[1]);
  }

  const cardMatch = linkPath.match(/^\/database\/card\/([^/]+)$/);
  if (cardMatch?.[1]) {
    return databaseCardHref(cardMatch[1]);
  }

  if (linkPath === '/database/wishlist' || linkPath.startsWith('/database/wishlist')) {
    return databaseWishlistHref();
  }

  if (linkPath === '/mostwanted/contributions') {
    return mostWantedContributionsHref();
  }

  if (linkPath === '/mostwanted/solved') {
    return mostWantedSolvedHref();
  }

  if (linkPath === '/mostwanted/watched') {
    return '/mostwanted/watched' as unknown as Href;
  }

  const huntMatch = linkPath.match(/^\/mostwanted\/([^/]+)$/);
  if (
    huntMatch?.[1] &&
    huntMatch[1] !== 'contributions' &&
    huntMatch[1] !== 'solved' &&
    huntMatch[1] !== 'watched' &&
    huntMatch[1] !== 'rankings' &&
    huntMatch[1] !== 'submit'
  ) {
    return mostWantedDetailHref(huntMatch[1]);
  }

  return null;
}

export function isSocialNotification(item: UserNotification): boolean {
  return item.kind === 'social_message' || item.kind === 'social_follower';
}

export function isMostWantedNotification(item: UserNotification): boolean {
  return (
    item.kind.includes('most_wanted') ||
    item.kind.includes('wishlist') ||
    item.kind.includes('evidence')
  );
}

export function defaultHrefForNotification(item: UserNotification): Href {
  const fromLink = hrefFromNotificationLink(item.link_path);
  if (fromLink) return fromLink;

  switch (item.kind) {
    case 'wishlist_promoted_to_most_wanted':
    case 'most_wanted_solved':
    case 'most_wanted_near_solved':
      return item.link_path
        ? hrefFromNotificationLink(item.link_path) ?? mostWantedSolvedHref()
        : mostWantedSolvedHref();
    case 'most_wanted_evidence_approved':
    case 'most_wanted_evidence_rejected':
    case 'most_wanted_evidence_needs_more_info':
    case 'evidence_approved':
    case 'evidence_rejected':
    case 'evidence_needs_more_info':
      return mostWantedContributionsHref();
    case 'wishlist_added_to_database':
    case 'wishlist_catalog_ready':
      return databaseWishlistHref();
    default:
      return messagesInboxHref();
  }
}
