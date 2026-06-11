import { Redirect, useRouter } from 'expo-router';
import { useURL } from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { createSessionFromUrl } from '@/lib/auth-session-from-url';
import { ensureMobileProfile } from '@/lib/mobile-auth';
import { supabase } from '@/lib/supabase';

/** Full callback URL including hash tokens (useURL omits the hash on web). */
function getAuthCallbackUrl(linkingUrl: string | null): string | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.href;
  }
  return linkingUrl;
}

/** Handles Google OAuth and email-confirmation deep links. */
export default function AuthCallbackScreen() {
  const linkingUrl = useURL();
  const router = useRouter();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const callbackUrl = getAuthCallbackUrl(linkingUrl);
      if (callbackUrl) {
        const sessionError = await createSessionFromUrl(callbackUrl);
        if (sessionError && mounted) {
          setError(sessionError);
          setProcessing(false);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) {
        if (mounted) setProcessing(false);
        return;
      }

      const { error: profileError } = await ensureMobileProfile(userId);
      if (profileError && mounted) {
        setError(profileError.message);
        setProcessing(false);
        return;
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      if (mounted) {
        setSignedIn(true);
        setProcessing(false);
        router.replace('/database/database');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [linkingUrl, router]);

  if (processing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={figmaColors.charcoal} />
      </View>
    );
  }

  if (error) {
    return <Redirect href={`/sign-in/sign-in?error=${encodeURIComponent(error)}`} />;
  }

  if (signedIn) {
    return <Redirect href="/database/database" />;
  }

  return <Redirect href="/sign-in/sign-in" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: figmaColors.background
  }
});
