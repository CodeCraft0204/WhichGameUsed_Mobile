import type { DatabaseSportFilter } from '@/lib/cards';
import type { CatalogSort } from '@/lib/cards';

export const databaseSportTabs: DatabaseSportFilter[] = [
  'ALL',
  'BASEBALL',
  'BASKETBALL',
  'FOOTBALL',
  'HOCKEY'
];

export type YearRangeKey =
  | 'ALL'
  | '1900-1950'
  | '1950-2000'
  | '2000-2010'
  | '2010-2015'
  | '2016-2025';

export type YearRangeOption = {
  key: YearRangeKey;
  label: string;
  min?: number;
  max?: number;
};

export const databaseYearRanges: YearRangeOption[] = [
  { key: 'ALL', label: 'ALL' },
  { key: '1900-1950', label: '1900–1950', min: 1900, max: 1950 },
  { key: '1950-2000', label: '1950–2000', min: 1950, max: 2000 },
  { key: '2000-2010', label: '2000–2010', min: 2000, max: 2010 },
  { key: '2010-2015', label: '2010–2015', min: 2010, max: 2015 },
  { key: '2016-2025', label: '2016–2025', min: 2016, max: 2025 }
];

export const catalogSortOptions: { key: CatalogSort; label: string }[] = [
  { key: 'title_asc', label: 'Title A–Z' },
  { key: 'title_desc', label: 'Title Z–A' },
  { key: 'year_desc', label: 'Year (newest)' },
  { key: 'year_asc', label: 'Year (oldest)' },
  { key: 'auth_desc', label: 'Most authenticated' }
];

export type DatabaseFilterState = {
  sport: DatabaseSportFilter;
  yearRange: YearRangeKey;
  authenticatedOnly: boolean;
  memorabiliaType: string | null;
  sort: CatalogSort;
};

export const defaultDatabaseFilters: DatabaseFilterState = {
  sport: 'ALL',
  yearRange: 'ALL',
  authenticatedOnly: false,
  memorabiliaType: null,
  sort: 'title_asc'
};

export function yearRangeToBounds(key: YearRangeKey): { yearMin?: number; yearMax?: number } {
  const opt = databaseYearRanges.find((r) => r.key === key);
  if (!opt || key === 'ALL') return {};
  return { yearMin: opt.min, yearMax: opt.max };
}
