import type { ImageSourcePropType } from 'react-native';

/** Supabase Storage bucket for static mobile UI assets (public read). */
export const MOBILE_ASSETS_BUCKET = 'mobile-app-assets';

export function mobileAssetsBaseUrl(): string {
  const base = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  if (!base) {
    console.warn('[remoteAssets] Missing EXPO_PUBLIC_SUPABASE_URL');
  }
  return `${base}/storage/v1/object/public/${MOBILE_ASSETS_BUCKET}`;
}

/**
 * Absolute public URL for a path relative to assets/
 * e.g. `figma/database/hero_archive.png`
 */
export function remoteAssetUri(relativePath: string): string {
  const encoded = relativePath
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  return `${mobileAssetsBaseUrl()}/${encoded}`;
}

/** Image / GIF source for React Native `Image`. */
export function remoteAsset(relativePath: string): ImageSourcePropType {
  return { uri: remoteAssetUri(relativePath) };
}
