import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { authRedirectPath } from '@/lib/auth-redirect';
import { createSessionFromUrl } from '@/lib/auth-session-from-url';
import { ensureMobileProfile } from '@/lib/mobile-auth';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const NATIVE_OAUTH_CALLBACK = 'whichgameused://auth/callback';

const googleOAuthOptions = {
  queryParams: { access_type: 'offline', prompt: 'select_account' as const },
  scopes: 'email profile'
};

/**
 * OAuth return URL passed to Supabase as `redirectTo`.
 * Must exactly match an entry in Supabase → Authentication → Redirect URLs.
 */
export function googleOAuthRedirectUri(): string {
  if (Platform.OS === 'web') {
    return authRedirectPath('auth/callback');
  }

  // EAS / dev-client / store builds: stable deep link from app.json `scheme`.
  if (Constants.appOwnership !== 'expo') {
    return NATIVE_OAUTH_CALLBACK;
  }

  // Expo Go: exp://<lan-ip>:8081/--/auth/callback — allowlist this URL (or exp://**) in Supabase.
  return authRedirectPath('auth/callback');
}

function logRedirectUri(redirectTo: string) {
  if (__DEV__) {
    console.info('[auth] Google OAuth redirectTo — add to Supabase Redirect URLs:', redirectTo);
  }
}

export async function signInWithGoogleOAuth(): Promise<{ error: string | null }> {
  const redirectTo = googleOAuthRedirectUri();
  logRedirectUri(redirectTo);

  // Mobile web (Vercel): same-tab redirect as portal — popup + Site URL fallback breaks here.
  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        ...googleOAuthOptions
      }
    });
    return { error: error?.message ?? null };
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
