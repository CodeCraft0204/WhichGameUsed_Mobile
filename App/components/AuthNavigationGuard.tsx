import { useRouter, useSegments } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { figmaColors } from '@/constants/figmaColors';
import { canAccessRoute, isPublicAuthRoute, shouldRedirectSignedInUser } from '@/lib/auth-routes';

type AuthNavigationGuardProps = {
  children: ReactNode;
};

/** Redirects unauthenticated users to sign-in; keeps auth-only screens off the main app shell. */
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

  if (loading || !allowed) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={figmaColors.charcoal} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: figmaColors.background
  }
});
