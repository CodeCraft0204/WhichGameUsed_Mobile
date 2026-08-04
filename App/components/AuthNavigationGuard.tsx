import { useRouter, useSegments } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppSplashScreen } from '@/components/AppSplashScreen';
import { useAuth } from '@/context/AuthContext';
import { canAccessRoute, isPublicAuthRoute, shouldRedirectSignedInUser } from '@/lib/auth-routes';

type AuthNavigationGuardProps = {
  children: ReactNode;
};

/**
 * Redirects unauthenticated users to sign-in; keeps auth-only screens off the main app shell.
 *
 * Important: keep the Expo Router `<Stack>` mounted while redirecting. Unmounting it on
 * sign-out caused "REPLACE … sign-in/sign-in was not handled by any navigator".
 */
export function AuthNavigationGuard({ children }: AuthNavigationGuardProps) {
  const { session, loading, otpChallengeActive, isOtpChallengePending } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const signedIn = !!session;
  const challengeActive = otpChallengeActive || isOtpChallengePending();
  const allowed = !loading && canAccessRoute(signedIn, segments, challengeActive);

  useEffect(() => {
    if (loading) return;

    const publicRoute = isPublicAuthRoute(segments);

    if (!signedIn && !publicRoute) {
      router.replace('/sign-in/sign-in');
      return;
    }

    if (signedIn && shouldRedirectSignedInUser(segments, challengeActive)) {
      router.replace('/database/database');
    }
  }, [challengeActive, loading, router, segments, signedIn]);

  // Initial session hydrate only — do not tear down the navigator on later auth flips.
  if (loading) {
    return <AppSplashScreen progress={1} message="Loading your research world…" />;
  }

  return (
    <View style={styles.root}>
      {children}
      {!allowed ? (
        <View style={styles.overlay} pointerEvents="auto">
          <AppSplashScreen progress={1} message="Loading your research world…" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20
  }
});
