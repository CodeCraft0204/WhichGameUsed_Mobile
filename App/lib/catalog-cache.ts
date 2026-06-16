import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CardSummary, CatalogListOptions } from '@/lib/cards';

const CACHE_TTL_MS = 5 * 60 * 1000;
const PREFIX = 'catalog-cache:v2:';

type CacheEntry = {
  items: CardSummary[];
  fetchedAt: number;
};

function cacheKey(options: CatalogListOptions): string {
  return `${PREFIX}${JSON.stringify({
    query: options.query?.trim() ?? '',
    sport: options.sport ?? 'ALL',
    sort: options.sort ?? 'title_asc',
    limit: options.limit ?? 20,
    offset: options.offset ?? 0,
    authenticatedOnly: !!options.authenticatedOnly,
    memorabiliaType: options.memorabiliaType ?? '',
    yearMin: options.yearMin ?? null,
    yearMax: options.yearMax ?? null
  })}`;
}

export async function getCachedCatalogList(
  options: CatalogListOptions
): Promise<CardSummary[] | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(options));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry.items;
  } catch {
    return null;
  }
}

export async function setCachedCatalogList(
  options: CatalogListOptions,
  items: CardSummary[]
): Promise<void> {
  if (items.length === 0) return;
  try {
    const entry: CacheEntry = { items, fetchedAt: Date.now() };
    await AsyncStorage.setItem(cacheKey(options), JSON.stringify(entry));
  } catch {
    // ignore cache write failures
  }
}

export async function invalidateCatalogCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const catalogKeys = keys.filter((k) => k.startsWith(PREFIX));
    if (catalogKeys.length > 0) await AsyncStorage.multiRemove(catalogKeys);
  } catch {
    // ignore
  }
}
