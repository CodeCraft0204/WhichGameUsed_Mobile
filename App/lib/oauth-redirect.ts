import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { authRedirectPath } from '@/lib/auth-redirect';

const NATIVE_OAUTH_CALLBACK = 'whichgameused://auth/callback';

/**
 * OAuth return URL passed to Supabase as `redirectTo`.
 * Must exactly match an entry in Supabase → Authentication → Redirect URLs.
 */
export function oauthRedirectUri(): string {
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

export function logOAuthRedirectUri(provider: string, redirectTo: string) {
  if (__DEV__) {
    console.info(`[auth] ${provider} OAuth redirectTo — add to Supabase Redirect URLs:`, redirectTo);
  }
}
