import { supabase } from '@/lib/supabase';
import { resolveCardImageUrl } from '@/lib/card-images';

export type CardSummary = {
  id: string;
  title: string;
  card_number: string | null;
  player_name: string | null;
  team_name: string | null;
  product_name: string | null;
  product_full_name: string | null;
  year: number | null;
  sport_name: string | null;
  manufacturer_name: string | null;
  memorabilia_type: string | null;
  authenticated_count: number;
  imageUrl: string | null;
};

const SUMMARY_COLUMNS =
  'id, title, card_number, player_name, team_name, product_name, product_full_name, year, sport_name, manufacturer_name, memorabilia_type, authenticated_count';

async function attachImageUrls(
  rows: Omit<CardSummary, 'imageUrl'>[],
  frontFileIds: Map<string, string | null>
): Promise<CardSummary[]> {
  const out: CardSummary[] = [];
  for (const row of rows) {
    const fileId = frontFileIds.get(row.id);
    const imageUrl = fileId ? await resolveCardImageUrl(fileId) : null;
    out.push({ ...row, imageUrl });
  }
  return out;
}

async function fetchFrontFileIds(cardIds: string[]): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  if (cardIds.length === 0) return map;

  const { data } = await supabase
    .from('cards')
    .select('id, front_image_file_id')
    .in('id', cardIds);

  for (const row of data ?? []) {
    const r = row as { id: string; front_image_file_id: string | null };
    map.set(r.id, r.front_image_file_id);
  }
  return map;
}

function toDescription(row: Omit<CardSummary, 'imageUrl'>): string {
  const parts = [
    row.player_name,
    row.team_name,
    row.product_full_name ?? row.product_name,
    row.year ? String(row.year) : null
  ].filter(Boolean);
  return parts.join(' · ') || 'Catalog card';
}

export function cardToTags(row: Omit<CardSummary, 'imageUrl'>): string[] {
  const tags: string[] = [];
  if (row.sport_name) tags.push(row.sport_name.toUpperCase());
  if (row.authenticated_count > 0) tags.push('AUTHENTICATED');
  if (row.memorabilia_type) tags.push(row.memorabilia_type.toUpperCase());
  return tags.slice(0, 3);
}

export { toDescription as cardDescription };

export async function searchApprovedCards(
  query: string,
  limit = 20
): Promise<{ items: CardSummary[]; error: string | null }> {
  const q = query.trim();
  let request = supabase
    .from('card_public_summary')
    .select(SUMMARY_COLUMNS)
    .eq('status', 'approved')
    .order('title', { ascending: true })
    .limit(limit);

  if (q) {
    const pattern = `%${q.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
    const pat = `"${pattern.replace(/"/g, '""')}"`;
    request = request.or(
      `title.ilike.${pat},card_number.ilike.${pat},player_name.ilike.${pat},team_name.ilike.${pat},product_name.ilike.${pat}`
    );
  }

  const { data, error } = await request;
  if (error) return { items: [], error: error.message };

  const rows = (data ?? []) as Omit<CardSummary, 'imageUrl'>[];
  const fileIds = await fetchFrontFileIds(rows.map((r) => r.id));
  const items = await attachImageUrls(rows, fileIds);
  return { items, error: null };
}

export async function listRecentCards(
  limit = 8
): Promise<{ items: CardSummary[]; error: string | null }> {
  const { data, error } = await supabase
    .from('card_public_summary')
    .select(SUMMARY_COLUMNS)
    .eq('status', 'approved')
    .order('title', { ascending: true })
    .limit(limit);

  if (error) return { items: [], error: error.message };

  const rows = (data ?? []) as Omit<CardSummary, 'imageUrl'>[];
  const fileIds = await fetchFrontFileIds(rows.map((r) => r.id));
  const items = await attachImageUrls(rows, fileIds);
  return { items, error: null };
}

export async function getCardById(
  id: string
): Promise<{ card: CardSummary | null; error: string | null }> {
  const { data, error } = await supabase
    .from('card_public_summary')
    .select(SUMMARY_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) return { card: null, error: error.message };
  if (!data) return { card: null, error: null };

  const row = data as Omit<CardSummary, 'imageUrl'>;
  const fileIds = await fetchFrontFileIds([row.id]);
  const [card] = await attachImageUrls([row], fileIds);
  return { card, error: null };
}
