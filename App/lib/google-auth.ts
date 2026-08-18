import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { createSessionFromUrl } from '@/lib/auth-session-from-url';
import { ensureMobileProfile } from '@/lib/mobile-auth';
import { logOAuthRedirectUri, oauthRedirectUri } from '@/lib/oauth-redirect';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const googleOAuthOptions = {
  queryParams: { access_type: 'offline', prompt: 'select_account' as const },
  scopes: 'email profile'
};

export type GoogleOAuthResult = {
  error: string | null;
  /** Web: full-page redirect to Google is in progress — do not navigate in-app. */
  redirecting?: boolean;
};

export async function signInWithGoogleOAuth(): Promise<GoogleOAuthResult> {
  const redirectTo = oauthRedirectUri();
  logOAuthRedirectUri('Google', redirectTo);

  // Mobile web: hard full-page navigation. skipBrowserRedirect returns the URL
  // without Supabase calling assign — we replace immediately so Expo Router cannot
  // cancel the outbound request (shows as "(canceled)" in DevTools).
  if (Platform.OS === 'web') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        ...googleOAuthOptions
      }
    });

    if (error) return { error: error.message };
    if (!data.url) return { error: 'Could not start Google sign-in.' };

    window.location.replace(data.url);
    return { error: null, redirecting: true };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      ...googleOAuthOptions
    }
  });

  if (error) return { error: error.message };
  if (!data.url) return { error: 'Could not start Google sign-in.' };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
    preferEphemeralSession: Platform.OS === 'ios'
  });

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { error: null };
  }

  if (result.type !== 'success') {
    return { error: 'Google sign-in was not completed.' };
  }

  const sessionError = await createSessionFromUrl(result.url);
  if (sessionError) return { error: sessionError };

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (userId) {
    const { error: profileError } = await ensureMobileProfile(userId);
    if (profileError) return { error: profileError.message };
  }

  return { error: null };
}
