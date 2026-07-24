import { supabase } from '@/lib/supabase';
import { HISTORY_OF_GAME_USED_FALLBACK } from '@/constants/educationTimelineSeed';

export type EducationTimelineSport = 'baseball' | 'basketball' | 'football' | 'misc';

export type EducationTimelineSportFilter = 'all' | EducationTimelineSport;

export type EducationTimelineListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  start_year: number;
  end_year: number;
  cover_image_url: string | null;
  original_image_url: string | null;
  pdf_url: string | null;
  publisher: string;
  source_type: string;
  rights_status: string;
  difficulty: string;
  estimated_read_minutes: number;
  published_at: string | null;
  updated_at: string | null;
};

export type EducationTimelineEvent = {
  id: string;
  sport: EducationTimelineSport;
  year_start: number;
  year_end: number | null;
  is_ongoing: boolean;
  manufacturer: string;
  product_name: string;
  event_title: string;
  short_summary: string;
  detailed_note: string | null;
  significance: string | null;
  is_first_across_sports: boolean;
  is_first_in_sport: boolean;
  display_order: number;
  related_card_ids: string[];
  related_discussion_ids: string[];
  related_most_wanted_ids: string[];
};

export type EducationTimelineSource = {
  id: string;
  timeline_event_id: string | null;
  citation_number: number;
  source_title: string;
  source_url: string | null;
  author: string | null;
  published_on: string | null;
  accessed_on: string | null;
  source_type: string;
  rights_or_permission_note: string | null;
};

export type EducationTimelineDetail = EducationTimelineListItem & {
  events: EducationTimelineEvent[];
  sources: EducationTimelineSource[];
};

export const EDUCATION_TIMELINE_SPORT_FILTERS: {
  key: EducationTimelineSportFilter;
  label: string;
}[] = [
  { key: 'all', label: 'ALL' },
  { key: 'baseball', label: 'BASEBALL' },
  { key: 'basketball', label: 'BASKETBALL' },
  { key: 'football', label: 'FOOTBALL' },
  { key: 'misc', label: 'OTHER' }
];

export const HISTORY_TIMELINE_SLUG = 'a-history-of-game-used-cards';

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeEvent(raw: Record<string, unknown>): EducationTimelineEvent {
  return {
    id: String(raw.id ?? ''),
    sport: (raw.sport as EducationTimelineSport) ?? 'misc',
    year_start: Number(raw.year_start ?? 0),
    year_end: raw.year_end == null ? null : Number(raw.year_end),
    is_ongoing: Boolean(raw.is_ongoing),
    manufacturer: String(raw.manufacturer ?? ''),
    product_name: String(raw.product_name ?? ''),
    event_title: String(raw.event_title ?? ''),
    short_summary: String(raw.short_summary ?? ''),
    detailed_note: raw.detailed_note == null ? null : String(raw.detailed_note),
    significance: raw.significance == null ? null : String(raw.significance),
    is_first_across_sports: Boolean(raw.is_first_across_sports),
    is_first_in_sport: Boolean(raw.is_first_in_sport),
    display_order: Number(raw.display_order ?? 0),
    related_card_ids: asStringArray(raw.related_card_ids),
    related_discussion_ids: asStringArray(raw.related_discussion_ids),
    related_most_wanted_ids: asStringArray(raw.related_most_wanted_ids)
  };
}

function normalizeSource(raw: Record<string, unknown>): EducationTimelineSource {
  return {
    id: String(raw.id ?? ''),
    timeline_event_id: raw.timeline_event_id == null ? null : String(raw.timeline_event_id),
    citation_number: Number(raw.citation_number ?? 0),
    source_title: String(raw.source_title ?? ''),
    source_url: raw.source_url == null ? null : String(raw.source_url),
    author: raw.author == null ? null : String(raw.author),
    published_on: raw.published_on == null ? null : String(raw.published_on),
    accessed_on: raw.accessed_on == null ? null : String(raw.accessed_on),
    source_type: String(raw.source_type ?? ''),
    rights_or_permission_note:
      raw.rights_or_permission_note == null ? null : String(raw.rights_or_permission_note)
  };
}

function normalizeDetail(raw: Record<string, unknown>): EducationTimelineDetail {
  const eventsRaw = Array.isArray(raw.events) ? raw.events : [];
  const sourcesRaw = Array.isArray(raw.sources) ? raw.sources : [];
  return {
    id: String(raw.id ?? ''),
    slug: String(raw.slug ?? ''),
    title: String(raw.title ?? ''),
    summary: String(raw.summary ?? ''),
    start_year: Number(raw.start_year ?? 0),
    end_year: Number(raw.end_year ?? 0),
    cover_image_url: raw.cover_image_url == null ? null : String(raw.cover_image_url),
    original_image_url: raw.original_image_url == null ? null : String(raw.original_image_url),
    pdf_url: raw.pdf_url == null ? null : String(raw.pdf_url),
    publisher: String(raw.publisher ?? 'Which Game Used'),
    source_type: String(raw.source_type ?? ''),
    rights_status: String(raw.rights_status ?? ''),
    difficulty: String(raw.difficulty ?? 'intermediate'),
    estimated_read_minutes: Number(raw.estimated_read_minutes ?? 12),
    published_at: raw.published_at == null ? null : String(raw.published_at),
    updated_at: raw.updated_at == null ? null : String(raw.updated_at),
    events: eventsRaw.map((item) => normalizeEvent(item as Record<string, unknown>)),
    sources: sourcesRaw.map((item) => normalizeSource(item as Record<string, unknown>))
  };
}

function isMissingRpcError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes('could not find the function') ||
    lower.includes('does not exist') ||
    lower.includes('schema cache') ||
    lower.includes('pgrst202') ||
    lower.includes('pgrst205')
  );
}

export async function fetchPublishedTimelines(): Promise<{
  timelines: EducationTimelineListItem[];
  usedFallback: boolean;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase.rpc('list_published_education_timelines');
    if (error) {
      if (isMissingRpcError(error.message)) {
        return {
          timelines: [HISTORY_OF_GAME_USED_FALLBACK],
          usedFallback: true,
          error: null
        };
      }
      return { timelines: [], usedFallback: false, error: error.message };
    }
    const rows = Array.isArray(data) ? data : [];
    return {
      timelines: rows.map((row) => {
        const detail = normalizeDetail({ ...(row as Record<string, unknown>), events: [], sources: [] });
        const { events: _e, sources: _s, ...item } = detail;
        return item;
      }),
      usedFallback: false,
      error: null
    };
  } catch (err) {
    return {
      timelines: [HISTORY_OF_GAME_USED_FALLBACK],
      usedFallback: true,
      error: err instanceof Error ? err.message : 'Failed to load timelines'
    };
  }
}

export async function fetchTimelineBySlug(slug: string): Promise<{
  timeline: EducationTimelineDetail | null;
  usedFallback: boolean;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase.rpc('get_education_timeline', { p_slug: slug });
    if (error) {
      if (isMissingRpcError(error.message) && slug === HISTORY_TIMELINE_SLUG) {
        return { timeline: HISTORY_OF_GAME_USED_FALLBACK, usedFallback: true, error: null };
      }
      return { timeline: null, usedFallback: false, error: error.message };
    }
    if (data == null) {
      if (slug === HISTORY_TIMELINE_SLUG) {
        // Draft/unpublished or migration not applied — allow local fallback only when RPC returned null
        // after a missing-function path is already handled above. For true null (draft), do not fall back.
        return { timeline: null, usedFallback: false, error: null };
      }
      return { timeline: null, usedFallback: false, error: null };
    }
    return {
      timeline: normalizeDetail(data as Record<string, unknown>),
      usedFallback: false,
      error: null
    };
  } catch (err) {
    if (slug === HISTORY_TIMELINE_SLUG) {
      return { timeline: HISTORY_OF_GAME_USED_FALLBACK, usedFallback: true, error: null };
    }
    return {
      timeline: null,
      usedFallback: false,
      error: err instanceof Error ? err.message : 'Failed to load timeline'
    };
  }
}

export function filterEventsBySport(
  events: EducationTimelineEvent[],
  sport: EducationTimelineSportFilter
): EducationTimelineEvent[] {
  const filtered = sport === 'all' ? events : events.filter((event) => event.sport === sport);
  return [...filtered].sort((a, b) => {
    if (a.year_start !== b.year_start) return a.year_start - b.year_start;
    if (a.display_order !== b.display_order) return a.display_order - b.display_order;
    return a.event_title.localeCompare(b.event_title);
  });
}

export function distinctYears(events: EducationTimelineEvent[]): number[] {
  const years = new Set(events.map((event) => event.year_start));
  return [...years].sort((a, b) => a - b);
}

export function groupEventsByYear(
  events: EducationTimelineEvent[]
): { year: number; events: EducationTimelineEvent[] }[] {
  const map = new Map<number, EducationTimelineEvent[]>();
  for (const event of filterEventsBySport(events, 'all')) {
    const list = map.get(event.year_start) ?? [];
    list.push(event);
    map.set(event.year_start, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, yearEvents]) => ({ year, events: yearEvents }));
}

export function formatYearRange(event: EducationTimelineEvent): {
  primary: string;
  introduced: string | null;
  continuedThrough: string | null;
  ongoing: boolean;
} {
  const start = event.year_start;
  const end = event.year_end;
  if (end == null || end === start) {
    return {
      primary: String(start),
      introduced: null,
      continuedThrough: null,
      ongoing: event.is_ongoing
    };
  }
  if (event.is_ongoing) {
    return {
      primary: `${start}–present`,
      introduced: `Introduced: ${start}`,
      continuedThrough: 'Ongoing',
      ongoing: true
    };
  }
  return {
    primary: `${start}–${end}`,
    introduced: `Introduced: ${start}`,
    continuedThrough: `Continued through: ${end}`,
    ongoing: false
  };
}

export function sportLabel(sport: EducationTimelineSport): string {
  switch (sport) {
    case 'baseball':
      return 'Baseball';
    case 'basketball':
      return 'Basketball';
    case 'football':
      return 'Football';
    case 'misc':
      return 'Other';
  }
}

export function significanceLabel(significance: string | null): string | null {
  if (!significance) return null;
  return significance
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function sourcesForEvent(
  sources: EducationTimelineSource[],
  eventId: string
): EducationTimelineSource[] {
  return sources
    .filter((source) => source.timeline_event_id === eventId)
    .sort((a, b) => a.citation_number - b.citation_number);
}

export function relatedActionsForEvent(event: EducationTimelineEvent): {
  cards: string[];
  discussions: string[];
  mostWanted: string[];
} {
  return {
    cards: event.related_card_ids,
    discussions: event.related_discussion_ids,
    mostWanted: event.related_most_wanted_ids
  };
}

export function difficultyLabel(difficulty: string): string {
  if (difficulty === 'all') return 'All levels';
  if (difficulty === 'beginner') return 'Beginner';
  return 'Intermediate';
}

export function rightsLabel(rights: string): string {
  switch (rights) {
    case 'owned':
      return 'Owned';
    case 'licensed':
      return 'Licensed';
    case 'permission_received':
      return 'Permission received';
    case 'external_link_only':
      return 'External link only';
    case 'pending_review':
      return 'Rights pending';
    default:
      return rights;
  }
}
