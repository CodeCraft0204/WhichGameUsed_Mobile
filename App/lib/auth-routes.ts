/** Top-level route segments reachable without a signed-in session. */
const PUBLIC_NESTED_PATHS = new Set([
  'database/verification',
  'database/verify',
  'database/verify-scan'
]);

/** Top-level public roots (in addition to auth screens). */
const PUBLIC_ROUTE_ROOTS = new Set([
  'sign-in',
  'sign-up',
  'password-reset',
  'set-new-password',
  'auth',
  'community-standards',
  // Linked from forgot-password (and settings); must stay reachable while signed out.
  'contact-support',
  // Portal universal-link alias `/v/:code`
  'v'
]);

/** Auth screens logged-in users should not stay on. */
const SIGNED_IN_AUTH_SCREENS = new Set(['sign-in', 'sign-up']);

function nestedPath(segments: string[]): string | null {
  if (segments.length < 2) return null;
  return `${segments[0]}/${segments[1]}`;
}

export function isPublicAuthRoute(segments: string[]): boolean {
  const root = segments[0];
  if (!root) return true;
  if (PUBLIC_ROUTE_ROOTS.has(root)) return true;
  // Guest browse for Advocacy list + initiative detail; submit/my require auth.
  if (root === 'advocacy') {
    const leaf = segments[1];
    if (
      leaf === 'my-support' ||
      leaf === 'my-advocacy' ||
      leaf === 'submit-issue' ||
      leaf === 'submit-evidence'
    ) {
      return false;
    }
    return true;
  }
  const nested = nestedPath(segments);
  return nested != null && PUBLIC_NESTED_PATHS.has(nested);
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
