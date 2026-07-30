import { supabase } from '@/lib/supabase';
import { resolveCardImageUrl } from '@/lib/card-images';
import { getCachedCatalogList, setCachedCatalogList } from '@/lib/catalog-cache';

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
  memorabilia_piece_id: string | null;
  memorabilia_piece_label: string | null;
  memorabilia_piece_slug: string | null;
  authenticated_count: number;
  published_at: string | null;
  imageUrl: string | null;
};

export type CardDetail = CardSummary & {
  backImageUrl: string | null;
};

export type CatalogStats = {
  totalCards: number;
  authenticatedCards: number;
};

const SUMMARY_COLUMNS =
  'id, title, card_number, player_name, team_name, product_name, product_full_name, year, sport_name, manufacturer_name, memorabilia_type, memorabilia_piece_id, memorabilia_piece_label, memorabilia_piece_slug, authenticated_count, published_at';

type CardImageIds = {
  front: string | null;
  back: string | null;
};

async function fetchCardImageIds(cardIds: string[]): Promise<Map<string, CardImageIds>> {
  const map = new Map<string, CardImageIds>();
  if (cardIds.length === 0) return map;

  const { data } = await supabase
    .from('cards')
    .select('id, front_image_file_id, back_image_file_id')
    .in('id', cardIds);

  for (const row of data ?? []) {
    const r = row as { id: string; front_image_file_id: string | null; back_image_file_id: string | null };
    map.set(r.id, { front: r.front_image_file_id, back: r.back_image_file_id });
  }
  return map;
}

async function attachImageUrls(
  rows: Omit<CardSummary, 'imageUrl'>[]
): Promise<CardSummary[]> {
  const imageIds = await fetchCardImageIds(rows.map((r) => r.id));
  const out: CardSummary[] = [];
  for (const row of rows) {
    const ids = imageIds.get(row.id);
    const imageUrl = ids?.front ? await resolveCardImageUrl(ids.front) : null;
    out.push({ ...row, imageUrl });
  }
  return out;
}

async function attachDetailImages(
  rows: Omit<CardSummary, 'imageUrl'>[]
): Promise<CardDetail[]> {
  const imageIds = await fetchCardImageIds(rows.map((r) => r.id));
  const out: CardDetail[] = [];
  for (const row of rows) {
    const ids = imageIds.get(row.id);
    const [imageUrl, backImageUrl] = await Promise.all([
      ids?.front ? resolveCardImageUrl(ids.front) : Promise.resolve(null),
      ids?.back ? resolveCardImageUrl(ids.back) : Promise.resolve(null)
    ]);
    out.push({ ...row, imageUrl, backImageUrl });
  }
  return out;
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

export type DatabaseSportFilter =
  | 'ALL'
  | 'BASEBALL'
  | 'BASKETBALL'
  | 'FOOTBALL'
  | 'PLAYERS';

export type CatalogSort =
  | 'title_asc'
  | 'title_desc'
  | 'year_desc'
  | 'year_asc'
  | 'auth_desc'
  | 'published_desc';

export type CatalogListOptions = {
  query?: string;
  sport?: DatabaseSportFilter;
  authenticatedOnly?: boolean;
  memorabiliaType?: string | null;
  year?: number;
  yearMin?: number;
  yearMax?: number;
  sort?: CatalogSort;
  limit?: number;
  offset?: number;
};

export type AuthenticatedAssetSummary = {
  id: string;
  asset_id: string;
  status: string;
  authenticated_at: string | null;
  verification_url: string | null;
  owner_user_id?: string | null;
};

function escapeIlike(term: string): string {
  return term.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

function ilikePattern(q: string): string {
  return `%${escapeIlike(q.trim())}%`;
}

/** Quoted pattern for PostgREST `.or('col.ilike.value,...')` filter strings. */
function postgrestOrIlikeValue(term: string): string {
  const pattern = ilikePattern(term);
  return `"${pattern.replace(/"/g, '""')}"`;
}

const SPORT_FILTER_NAMES: Record<
  Exclude<DatabaseSportFilter, 'ALL' | 'PLAYERS'>,
  string
> = {
  BASEBALL: 'Baseball',
  BASKETBALL: 'Basketball',
  FOOTBALL: 'Football'
};

// Supabase query builder types widen on each filter; keep this helper loosely typed.
function applyCatalogFilters(request: any, options: CatalogListOptions): any {
  const { sport, authenticatedOnly, memorabiliaType, year, yearMin, yearMax, query } = options;
  let q = request.eq('status', 'approved');

  if (sport && sport !== 'ALL') {
    if (sport === 'PLAYERS') {
      q = q.not('player_name', 'is', null);
    } else {
      q = q.eq('sport_name', SPORT_FILTER_NAMES[sport]);
    }
  }

  if (authenticatedOnly) q = q.gt('authenticated_count', 0);
  if (memorabiliaType?.trim()) q = q.ilike('memorabilia_type', ilikePattern(memorabiliaType.trim()));
  if (year != null) q = q.eq('year', year);
  if (yearMin != null) q = q.gte('year', yearMin);
  if (yearMax != null) q = q.lte('year', yearMax);

  const search = query?.trim() ?? '';
  if (search) {
    const pat = postgrestOrIlikeValue(search);
    q = q.or(
      `title.ilike.${pat},card_number.ilike.${pat},player_name.ilike.${pat},team_name.ilike.${pat},product_name.ilike.${pat},manufacturer_name.ilike.${pat}`
    );
  }

  return q;
}

function applySort(request: any, sort: CatalogSort = 'title_asc'): any {
  switch (sort) {
    case 'title_desc':
      return request.order('title', { ascending: false });
    case 'year_desc':
      return request.order('year', { ascending: false, nullsFirst: false }).order('title', {
        ascending: true
      });
    case 'year_asc':
      return request.order('year', { ascending: true, nullsFirst: false }).order('title', {
        ascending: true
      });
    case 'auth_desc':
      return request
        .order('authenticated_count', { ascending: false })
        .order('title', { ascending: true });
    case 'published_desc':
      return request
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('title', { ascending: true });
    case 'title_asc':
    default:
      return request.order('title', { ascending: true });
  }
}

export async function getCatalogStats(
  options: Pick<
    CatalogListOptions,
    'sport' | 'authenticatedOnly' | 'memorabiliaType' | 'yearMin' | 'yearMax' | 'query'
  > = {}
): Promise<{ stats: CatalogStats; error: string | null }> {
  let totalReq = supabase
    .from('card_public_summary')
    .select('*', { count: 'exact', head: true });
  totalReq = applyCatalogFilters(totalReq, options);

  let authReq = supabase
    .from('card_public_summary')
    .select('*', { count: 'exact', head: true });
  authReq = applyCatalogFilters(authReq, { ...options, authenticatedOnly: true });

  const [totalRes, authRes] = await Promise.all([totalReq, authReq]);

  if (totalRes.error) return { stats: { totalCards: 0, authenticatedCards: 0 }, error: totalRes.error.message };
  if (authRes.error) return { stats: { totalCards: 0, authenticatedCards: 0 }, error: authRes.error.message };

  return {
    stats: {
      totalCards: totalRes.count ?? 0,
      authenticatedCards: authRes.count ?? 0
    },
    error: null
  };
}

export async function listCatalogCards(
  options: CatalogListOptions = {}
): Promise<{ items: CardSummary[]; error: string | null }> {
  const { limit = 20, offset = 0, sort = 'title_asc' } = options;

  const cached = await getCachedCatalogList({ ...options, limit, offset, sort });
  if (cached) return { items: cached, error: null };

  let request = supabase.from('card_public_summary').select(SUMMARY_COLUMNS);
  request = applyCatalogFilters(request, options);
  request = applySort(request, sort);
  request = request.range(offset, offset + limit - 1);

  const { data, error } = await request;
  if (error) return { items: [], error: error.message };

  const rows = (data ?? []) as Omit<CardSummary, 'imageUrl'>[];
  const items = await attachImageUrls(rows);
  if (!error) void setCachedCatalogList({ ...options, limit, offset, sort }, items);
  return { items, error: null };
}

export async function searchApprovedCards(
  query: string,
  limit = 20
): Promise<{ items: CardSummary[]; error: string | null }> {
  return listCatalogCards({ query, limit });
}

export async function listTrendingCards(
  limit = 4,
  sport?: DatabaseSportFilter
): Promise<{ items: CardSummary[]; error: string | null }> {
  return listCatalogCards({ sport, authenticatedOnly: true, limit, sort: 'auth_desc' });
}

export async function listRecentCards(
  limit = 8,
  sport?: DatabaseSportFilter
): Promise<{ items: CardSummary[]; error: string | null }> {
  const primary = await listCatalogCards({ sport, limit, sort: 'published_desc' });
  if (!primary.error) return primary;
  if (!/published_at/i.test(primary.error)) return primary;
  return listCatalogCards({ sport, limit, sort: 'year_desc' });
}

export async function listAuthenticatedAssetsForCard(
  cardId: string
): Promise<{ items: AuthenticatedAssetSummary[]; error: string | null }> {
  const { data, error } = await supabase
    .from('authenticated_assets')
    .select('id, asset_id, status, authenticated_at, verification_url, owner_user_id')
    .eq('card_id', cardId)
    .eq('status', 'active')
    .order('authenticated_at', { ascending: false });

  if (error) return { items: [], error: error.message };
  return { items: (data ?? []) as AuthenticatedAssetSummary[], error: null };
}

export async function getAuthenticatedAssetById(
  assetId: string
): Promise<{
  asset: (AuthenticatedAssetSummary & { card_id: string }) | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('authenticated_assets')
    .select('id, asset_id, status, authenticated_at, verification_url, card_id')
    .eq('id', assetId)
    .maybeSingle();

  if (error) return { asset: null, error: error.message };
  return { asset: (data as AuthenticatedAssetSummary & { card_id: string }) ?? null, error: null };
}

export async function listCatalogCardsByMemorabiliaPiece(
  pieceId: string,
  excludeCardId?: string,
  limit = 8
): Promise<{ items: CardSummary[]; error: string | null }> {
  let request = supabase
    .from('card_public_summary')
    .select(SUMMARY_COLUMNS)
    .eq('status', 'approved')
    .eq('memorabilia_piece_id', pieceId)
    .order('year', { ascending: true, nullsFirst: false })
    .order('title', { ascending: true })
    .limit(limit);

  const { data, error } = await request;
  if (error) return { items: [], error: error.message };

  const rows = ((data ?? []) as Omit<CardSummary, 'imageUrl'>[]).filter(
    (row) => row.id !== excludeCardId
  );
  const items = await attachImageUrls(rows);
  return { items, error: null };
}

export async function getCardById(
  id: string
): Promise<{ card: CardDetail | null; error: string | null }> {
  const { data, error } = await supabase
    .from('card_public_summary')
    .select(SUMMARY_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) return { card: null, error: error.message };
  if (!data) return { card: null, error: null };

  const row = data as Omit<CardSummary, 'imageUrl'>;
  const [card] = await attachDetailImages([row]);
  return { card, error: null };
}
