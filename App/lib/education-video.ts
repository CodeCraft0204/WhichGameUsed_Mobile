import { educationVideos, type EducationVideo } from '@/constants/educationContent';

export type EducationVideoPlayback =
  | { mode: 'youtube'; embedUrl: string; watchUrl: string }
  | { mode: 'webview'; url: string }
  | { mode: 'external'; url: string };

function youtubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id || null;
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      if (u.pathname.startsWith('/embed/')) {
        return u.pathname.split('/')[2] || null;
      }
      const v = u.searchParams.get('v');
      if (v) return v;
    }
  } catch {
    return null;
  }
  return null;
}

/** Resolve how to play an education video in-app. */
export function resolveEducationVideoPlayback(href: string): EducationVideoPlayback {
  const youtubeId = youtubeIdFromUrl(href);
  if (youtubeId) {
    return {
      mode: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`,
      watchUrl: href
    };
  }
  // Prefer in-app WebView for trusted external pages / hosted video pages.
  if (/^https?:\/\//i.test(href)) {
    return { mode: 'webview', url: href };
  }
  return { mode: 'external', url: href };
}

export function getEducationVideo(key: string | undefined | null): EducationVideo | null {
  if (!key) return null;
  return educationVideos.find((v) => v.key === key) ?? null;
}
