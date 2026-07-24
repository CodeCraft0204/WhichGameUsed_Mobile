/** Top-level route segments reachable without a signed-in session. */
const PUBLIC_ROUTE_ROOTS = new Set([
  'sign-in',
  'sign-up',
  'password-reset',
  'set-new-password',
  'auth',
  'community-standards',
  // Linked from forgot-password (and settings); must stay reachable while signed out.
  'contact-support'
]);

/** Auth screens logged-in users should not stay on. */
const SIGNED_IN_AUTH_SCREENS = new Set(['sign-in', 'sign-up']);

export function isPublicAuthRoute(segments: string[]): boolean {
  const root = segments[0];
  if (!root) return true;
  return PUBLIC_ROUTE_ROOTS.has(root);
}

export function shouldRedirectSignedInUser(
  segments: string[],
  otpChallengeActive = false
): boolean {
  if (otpChallengeActive) return false;
  const root = segments[0];
  return !!root && SIGNED_IN_AUTH_SCREENS.has(root);
}

export function canAccessRoute(
  session: boolean,
  segments: string[],
  otpChallengeActive = false
): boolean {
  const publicRoute = isPublicAuthRoute(segments);
  if (!session) return publicRoute;
  if (otpChallengeActive && segments[0] === 'sign-in') return true;
  return !shouldRedirectSignedInUser(segments, otpChallengeActive);
}
