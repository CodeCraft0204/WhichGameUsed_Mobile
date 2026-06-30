import { supabase } from '@/lib/supabase';

export const CARD_REFERENCE_BUCKET = 'card-reference-images';

export type MemorabiliaPieceImage = {
  id: string;
  url: string;
  imageType: string | null;
  mimeType: string | null;
  isVideo: boolean;
};

export function cardReferencePublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function resolveCardImageUrl(
  fileId: string | null | undefined
): Promise<string | null> {
  if (!fileId) return null;

  const { data, error } = await supabase
    .from('file_assets')
    .select('bucket_name, file_path')
    .eq('id', fileId)
    .maybeSingle();

  if (error || !data?.file_path) return null;
  return cardReferencePublicUrl(data.bucket_name, data.file_path);
}

const PIECE_IMAGE_KINDS = new Set([
  'memorabilia_proof_image',
  'memorabilia_proof_video',
  'reference_manual'
]);

export async function listMemorabiliaPieceImages(
  pieceId: string
): Promise<{ items: MemorabiliaPieceImage[]; error: string | null }> {
  const { data, error } = await supabase
    .from('file_assets')
    .select('id, bucket_name, file_path, mime_type, reference_image_type, file_kind, visibility')
    .eq('memorabilia_piece_id', pieceId)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });

  if (error) return { items: [], error: error.message };

  const items: MemorabiliaPieceImage[] = [];
  for (const row of data ?? []) {
    const r = row as {
      id: string;
      bucket_name: string;
      file_path: string;
      mime_type: string | null;
      reference_image_type: string | null;
      file_kind: string;
    };
    if (!PIECE_IMAGE_KINDS.has(r.file_kind)) continue;
    if (!r.file_path) continue;

    const mimeType = r.mime_type ?? '';
    const isVideo =
      r.file_kind === 'memorabilia_proof_video' ||
      mimeType.startsWith('video/') ||
      r.reference_image_type === 'video';

    items.push({
      id: r.id,
      url: cardReferencePublicUrl(r.bucket_name, r.file_path),
      imageType: r.reference_image_type,
      mimeType: mimeType || null,
      isVideo
    });
  }

  return { items, error: null };
}
