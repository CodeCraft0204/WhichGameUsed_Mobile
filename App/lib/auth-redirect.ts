import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

/** Public origin for web builds (Vercel). Must match a Supabase Redirect URL entry. */
function getAppOrigin(): string {
  const configured = process.env.EXPO_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

/** Deep link / web URL for Supabase auth redirects (OAuth, email confirm, password reset). */
export function authRedirectPath(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  const origin = getAppOrigin();
  if (origin) {
    return `${origin}/${normalized}`;
  }
  return Linking.createURL(normalized);
}
