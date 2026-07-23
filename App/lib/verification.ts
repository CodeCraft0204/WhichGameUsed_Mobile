import { getCardById, type CardDetail } from '@/lib/cards';
import { signedSubmissionImageUrl } from '@/lib/submission-storage';
import { supabase } from '@/lib/supabase';

export type AuthenticatedCopyPhoto = {
  id: string;
  file_kind: string;
  bucket_name: string;
  file_path: string;
  url: string | null;
};

export type VerifiedAsset = {
  id: string;
  asset_id: string;
  status: string;
  verification_url: string | null;
  authenticated_at: string | null;
  public_notes: string | null;
  owner_display_name: string | null;
  card: CardDetail | null;
  copy_photos: AuthenticatedCopyPhoto[];
};

export async function lookupAssetByCode(
  assetCode: string
): Promise<{ asset: VerifiedAsset | null; error: string | null }> {
  const code = assetCode.trim();
  if (!code) return { asset: null, error: 'Enter an asset ID.' };

  const { data, error } = await supabase
    .from('authenticated_assets')
    .select(
      `id, asset_id, status, verification_url, authenticated_at, public_notes, card_id,
       profiles:owner_user_id (display_name, username)`
    )
    .eq('asset_id', code)
    .maybeSingle();

  if (error) return { asset: null, error: error.message };
  if (!data) return { asset: null, error: null };

  const raw = data as {
    id: string;
    asset_id: string;
    status: string;
    verification_url: string | null;
    authenticated_at: string | null;
    public_notes: string | null;
    card_id: string;
    profiles:
      | { display_name: string | null; username: string | null }
      | { display_name: string | null; username: string | null }[]
      | null;
  };

  const profile = Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles;

  const [{ card, error: cardError }, { data: photoRows, error: photosError }] = await Promise.all([
    getCardById(raw.card_id),
    supabase
      .from('file_assets')
      .select('id, file_kind, bucket_name, file_path')
      .eq('authenticated_asset_id', raw.id)
      .order('file_kind', { ascending: true })
  ]);

  if (photosError) return { asset: null, error: photosError.message };
  if (cardError) return { asset: null, error: cardError };

  const photoMeta = (photoRows ?? []) as Omit<AuthenticatedCopyPhoto, 'url'>[];
  const copy_photos: AuthenticatedCopyPhoto[] = await Promise.all(
    photoMeta.map(async (photo) => ({
      ...photo,
      url: await signedSubmissionImageUrl(photo.bucket_name, photo.file_path)
    }))
  );

  return {
    asset: {
      id: raw.id,
      asset_id: raw.asset_id,
      status: raw.status,
      verification_url: raw.verification_url,
      authenticated_at: raw.authenticated_at,
      public_notes: raw.public_notes,
      owner_display_name: profile?.display_name ?? profile?.username ?? null,
      card,
      copy_photos
    },
    error: null
  };
}
