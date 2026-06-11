import { supabase } from '@/lib/supabase';

/** Prevent double PKCE exchange when callback is handled from multiple listeners. */
const exchangedAuthCodes = new Set<string>();

function parseParamsFromUrl(url: string): URLSearchParams {
  const hashIndex = url.indexOf('#');
  if (hashIndex >= 0) {
    return new URLSearchParams(url.slice(hashIndex + 1));
  }
  const queryIndex = url.indexOf('?');
  if (queryIndex >= 0) {
    return new URLSearchParams(url.slice(queryIndex + 1));
  }
  return new URLSearchParams();
}

/** Establish a Supabase session from an auth deep link (OAuth, email confirm, password recovery). */
export async function createSessionFromUrl(url: string): Promise<string | null> {
  const params = parseParamsFromUrl(url);
  const errorDescription = params.get('error_description') ?? params.get('error');

  if (errorDescription) {
    return decodeURIComponent(errorDescription.replace(/\+/g, ' '));
  }

  const code = params.get('code');
  if (code) {
    if (exchangedAuthCodes.has(code)) {
      return null;
    }

    const { data: existing } = await supabase.auth.getSession();
    if (existing.session) {
      exchangedAuthCodes.add(code);
      return null;
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return error.message;
    }

    exchangedAuthCodes.add(code);
    return null;
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    return error?.message ?? null;
  }

  return null;
}
