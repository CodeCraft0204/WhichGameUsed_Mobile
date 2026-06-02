import { supabase } from '@/lib/supabase';

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

/** Establish a Supabase session from an auth deep link (email confirm / password recovery). */
export async function createSessionFromUrl(url: string): Promise<string | null> {
  const params = parseParamsFromUrl(url);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const errorDescription = params.get('error_description') ?? params.get('error');

  if (errorDescription) {
    return decodeURIComponent(errorDescription.replace(/\+/g, ' '));
  }

  if (!accessToken || !refreshToken) {
    return null;
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  return error?.message ?? null;
}
