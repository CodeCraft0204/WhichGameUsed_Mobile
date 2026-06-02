import * as Linking from 'expo-linking';

/** Deep link / web URL for Supabase auth redirects (signup confirm, password reset). */
export function authRedirectPath(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return Linking.createURL(normalized);
}
