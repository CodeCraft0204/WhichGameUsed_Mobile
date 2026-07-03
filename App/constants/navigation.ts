import type { Href } from 'expo-router';
import type { LeaderboardPeriod } from '@/lib/leaderboard';

export const authNav: Array<{ label: string; href: Href }> = [
  { label: 'Sign In', href: '/sign-in/sign-in' },
  { label: 'Sign Up', href: '/sign-up/sign-up' },
  { label: 'Password Reset', href: '/password-reset/password-reset' }
];

/** Main app destinations — require a signed-in session (enforced in AuthNavigationGuard). */
export const primaryNav: Array<{ label: string; href: Href }> = [
  { label: 'Profile', href: '/profile/profile' },
  { label: 'Settings', href: '/settings/settings' },
  { label: 'Database', href: '/database/database' },
  { label: 'Authenticate', href: '/authenticate/authenticate' },
  { label: 'Discussion', href: '/discussion/discussion' },
  { label: 'Education', href: '/education/education' },
  { label: 'MostWanted', href: '/mostwanted/mostwanted' },
  { label: 'Leaderboard', href: '/leaderboard/leaderboard' },
  { label: 'Advocacy', href: '/advocacy/advocacy' },
  { label: 'Create', href: '/create/create' },
  { label: 'Camera', href: '/camera/camera' },
  { label: 'Edit photos', href: '/create/edit' }
];

export function databaseSearchHref(params?: {
  sport?: string;
  q?: string;
  authenticated?: boolean;
}): Href {
  return {
    pathname: '/database/search',
    params: {
      ...(params?.sport ? { sport: params.sport } : {}),
      ...(params?.q ? { q: params.q } : {}),
      ...(params?.authenticated ? { authenticated: '1' } : {})
    }
  } as unknown as Href;
}

export function databaseCardHref(id: string): Href {
  return { pathname: '/database/card/[id]', params: { id } } as unknown as Href;
}

export function databaseRequestCardHref(params?: {
  query?: string;
  returnTo?: string;
}): Href {
  return databaseWishlistAddHref(params);
}

export function databaseMyRequestsHref(): Href {
  return '/database/my-requests' as unknown as Href;
}

export function databaseRequestDetailHref(id: string): Href {
  return { pathname: '/database/request/[id]', params: { id } } as unknown as Href;
}

export function authenticatedAssetHref(assetId: string): Href {
  return { pathname: '/database/asset/[id]', params: { id: assetId } } as unknown as Href;
}

export function createWithLinkedCardHref(cardId: string, cardTitle: string): Href {
  return {
    pathname: '/camera/camera',
    params: { linkedCardKey: cardId, linkedCardTitle: cardTitle }
  } as unknown as Href;
}

export function submissionDetailHref(id: string): Href {
  return { pathname: '/authenticate/submission/[id]', params: { id } } as unknown as Href;
}

export function databaseNotificationsHref(): Href {
  return '/database/notifications' as unknown as Href;
}

export function databaseWishlistHref(): Href {
  return '/database/wishlist' as unknown as Href;
}

export function databaseWishlistAddHref(params?: {
  query?: string;
  returnTo?: string;
}): Href {
  return {
    pathname: '/database/wishlist-add',
    params: {
      ...(params?.query ? { query: params.query } : {}),
      ...(params?.returnTo ? { returnTo: params.returnTo } : {})
    }
  } as unknown as Href;
}

export function discussionTopicHref(slug: string): Href {
  return { pathname: '/discussion/topic/[slug]', params: { slug } } as unknown as Href;
}

export function discussionThreadHref(id: string): Href {
  return { pathname: '/discussion/thread/[id]', params: { id } } as unknown as Href;
}

export function discussionCreateHref(topicSlug?: string): Href {
  return {
    pathname: '/discussion/create',
    params: topicSlug ? { topicSlug } : {}
  } as unknown as Href;
}

export function discussionSavedHref(): Href {
  return '/discussion/saved' as unknown as Href;
}

export function discussionFeedPreferencesHref(): Href {
  return '/discussion/feed-preferences' as unknown as Href;
}

export function publicProfileHref(
  id: string,
  extras?: { rank?: number; points?: number; period?: LeaderboardPeriod }
): Href {
  return {
    pathname: '/profile/[id]',
    params: {
      id,
      ...(extras?.rank != null ? { rank: String(extras.rank) } : {}),
      ...(extras?.points != null ? { points: String(extras.points) } : {}),
      ...(extras?.period ? { period: extras.period } : {})
    }
  } as unknown as Href;
}

export function pointsWorkHref(): Href {
  return '/leaderboard/points-work' as unknown as Href;
}

export function monthlyPrizeHref(): Href {
  return '/leaderboard/prize' as unknown as Href;
}
