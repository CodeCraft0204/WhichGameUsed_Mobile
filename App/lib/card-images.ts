import { supabase } from '@/lib/supabase';

export const CARD_REFERENCE_BUCKET = 'card-reference-images';

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
