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

export type DatabaseSportFilter = 'ALL' | 'BASEBALL' | 'BASKETBALL' | 'FOOTBALL' | 'PLAYERS';

export type CatalogListOptions = {
  query?: string;
  sport?: DatabaseSportFilter;
  authenticatedOnly?: boolean;
  year?: number;
  limit?: number;
  offset?: number;
};

export type AuthenticatedAssetSummary = {
  id: string;
  asset_id: string;
  status: string;
  authenticated_at: string | null;
  verification_url: string | null;
};

function ilikePattern(q: string): string {
  const pattern = `%${q.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
  return `"${pattern.replace(/"/g, '""')}"`;
}

async function rowsToSummaries(
  rows: Omit<CardSummary, 'imageUrl'>[]
): Promise<CardSummary[]> {
  const fileIds = await fetchFrontFileIds(rows.map((r) => r.id));
  return attachImageUrls(rows, fileIds);
}

export async function listCatalogCards(
  options: CatalogListOptions = {}
): Promise<{ items: CardSummary[]; error: string | null }> {
  const { query, sport, authenticatedOnly, year, limit = 20, offset = 0 } = options;
  const q = query?.trim() ?? '';

  let request = supabase
    .from('card_public_summary')
    .select(SUMMARY_COLUMNS)
    .eq('status', 'approved')
    .order('title', { ascending: true })
    .range(offset, offset + limit - 1);

  if (sport && sport !== 'ALL') {
    if (sport === 'PLAYERS') {
      request = request.not('player_name', 'is', null);
    } else {
      const name = sport.charAt(0) + sport.slice(1).toLowerCase();
      request = request.ilike('sport_name', ilikePattern(name));
    }
  }

  if (authenticatedOnly) {
    request = request.gt('authenticated_count', 0);
  }

  if (year != null) {
    request = request.eq('year', year);
  }

  if (q) {
    const pat = ilikePattern(q);
    request = request.or(
      `title.ilike.${pat},card_number.ilike.${pat},player_name.ilike.${pat},team_name.ilike.${pat},product_name.ilike.${pat},manufacturer_name.ilike.${pat}`
    );
  }

  const { data, error } = await request;
  if (error) return { items: [], error: error.message };

  const rows = (data ?? []) as Omit<CardSummary, 'imageUrl'>[];
  const items = await rowsToSummaries(rows);
  return { items, error: null };
}

export async function searchApprovedCards(
  query: string,
  limit = 20
): Promise<{ items: CardSummary[]; error: string | null }> {
  return listCatalogCards({ query, limit });
}

export async function listRecentCards(
  limit = 8,
  sport?: DatabaseSportFilter
): Promise<{ items: CardSummary[]; error: string | null }> {
  return listCatalogCards({ sport, limit });
}

export async function listAuthenticatedAssetsForCard(
  cardId: string
): Promise<{ items: AuthenticatedAssetSummary[]; error: string | null }> {
  const { data, error } = await supabase
    .from('authenticated_assets')
    .select('id, asset_id, status, authenticated_at, verification_url')
    .eq('card_id', cardId)
    .eq('status', 'active')
    .order('authenticated_at', { ascending: false });

  if (error) return { items: [], error: error.message };
  return { items: (data ?? []) as AuthenticatedAssetSummary[], error: null };
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
