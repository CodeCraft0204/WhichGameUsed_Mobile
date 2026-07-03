import type { Href } from 'expo-router';
import {
  messageConversationHref,
  messagesInboxHref,
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
    return { pathname: '/database/card/[id]', params: { id: cardMatch[1] } } as unknown as Href;
  }

  return null;
}

export function isSocialNotification(item: UserNotification): boolean {
  return item.kind === 'social_message' || item.kind === 'social_follower';
}

export function defaultHrefForNotification(item: UserNotification): Href {
  return hrefFromNotificationLink(item.link_path) ?? messagesInboxHref();
}
