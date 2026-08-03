import { supabase } from '@/lib/supabase';
import type { CardEvidenceAttributeKey } from '@/constants/reputationContent';

export type ReputationProfile = {
  userId: string;
  lifetimeXp: number;
  rankLevel: number;
  rankKey: string | null;
  rankLabel: string | null;
  xpMin: number | null;
  xpMax: number | null;
  nextRankLabel: string | null;
  nextRankXpMin: number | null;
  customSubtitle: string | null;
  customSubtitleStatus: string;
  customSubtitlePending: string | null;
  donutsBalance: number;
  donutsReceivedTotal: number;
  badges: { badgeKey: string; label: string; awardedAt: string; reason: string | null }[];
};

export type CardEvidenceAttributes = {
  cardId: string;
  photoMatched: boolean;
  catalogued: boolean;
  evidencePublished: boolean;
  trending: boolean;
  topRated: boolean;
  trendingScore: number;
  topRatedScore: number;
  topRatedVoteCount: number;
  activeKeys: CardEvidenceAttributeKey[];
};

function mapProfile(raw: unknown): ReputationProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const badgesRaw = Array.isArray(o.badges) ? o.badges : [];
  return {
    userId: String(o.user_id ?? ''),
    lifetimeXp: Number(o.lifetime_xp ?? 0),
    rankLevel: Number(o.rank_level ?? 1),
    rankKey: o.rank_key == null ? null : String(o.rank_key),
    rankLabel: o.rank_label == null ? null : String(o.rank_label),
    xpMin: o.xp_min == null ? null : Number(o.xp_min),
    xpMax: o.xp_max == null ? null : Number(o.xp_max),
    nextRankLabel: o.next_rank_label == null ? null : String(o.next_rank_label),
    nextRankXpMin: o.next_rank_xp_min == null ? null : Number(o.next_rank_xp_min),
    customSubtitle: o.custom_subtitle == null ? null : String(o.custom_subtitle),
    customSubtitleStatus: String(o.custom_subtitle_status ?? 'none'),
    customSubtitlePending: o.custom_subtitle_pending == null ? null : String(o.custom_subtitle_pending),
    donutsBalance: Number(o.donuts_balance ?? 0),
    donutsReceivedTotal: Number(o.donuts_received_total ?? 0),
    badges: badgesRaw.map((b) => {
      const row = b as Record<string, unknown>;
      return {
        badgeKey: String(row.badge_key ?? ''),
        label: String(row.label ?? ''),
        awardedAt: String(row.awarded_at ?? ''),
        reason: row.reason == null ? null : String(row.reason)
      };
    })
  };
}

export async function fetchReputationProfile(userId: string): Promise<{
  profile: ReputationProfile | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('reputation_get_profile', { p_user_id: userId });
  if (error) return { profile: null, error: error.message };
  return { profile: mapProfile(data), error: null };
}

export async function giftDonut(input: {
  toUserId: string;
  targetType: string;
  targetId: string;
  amount?: number;
  reason?: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('donuts_gift', {
    p_to_user_id: input.toUserId,
    p_target_type: input.targetType,
    p_target_id: input.targetId,
    p_amount: input.amount ?? 1,
    p_reason: input.reason ?? null
  });
  return { error: error?.message ?? null };
}

export async function fetchCardEvidenceAttributes(cardId: string): Promise<{
  attributes: CardEvidenceAttributes | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('get_card_evidence_attributes', {
    p_card_id: cardId
  });
  if (error) return { attributes: null, error: error.message };
  if (!data || typeof data !== 'object') return { attributes: null, error: null };
  return {
    attributes: mapAttributesFromRaw(data as Record<string, unknown>, cardId),
    error: null
  };
}

export async function requestCustomSubtitle(subtitle: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('reputation_request_custom_subtitle', {
    p_subtitle: subtitle
  });
  return { error: error?.message ?? null };
}

/** Map of evidence_id → confirmed/auto quality level (1–5). */
export async function fetchEvidenceQualityLevels(
  evidenceIds: string[]
): Promise<{ levels: Record<string, number>; error: string | null }> {
  if (evidenceIds.length === 0) return { levels: {}, error: null };
  const { data, error } = await supabase
    .from('evidence_quality_ratings')
    .select('evidence_id, quality_level')
    .in('evidence_id', evidenceIds);
  if (error) return { levels: {}, error: error.message };
  const levels: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = String((row as { evidence_id: string }).evidence_id);
    const level = Number((row as { quality_level: number }).quality_level);
    if (id && level >= 1) levels[id] = level;
  }
  return { levels, error: null };
}

export type ReputationBoardKey = 'lifetime' | 'evidence' | 'most_wanted' | 'donuts';

export type CardResearcher = {
  userId: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  rankLevel: number;
};

export type CardEvidenceFileSummary = {
  cardId: string;
  attributes: CardEvidenceAttributes | null;
  researchers: CardResearcher[];
  donutsReceived: number;
  topQualityLevel: number | null;
  /** Community research rating (1–5 scale), when available. */
  communityScore: number | null;
  communityVoteCount: number;
};

function mapAttributesFromRaw(o: Record<string, unknown>, cardId: string): CardEvidenceAttributes {
  const flags: CardEvidenceAttributeKey[] = [];
  if (o.photo_matched) flags.push('photo_matched');
  if (o.catalogued) flags.push('catalogued');
  if (o.evidence_published) flags.push('evidence_published');
  if (o.trending) flags.push('trending');
  if (o.top_rated) flags.push('top_rated');
  return {
    cardId: String(o.card_id ?? cardId),
    photoMatched: Boolean(o.photo_matched),
    catalogued: Boolean(o.catalogued),
    evidencePublished: Boolean(o.evidence_published),
    trending: Boolean(o.trending),
    topRated: Boolean(o.top_rated),
    trendingScore: Number(o.trending_score ?? 0),
    topRatedScore: Number(o.top_rated_score ?? 0),
    topRatedVoteCount: Number(o.top_rated_vote_count ?? 0),
    activeKeys: flags
  };
}

function resolveCommunityScore(
  o: Record<string, unknown>,
  attrs: CardEvidenceAttributes | null
): { score: number | null; votes: number } {
  const rawScore = o.community_score ?? o.community_research_rating;
  const rawVotes = o.community_vote_count ?? o.community_research_vote_count;
  if (rawScore != null && Number(rawScore) > 0) {
    return {
      score: Number(rawScore),
      votes: Number(rawVotes ?? attrs?.topRatedVoteCount ?? 0)
    };
  }
  if (attrs && attrs.topRatedScore > 0) {
    return { score: attrs.topRatedScore, votes: attrs.topRatedVoteCount };
  }
  return { score: null, votes: attrs?.topRatedVoteCount ?? 0 };
}

export async function fetchCardEvidenceFile(cardId: string): Promise<{
  summary: CardEvidenceFileSummary | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('get_card_evidence_file', {
    p_card_id: cardId
  });
  if (error) {
    const attrs = await fetchCardEvidenceAttributes(cardId);
    const scoreInfo = resolveCommunityScore({}, attrs.attributes);
    return {
      summary: attrs.attributes
        ? {
            cardId,
            attributes: attrs.attributes,
            researchers: [],
            donutsReceived: 0,
            topQualityLevel: null,
            communityScore: scoreInfo.score,
            communityVoteCount: scoreInfo.votes
          }
        : null,
      error: error.message
    };
  }
  if (!data || typeof data !== 'object') return { summary: null, error: null };
  const o = data as Record<string, unknown>;
  const attrsRaw =
    o.attributes && typeof o.attributes === 'object'
      ? (o.attributes as Record<string, unknown>)
      : {};
  const attributes = mapAttributesFromRaw(attrsRaw, cardId);
  const scoreInfo = resolveCommunityScore(o, attributes);
  const researchersRaw = Array.isArray(o.researchers) ? o.researchers : [];
  return {
    summary: {
      cardId: String(o.card_id ?? cardId),
      attributes,
      researchers: researchersRaw.map((r) => {
        const row = r as Record<string, unknown>;
        return {
          userId: String(row.user_id ?? ''),
          displayName: row.display_name == null ? null : String(row.display_name),
          username: row.username == null ? null : String(row.username),
          avatarUrl: row.avatar_url == null ? null : String(row.avatar_url),
          rankLevel: Number(row.rank_level ?? 1)
        };
      }),
      donutsReceived: Number(o.donuts_received ?? 0),
      topQualityLevel:
        o.top_quality_level == null || Number(o.top_quality_level) < 1
          ? null
          : Number(o.top_quality_level),
      communityScore: scoreInfo.score,
      communityVoteCount: scoreInfo.votes
    },
    error: null
  };
}

export async function listReputationBoard(
  board: ReputationBoardKey,
  limit = 20
): Promise<{
  items: {
    userId: string;
    rank: number;
    displayName: string;
    username: string | null;
    avatarUrl: string | null;
    points: number;
    eventCount: number;
    metricLabel: string;
  }[];
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('list_reputation_board', {
    p_board: board,
    p_limit: limit
  });
  if (error) return { items: [], error: error.message };
  return {
    items: ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
      userId: String(row.user_id),
      rank: Number(row.rank),
      displayName: String(row.display_name || row.username || 'Collector'),
      username: row.username == null ? null : String(row.username),
      avatarUrl: row.avatar_url == null ? null : String(row.avatar_url),
      points: Number(row.points ?? 0),
      eventCount: Number(row.event_count ?? 0),
      metricLabel: String(row.metric_label ?? 'Score')
    })),
    error: null
  };
}

export async function getReputationBoardStanding(
  userId: string,
  board: ReputationBoardKey
): Promise<{
  entry: {
    userId: string;
    rank: number;
    displayName: string;
    username: string | null;
    avatarUrl: string | null;
    points: number;
    eventCount: number;
    metricLabel: string;
  } | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('get_reputation_board_standing', {
    p_user_id: userId,
    p_board: board
  });
  if (error) return { entry: null, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') return { entry: null, error: null };
  const o = row as Record<string, unknown>;
  return {
    entry: {
      userId: String(o.user_id),
      rank: Number(o.rank),
      displayName: String(o.display_name || o.username || 'Collector'),
      username: o.username == null ? null : String(o.username),
      avatarUrl: o.avatar_url == null ? null : String(o.avatar_url),
      points: Number(o.points ?? 0),
      eventCount: Number(o.event_count ?? 0),
      metricLabel: String(o.metric_label ?? 'Score')
    },
    error: null
  };
}

export type RankLevelRow = {
  userId: string;
  rankLevel: number;
  rankKey: string | null;
  rankLabel: string | null;
};

export async function fetchReputationRankLevels(
  userIds: string[]
): Promise<{ levels: Record<string, RankLevelRow>; error: string | null }> {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (ids.length === 0) return { levels: {}, error: null };
  const { data, error } = await supabase.rpc('reputation_rank_levels_for_users', {
    p_user_ids: ids
  });
  if (error) return { levels: {}, error: error.message };
  const levels: Record<string, RankLevelRow> = {};
  for (const row of data ?? []) {
    const o = row as Record<string, unknown>;
    const id = String(o.user_id ?? '');
    if (!id) continue;
    levels[id] = {
      userId: id,
      rankLevel: Number(o.rank_level ?? 1),
      rankKey: o.rank_key == null ? null : String(o.rank_key),
      rankLabel: o.rank_label == null ? null : String(o.rank_label)
    };
  }
  return { levels, error: null };
}
