import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { createSessionFromUrl } from '@/lib/auth-session-from-url';
import { ensureMobileProfile } from '@/lib/mobile-auth';
import { logOAuthRedirectUri, oauthRedirectUri } from '@/lib/oauth-redirect';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type AppleAuthResult = {
  error: string | null;
  /** Web: full-page redirect to Apple is in progress — do not navigate in-app. */
  redirecting?: boolean;
};

function formatAppleDisplayName(
  fullName: AppleAuthentication.AppleAuthenticationFullName | null
): string | undefined {
  if (!fullName) return undefined;
  const parts = [fullName.givenName, fullName.familyName].filter(Boolean);
  return parts.length ? parts.join(' ') : undefined;
}

async function finalizeAppleSession(
  userId: string,
  displayName?: string
): Promise<string | null> {
  const { error: profileError } = await ensureMobileProfile(userId, displayName);
  return profileError?.message ?? null;
}

async function signInWithAppleNative(): Promise<AppleAuthResult> {
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    return { error: 'Sign in with Apple is not available on this device.' };
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL
      ]
    });

    if (!credential.identityToken) {
      return { error: 'Apple sign-in did not return an identity token.' };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken
    });

    if (error) return { error: error.message };

    const userId = data.user?.id;
    if (!userId) return { error: 'Apple sign-in did not complete.' };

    const profileError = await finalizeAppleSession(
      userId,
      formatAppleDisplayName(credential.fullName)
    );
    if (profileError) return { error: profileError };

    return { error: null };
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: string }).code)
        : '';
    if (code === 'ERR_REQUEST_CANCELED') {
      return { error: null };
    }
    const message = err instanceof Error ? err.message : 'Apple sign-in failed.';
    return { error: message };
  }
}

async function signInWithAppleOAuth(): Promise<AppleAuthResult> {
  const redirectTo = oauthRedirectUri();
  logOAuthRedirectUri('Apple', redirectTo);

  if (Platform.OS === 'web') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo,
        skipBrowserRedirect: true
      }
    });

    if (error) return { error: error.message };
    if (!data.url) return { error: 'Could not start Apple sign-in.' };

    window.location.replace(data.url);
    return { error: null, redirecting: true };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo,
      skipBrowserRedirect: true
    }
  });

  if (error) return { error: error.message };
  if (!data.url) return { error: 'Could not start Apple sign-in.' };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
    preferEphemeralSession: Platform.OS === 'ios'
  });

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { error: null };
  }

  if (result.type !== 'success') {
    return { error: 'Apple sign-in was not completed.' };
  }

  const sessionError = await createSessionFromUrl(result.url);
  if (sessionError) return { error: sessionError };

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (userId) {
    const profileError = await finalizeAppleSession(userId);
    if (profileError) return { error: profileError };
  }

  return { error: null };
}

/** iOS uses native Sign in with Apple; web/Android use Supabase OAuth. */
export async function signInWithAppleAuth(): Promise<AppleAuthResult> {
  if (Platform.OS === 'ios') {
    return signInWithAppleNative();
  }
  return signInWithAppleOAuth();
}
