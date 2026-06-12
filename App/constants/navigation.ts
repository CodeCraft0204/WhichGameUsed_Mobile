import type { Href } from 'expo-router';

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
  return {
    pathname: '/database/request-card',
    params: {
      ...(params?.query ? { query: params.query } : {}),
      ...(params?.returnTo ? { returnTo: params.returnTo } : {})
    }
  } as unknown as Href;
}

export function submissionDetailHref(id: string): Href {
  return { pathname: '/authenticate/submission/[id]', params: { id } } as unknown as Href;
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
