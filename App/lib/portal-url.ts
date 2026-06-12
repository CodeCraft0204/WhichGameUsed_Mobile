/** Public portal base URL for verification links (optional EXPO_PUBLIC_PORTAL_URL). */
export function portalBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_PORTAL_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  return 'https://which-game-used.vercel.app';
}

export function absolutePortalUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl?.trim()) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${portalBaseUrl()}${path}`;
}
