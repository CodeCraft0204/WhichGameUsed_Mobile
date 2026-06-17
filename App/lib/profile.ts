import type { MyProfile, MyProfileUpdate } from '@/types/profile';
import { supabase } from '@/lib/supabase';

const PROFILE_COLUMNS =
  'id, role, display_name, username, avatar_url, about, location_text, is_public, leaderboard_eligible';

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);

export async function fetchMyProfile(
  userId: string
): Promise<{ profile: MyProfile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();

  if (error) return { profile: null, error: error.message };
  return { profile: data as MyProfile | null, error: null };
}

export async function updateMyProfile(
  userId: string,
  patch: MyProfileUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);

  if (error) {
    if (error.message.includes('duplicate key') && error.message.includes('username')) {
      return { error: 'That username is already taken.' };
    }
    if (error.message.includes('cannot change your own role')) {
      return { error: 'You cannot change your own role here.' };
    }
    return { error: error.message };
  }

  return { error: null };
}

function avatarObjectPath(userId: string, mimeType: string): string {
  const ext = mimeType.includes('png')
    ? 'png'
    : mimeType.includes('webp')
      ? 'webp'
      : mimeType.includes('gif')
        ? 'gif'
        : 'jpg';
  return `${userId}/avatar.${ext}`;
}

export async function uploadAvatarFromUri(
  userId: string,
  uri: string,
  mimeType: string,
  byteLength: number
): Promise<{ url: string | null; error: string | null }> {
  if (!AVATAR_TYPES.has(mimeType)) {
    return { url: null, error: 'Use JPEG, PNG, WebP, or GIF.' };
  }
  if (byteLength > AVATAR_MAX_BYTES) {
    return { url: null, error: 'Image must be 2 MB or smaller.' };
  }

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const path = avatarObjectPath(userId, mimeType);

  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, arrayBuffer, {
    upsert: true,
    cacheControl: '3600',
    contentType: mimeType
  });

  if (uploadError) {
    if (uploadError.message.includes('Bucket not found')) {
      return {
        url: null,
        error: 'Avatar storage is not set up on this project yet.'
      };
    }
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;

  const { error: profileError } = await updateMyProfile(userId, { avatar_url: url });
  if (profileError) return { url: null, error: profileError };

  return { url, error: null };
}

export async function removeAvatar(userId: string): Promise<{ error: string | null }> {
  const { data: files, error: listError } = await supabase.storage.from('avatars').list(userId);

  if (listError && !listError.message.includes('Bucket not found')) {
    return { error: listError.message };
  }

  if (files?.length) {
    const paths = files.map((f) => `${userId}/${f.name}`);
    const { error: removeError } = await supabase.storage.from('avatars').remove(paths);
    if (removeError) return { error: removeError.message };
  }

  return updateMyProfile(userId, { avatar_url: null });
}

export function displayName(
  profile: Pick<MyProfile, 'display_name' | 'username'> | null,
  email?: string | null
): string {
  if (profile?.display_name?.trim()) return profile.display_name.trim();
  if (profile?.username?.trim()) return profile.username.trim();
  if (email) return email.split('@')[0] ?? 'Collector';
  return 'Collector';
}

export function profileInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Normalize avatar_url from profiles — supports full URLs and avatars bucket paths. */
export function resolveProfileAvatarUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const path = trimmed.replace(/^\/+/, '');
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl || null;
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}
