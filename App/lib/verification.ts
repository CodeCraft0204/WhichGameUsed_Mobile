import { getCardById, type CardDetail } from '@/lib/cards';
import { portalBaseUrl } from '@/lib/portal-url';
import { signedSubmissionImageUrl } from '@/lib/submission-storage';
import { supabase } from '@/lib/supabase';

export type AuthenticatedCopyPhoto = {
  id: string;
  file_kind: string;
  bucket_name: string;
  file_path: string;
  url: string | null;
};

export type VerifiedSticker = {
  id: string;
  sticker_status: string;
  is_current: boolean;
  public_code: string | null;
  mailed_at: string | null;
  delivered_at: string | null;
  activated_at: string | null;
};

export type VerifiedAsset = {
  id: string;
  asset_id: string;
  status: string;
  verification_url: string | null;
  authenticated_at: string | null;
  public_notes: string | null;
  owner_display_name: string | null;
  sticker: VerifiedSticker | null;
  card: CardDetail | null;
  copy_photos: AuthenticatedCopyPhoto[];
};

export function stickerStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'not_generated':
      return 'Queued';
    case 'generated':
      return 'QR generated';
    case 'printed':
      return 'Printed';
    case 'mailed':
      return 'Mailed';
    case 'active':
      return 'On item';
    case 'reissued':
      return 'Replaced';
    case 'revoked':
      return 'Void';
    default:
      return status ?? '—';
  }
}

export function authStatusLabel(status: string): string {
  if (status === 'active') return 'Verified';
  if (status === 'revoked') return 'Revoked';
  if (status === 'reissued') return 'Replaced';
  return status;
}

export function publicVerificationWebUrl(assetId: string): string {
  return `${portalBaseUrl()}/v/${encodeURIComponent(assetId.trim())}`;
}

export async function lookupAssetByCode(
  assetCode: string
): Promise<{ asset: VerifiedAsset | null; error: string | null }> {
  const code = assetCode.trim();
  if (!code) return { asset: null, error: 'Enter an asset ID.' };

  const { data, error } = await supabase.rpc('public_get_verification_by_code', {
    p_code: code,
    p_client_kind: 'mobile',
    p_user_agent: null,
    p_referrer: null,
    p_sticker_id: null
  });

  if (error) return { asset: null, error: error.message };

  const raw = data as {
    found?: boolean;
    error?: string;
    asset?: {
      id: string;
      asset_id: string;
      status: string;
      authenticated_at: string | null;
      public_notes: string | null;
      verification_url: string | null;
    };
    sticker?: VerifiedSticker | null;
    card?: {
      id: string;
      title: string | null;
      year: number | null;
      product_name: string | null;
      player_name: string | null;
      front_path: string | null;
      front_bucket: string | null;
      back_path: string | null;
      back_bucket: string | null;
    } | null;
    copy_photos?: Array<{
      id: string;
      file_kind: string;
      bucket_name: string;
      file_path: string;
    }>;
  };

  if (!raw?.found || !raw.asset) {
    return { asset: null, error: raw?.error ?? null };
  }

  let card: CardDetail | null = null;
  if (raw.card?.id) {
    const cardRes = await getCardById(raw.card.id);
    if (cardRes.error) return { asset: null, error: cardRes.error };
    card = cardRes.card;
  }

  const photoMeta = raw.copy_photos ?? [];
  const copy_photos: AuthenticatedCopyPhoto[] = await Promise.all(
    photoMeta.map(async (photo) => ({
      ...photo,
      url: await signedSubmissionImageUrl(photo.bucket_name, photo.file_path)
    }))
  );

  return {
    asset: {
      id: raw.asset.id,
      asset_id: raw.asset.asset_id,
      status: raw.asset.status,
      verification_url: raw.asset.verification_url,
      authenticated_at: raw.asset.authenticated_at,
      public_notes: raw.asset.public_notes,
      owner_display_name: null,
      sticker: raw.sticker ?? null,
      card,
      copy_photos
    },
    error: null
  };
}

export async function getCurrentStickerStatusForAsset(
  authenticatedAssetId: string
): Promise<{ status: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('qr_stickers')
    .select('sticker_status')
    .eq('authenticated_asset_id', authenticatedAssetId)
    .eq('is_current', true)
    .maybeSingle();
  if (error) return { status: null, error: error.message };
  return { status: data?.sticker_status ? String(data.sticker_status) : null, error: null };
}

/** Extract WGU asset code from a scanned QR payload (URL or raw code). */
export function assetCodeFromScanPayload(payload: string): string | null {
  const trimmed = payload.trim();
  if (!trimmed) return null;
  const wgu = trimmed.match(/WGU-\d{4}-\d{6}/i);
  if (wgu) return wgu[0].toUpperCase();
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split('/').filter(Boolean);
    const vIndex = parts.findIndex((p) => p === 'v');
    if (vIndex >= 0 && parts[vIndex + 1]) {
      return decodeURIComponent(parts[vIndex + 1]).toUpperCase();
    }
    const asset = url.searchParams.get('asset');
    if (asset) return asset.trim().toUpperCase();
  } catch {
    // not a URL
  }
  if (/^WGU-/i.test(trimmed)) return trimmed.toUpperCase();
  return null;
}
