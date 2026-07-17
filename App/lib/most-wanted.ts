import * as ImagePicker from 'expo-image-picker';
import { resolveCardImageUrl } from '@/lib/card-images';
import type {
  MostWantedEvidenceTypeKey,
  MostWantedFilterTab,
  MostWantedSortKey
} from '@/constants/mostWantedCopy';
import { supabase } from '@/lib/supabase';
import {
  huntEngagementMetrics,
  requirementCollectionStatus,
  type CollectionStatus
} from '@/lib/most-wanted-metrics';

export { huntEngagementMetrics, requirementCollectionStatus };
export type { CollectionStatus };

const BUCKET = 'user-content';

export type HuntImageFields = {
  card_id?: string | null;
  cover_image_url?: string | null;
  imageUrl?: string | null;
};

export type MostWantedHuntRow = HuntImageFields & {
  id: string;
  card_title: string;
  player_name: string | null;
  team_name: string | null;
  product_year: number | null;
  product_name: string | null;
  card_number: string | null;
  memorabilia_type: string | null;
  sport_slug: string;
  status: string;
  priority_tag: string | null;
  reward_amount_cents: number;
  reward_label: string | null;
  featured_at: string | null;
  watcher_count: number;
  requirements_total: number;
  requirements_fulfilled: number;
  needed_labels: string[];
  is_watching: boolean;
  comment_count?: number;
  contributor_count?: number;
  evidence_submission_count?: number;
};

export type MostWantedStats = {
  activeHunts: number;
  solvedThisMonth: number;
  rewardPoolCents: number;
  contributorCount: number;
  badgesAwarded: number;
};

export type MostWantedContributorBadgeRow = {
  id: string;
  hunt_id: string;
  user_id: string;
  display_name: string;
  submission_id: string | null;
  badge_key: string;
  badge_label: string;
  source: string;
  confirmed_at: string | null;
  created_at: string;
};

export type MostWantedRequirement = {
  id: string;
  requirement_key: string;
  label: string;
  sort_order: number;
  is_fulfilled: boolean;
  collection_status?: CollectionStatus;
};

export type MostWantedLead = {
  id: string;
  evidence_type: string;
  source_url: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  submitter_name: string;
  image_bucket?: string | null;
  image_storage_path?: string | null;
  imageUrl?: string | null;
};

export type MostWantedHuntDetail = HuntImageFields & {
  id: string;
  card_title: string;
  player_name: string | null;
  team_name: string | null;
  product_year: number | null;
  product_name: string | null;
  card_number: string | null;
  manufacturer_name: string | null;
  memorabilia_type: string | null;
  sport_slug: string;
  cover_image_url: string | null;
  summary: string | null;
  status: string;
  priority_tag: string | null;
  featured_at?: string | null;
  reward_amount_cents: number;
  reward_label: string | null;
  forum_thread_id: string | null;
  card_id: string | null;
  card_request_id: string | null;
  solved_at: string | null;
  solved_by: string | null;
  solver_name?: string | null;
};

export type MostWantedDetailPayload = {
  hunt: MostWantedHuntDetail;
  requirements: MostWantedRequirement[];
  leads: MostWantedLead[];
  watcher_count: number;
  is_watching: boolean;
  contributor_count?: number;
  evidence_submission_count?: number;
  comment_count?: number;
};

export type MostWantedContribution = {
  id: string;
  hunt_id: string;
  hunt_title: string;
  evidence_type: string;
  status: string;
  created_at: string;
  review_notes: string | null;
};

export type SolvedHuntRow = HuntImageFields & {
  id: string;
  card_id?: string | null;
  card_title: string;
  player_name: string | null;
  product_year: number | null;
  product_name: string | null;
  memorabilia_type: string | null;
  sport_slug: string;
  reward_label: string | null;
  solved_at: string | null;
  solver_name: string;
  requirements_total: number;
  requirements_fulfilled: number;
  contributor_count?: number;
  top_contributors?: string[];
};

export type BountyRankingRow = {
  card_request_id: string;
  card_title: string | null;
  player_name: string | null;
  product_name: string | null;
  product_year: number | null;
  status: string;
  wishlist_count: number;
  comment_count?: number;
  vote_score: number;
  bounty_score: number;
  user_vote?: 'upvote' | 'downvote' | null;
};

const mostWantedRealtimeListeners = new Set<() => void>();
let mostWantedRealtimeChannel: ReturnType<typeof supabase.channel> | null = null;

function notifyMostWantedListeners() {
  mostWantedRealtimeListeners.forEach((listener) => listener());
}

export function subscribeMostWantedChanges(onChange: () => void): () => void {
  mostWantedRealtimeListeners.add(onChange);

  if (!mostWantedRealtimeChannel) {
    mostWantedRealtimeChannel = supabase
      .channel('most-wanted-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'most_wanted_hunts' },
        () => notifyMostWantedListeners()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'most_wanted_evidence_submissions' },
        () => notifyMostWantedListeners()
      )
      .subscribe();
  }

  return () => {
    mostWantedRealtimeListeners.delete(onChange);
    if (mostWantedRealtimeListeners.size === 0 && mostWantedRealtimeChannel) {
      void supabase.removeChannel(mostWantedRealtimeChannel);
      mostWantedRealtimeChannel = null;
    }
  };
}

export type WantedStatusTag =
  | 'need_images'
  | 'need_source'
  | 'need_research'
  | 'near_solved'
  | 'high_value'
  | 'verified_lead';

export function huntDisplayTitle(hunt: Pick<MostWantedHuntRow, 'card_title' | 'player_name'>): string {
  return hunt.card_title?.trim() || hunt.player_name?.trim() || 'Most Wanted hunt';
}

export function huntSubtitle(hunt: Pick<MostWantedHuntRow, 'sport_slug' | 'memorabilia_type' | 'priority_tag' | 'status'>): string {
  const sport = hunt.sport_slug.charAt(0).toUpperCase() + hunt.sport_slug.slice(1);
  const parts = [sport];
  if (hunt.memorabilia_type) parts.push(hunt.memorabilia_type);
  if (hunt.priority_tag === 'high_value') parts.push('High Priority');
  return parts.join(' · ');
}

export function huntStatusTags(hunt: MostWantedHuntRow): WantedStatusTag[] {
  return huntStatusTagsFromLabels(
    hunt.needed_labels,
    hunt.status,
    hunt.priority_tag,
    hunt.requirements_fulfilled,
    hunt.requirements_total
  );
}

export function huntStatusTagsFromLabels(
  neededLabels: string[],
  status: string,
  priorityTag: string | null,
  fulfilledCount = 0,
  totalCount = 0
): WantedStatusTag[] {
  const tags: WantedStatusTag[] = [];
  const needed = neededLabels.map((l) => l.toLowerCase());

  if (needed.some((l) => l.includes('front') || l.includes('back'))) tags.push('need_images');
  if (needed.some((l) => l.includes('source') || l.includes('auction'))) tags.push('need_source');
  if (needed.some((l) => l.includes('game') || l.includes('research'))) tags.push('need_research');
  if (status === 'near_solved') tags.push('near_solved');
  if (priorityTag === 'high_value') tags.push('high_value');
  if (fulfilledCount > 0 && fulfilledCount < totalCount) tags.push('verified_lead');

  return tags;
}

async function fetchCardFrontFileIds(cardIds: string[]): Promise<Map<string, string | null>> {
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

async function attachHuntImageUrls<T extends HuntImageFields>(rows: T[]): Promise<T[]> {
  const cardIds = rows.map((r) => r.card_id).filter((id): id is string => !!id);
  const fileIds = await fetchCardFrontFileIds(cardIds);
  const out: T[] = [];

  for (const row of rows) {
    let imageUrl: string | null = row.cover_image_url ?? null;
    if (!imageUrl && row.card_id) {
      const fileId = fileIds.get(row.card_id);
      if (fileId) imageUrl = await resolveCardImageUrl(fileId);
    }
    out.push({ ...row, imageUrl });
  }
  return out;
}

export async function resolveHuntImageUrl(hunt: HuntImageFields): Promise<string | null> {
  if (hunt.imageUrl) return hunt.imageUrl;
  if (hunt.cover_image_url) return hunt.cover_image_url;
  if (!hunt.card_id) return null;
  const fileIds = await fetchCardFrontFileIds([hunt.card_id]);
  const fileId = fileIds.get(hunt.card_id);
  return fileId ? resolveCardImageUrl(fileId) : null;
}

export function evidenceTypeLabel(key: string): string {
  const map: Record<string, string> = {
    card_front: 'Card Front',
    card_back: 'Card Back',
    source_link: 'Source Link',
    jersey_reference: 'Jersey Reference',
    screenshot: 'Screenshot',
    research_note: 'Research Note'
  };
  return map[key] ?? key.replace(/_/g, ' ');
}

export function leadSummary(lead: MostWantedLead): string {
  if (lead.evidence_type === 'source_link' && lead.source_url) {
    return `${lead.submitter_name} submitted source link`;
  }
  if (lead.evidence_type === 'jersey_reference') {
    return `${lead.submitter_name} uploaded jersey reference`;
  }
  if (lead.evidence_type === 'research_note') {
    return `${lead.submitter_name} added research note`;
  }
  if (lead.evidence_type === 'card_front' || lead.evidence_type === 'card_back') {
    return `${lead.submitter_name} uploaded card image`;
  }
  return `${lead.submitter_name} submitted evidence`;
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export async function fetchMostWantedStats(): Promise<{ stats: MostWantedStats | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_most_wanted_stats');
  if (error) return { stats: null, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return {
      stats: {
        activeHunts: 0,
        solvedThisMonth: 0,
        rewardPoolCents: 0,
        contributorCount: 0,
        badgesAwarded: 0
      },
      error: null
    };
  }
  return {
    stats: {
      activeHunts: row.active_hunts ?? 0,
      solvedThisMonth: row.solved_this_month ?? 0,
      rewardPoolCents: row.reward_pool_cents ?? 0,
      contributorCount: row.contributor_count ?? 0,
      badgesAwarded: row.badges_awarded ?? 0
    },
    error: null
  };
}

export async function listHuntContributorBadges(
  huntId: string
): Promise<{ items: MostWantedContributorBadgeRow[]; error: string | null }> {
  const { data, error } = await supabase.rpc('list_most_wanted_hunt_badges', { p_hunt_id: huntId });
  if (error) return { items: [], error: error.message };
  return { items: (data ?? []) as MostWantedContributorBadgeRow[], error: null };
}

export async function listMostWantedHunts(opts?: {
  filter?: MostWantedFilterTab;
  sort?: MostWantedSortKey;
  search?: string;
}): Promise<{ items: MostWantedHuntRow[]; error: string | null }> {
  const { data, error } = await supabase.rpc('list_most_wanted_hunts', {
    p_filter: opts?.filter ?? 'ALL',
    p_sort: opts?.sort ?? 'most_wanted',
    p_search: opts?.search?.trim() || null,
    p_limit: 50,
    p_offset: 0
  });
  if (error) return { items: [], error: error.message };
  const items = await attachHuntImageUrls((data ?? []) as MostWantedHuntRow[]);
  return { items, error: null };
}

export async function fetchFeaturedMostWanted(): Promise<{ item: MostWantedHuntRow | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_most_wanted_featured');
  if (error) return { item: null, error: error.message };
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return { item: null, error: null };
  const [item] = await attachHuntImageUrls([row as MostWantedHuntRow]);
  return { item: item ?? null, error: null };
}

/** Related Most Wanted item for a catalog card (active / near solved preferred). */
export async function findMostWantedByCardId(
  cardId: string
): Promise<{ item: Pick<MostWantedHuntRow, 'id' | 'card_title' | 'status' | 'reward_label'> | null; error: string | null }> {
  const { data, error } = await supabase
    .from('most_wanted_hunts')
    .select('id, card_title, status, reward_label')
    .eq('card_id', cardId)
    .in('status', ['active', 'near_solved', 'solved'])
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) return { item: null, error: error.message };
  const row = (data ?? [])[0] as
    | Pick<MostWantedHuntRow, 'id' | 'card_title' | 'status' | 'reward_label'>
    | undefined;
  if (!row) return { item: null, error: null };
  return { item: row, error: null };
}

/** Hunt promoted from a given card request, if any (public read policy on most_wanted_hunts). */
export async function getHuntForCardRequest(
  cardRequestId: string
): Promise<{ hunt: { id: string; card_title: string; status: string } | null; error: string | null }> {
  const { data, error } = await supabase
    .from('most_wanted_hunts')
    .select('id, card_title, status')
    .eq('card_request_id', cardRequestId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) return { hunt: null, error: error.message };
  const row = (data ?? [])[0] as { id: string; card_title: string; status: string } | undefined;
  return { hunt: row ?? null, error: null };
}

export async function getMostWantedDetail(id: string): Promise<{ detail: MostWantedDetailPayload | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_most_wanted_hunt_detail', { p_hunt_id: id });
  if (error) return { detail: null, error: error.message };
  if (!data) return { detail: null, error: 'Hunt not found.' };
  const payload = data as {
    hunt: MostWantedHuntDetail;
    requirements: MostWantedRequirement[];
    leads: MostWantedLead[];
    watcher_count: number;
    is_watching: boolean;
    contributor_count?: number;
    evidence_submission_count?: number;
    comment_count?: number;
  };
  const imageUrl = await resolveHuntImageUrl(payload.hunt);
  const leads = await Promise.all(
    (payload.leads ?? []).map(async (lead) => {
      if (!lead.image_bucket || !lead.image_storage_path) return lead;
      const signed = await getEvidenceImageSignedUrl(lead.image_bucket, lead.image_storage_path);
      return { ...lead, imageUrl: signed };
    })
  );
  return {
    detail: {
      ...payload,
      leads,
      hunt: { ...payload.hunt, imageUrl }
    },
    error: null
  };
}

export async function listMyMostWantedContributions(): Promise<{ items: MostWantedContribution[]; error: string | null }> {
  const { data, error } = await supabase.rpc('list_my_most_wanted_contributions');
  if (error) return { items: [], error: error.message };
  return { items: (data ?? []) as MostWantedContribution[], error: null };
}

export async function listSolvedHunts(): Promise<{ items: SolvedHuntRow[]; error: string | null }> {
  const { data, error } = await supabase.rpc('list_solved_most_wanted_hunts', { p_limit: 50, p_offset: 0 });
  if (error) return { items: [], error: error.message };
  const items = await attachHuntImageUrls((data ?? []) as SolvedHuntRow[]);
  return { items, error: null };
}

export async function listWatchedHunts(): Promise<{ items: MostWantedHuntRow[]; error: string | null }> {
  const { data, error } = await supabase.rpc('list_my_watched_most_wanted_hunts', {
    p_limit: 50,
    p_offset: 0
  });
  if (error) return { items: [], error: error.message };

  const watched = (data ?? []) as Array<{ id: string }>;
  if (watched.length === 0) return { items: [], error: null };

  const idSet = new Set(watched.map((row) => row.id));
  const { items, error: listError } = await listMostWantedHunts({ filter: 'ALL', sort: 'most_wanted' });
  if (listError) return { items: [], error: listError };

  return {
    items: items.filter((row) => idSet.has(row.id)).map((row) => ({ ...row, is_watching: true })),
    error: null
  };
}

export async function listBountyRankings(limit = 10): Promise<{ items: BountyRankingRow[]; error: string | null }> {
  const { data, error } = await supabase.rpc('list_bounty_rankings', { p_limit: limit });
  if (error) return { items: [], error: error.message };

  const items: BountyRankingRow[] = [];
  for (const row of data ?? []) {
    const r = row as BountyRankingRow;
    const { data: voteState } = await supabase.rpc('get_card_request_vote_state', {
      p_card_request_id: r.card_request_id
    });
    const state = voteState as { user_vote?: string | null; vote_score?: number } | null;
    items.push({
      ...r,
      vote_score: state?.vote_score ?? r.vote_score,
      user_vote: (state?.user_vote as BountyRankingRow['user_vote']) ?? null
    });
  }
  return { items, error: null };
}

export async function toggleCardRequestVote(
  cardRequestId: string,
  action: 'upvote' | 'downvote'
): Promise<{ voteScore: number; userVote: 'upvote' | 'downvote' | null; error: string | null }> {
  const { data, error } = await supabase.rpc('toggle_card_request_vote', {
    p_card_request_id: cardRequestId,
    p_action: action
  });
  if (error) return { voteScore: 0, userVote: null, error: error.message };
  const payload = data as { user_vote?: string | null; vote_score?: number };
  return {
    voteScore: payload.vote_score ?? 0,
    userVote: (payload.user_vote as 'upvote' | 'downvote' | null) ?? null,
    error: null
  };
}

export async function toggleMostWantedWatch(huntId: string): Promise<{ watching: boolean; error: string | null }> {
  const { data, error } = await supabase.rpc('toggle_most_wanted_watch', { p_hunt_id: huntId });
  if (error) return { watching: false, error: error.message };
  return { watching: !!data, error: null };
}

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('Could not read the image.');
  return response.blob();
}

export async function pickEvidencePhoto(source: 'library' | 'camera' = 'library'): Promise<string | null> {
  const launcher =
    source === 'camera'
      ? ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.9,
          allowsEditing: false
        })
      : ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.9,
          allowsEditing: false
        });

  const result = await launcher;
  if (result.canceled || !result.assets[0]?.uri) return null;
  return result.assets[0].uri;
}

export type SubmitEvidenceInput = {
  huntId: string;
  evidenceType: MostWantedEvidenceTypeKey;
  sourceUrl?: string;
  notes?: string;
  imageUri?: string | null;
};

export async function submitMostWantedEvidence(
  input: SubmitEvidenceInput
): Promise<{ submissionId: string | null; error: string | null }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { submissionId: null, error: 'Sign in required.' };

  const { data, error } = await supabase
    .from('most_wanted_evidence_submissions')
    .insert({
      hunt_id: input.huntId,
      submitted_by: userData.user.id,
      evidence_type: input.evidenceType,
      source_url: input.sourceUrl?.trim() || null,
      notes: input.notes?.trim() || null,
      status: 'pending_review'
    })
    .select('id')
    .single();

  if (error) return { submissionId: null, error: error.message };

  if (input.imageUri) {
    try {
      const blob = await uriToBlob(input.imageUri);
      // storage RLS (user_content_auth_upload): first folder must be auth.uid()
      const path = `${userData.user.id}/most-wanted/${data.id}.jpg`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });
      if (uploadError) return { submissionId: data.id as string, error: uploadError.message };

      const { error: updateError } = await supabase
        .from('most_wanted_evidence_submissions')
        .update({ image_bucket: BUCKET, image_storage_path: path })
        .eq('id', data.id)
        .eq('submitted_by', userData.user.id);
      if (updateError) return { submissionId: data.id as string, error: updateError.message };
    } catch (e) {
      return {
        submissionId: data.id as string,
        error: e instanceof Error ? e.message : 'Upload failed.'
      };
    }
  }

  return { submissionId: data.id as string, error: null };
}

export type MyEvidenceSubmission = {
  id: string;
  hunt_id: string;
  evidence_type: string;
  source_url: string | null;
  notes: string | null;
  status: string;
  review_notes: string | null;
  image_bucket: string | null;
  image_storage_path: string | null;
};

/** Load one of the signed-in user's own evidence submissions (RLS: users_read_mw_evidence). */
export async function getMyEvidenceSubmission(
  submissionId: string
): Promise<{ submission: MyEvidenceSubmission | null; error: string | null }> {
  const { data, error } = await supabase
    .from('most_wanted_evidence_submissions')
    .select('id, hunt_id, evidence_type, source_url, notes, status, review_notes, image_bucket, image_storage_path')
    .eq('id', submissionId)
    .maybeSingle();

  if (error) return { submission: null, error: error.message };
  if (!data) return { submission: null, error: 'Submission not found.' };
  return { submission: data as MyEvidenceSubmission, error: null };
}

export async function getEvidenceImageSignedUrl(
  bucket: string,
  path: string
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

export type ResubmitEvidenceInput = {
  submissionId: string;
  evidenceType: MostWantedEvidenceTypeKey;
  sourceUrl?: string;
  notes?: string;
  /** New local image to replace the stored one; null/undefined keeps the existing image. */
  imageUri?: string | null;
};

/**
 * Update a returned (needs_more_info / rejected) submission in place and put it
 * back into the review queue, instead of creating a duplicate submission row.
 */
export async function resubmitMostWantedEvidence(
  input: ResubmitEvidenceInput
): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: 'Sign in required.' };

  let imageBucket: string | null = null;
  let imagePath: string | null = null;

  if (input.imageUri) {
    try {
      const blob = await uriToBlob(input.imageUri);
      const path = `${userData.user.id}/most-wanted/${input.submissionId}.jpg`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });
      if (uploadError) return { error: uploadError.message };
      imageBucket = BUCKET;
      imagePath = path;
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Upload failed.' };
    }
  }

  const { error } = await supabase.rpc('resubmit_most_wanted_evidence', {
    p_submission_id: input.submissionId,
    p_evidence_type: input.evidenceType,
    p_source_url: input.sourceUrl?.trim() || null,
    p_notes: input.notes?.trim() || null,
    p_image_bucket: imageBucket,
    p_image_storage_path: imagePath
  });
  return { error: error?.message ?? null };
}
