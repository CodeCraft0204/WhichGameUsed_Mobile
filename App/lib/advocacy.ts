import { supabase } from '@/lib/supabase';
import type {
  AdvocacyHubSummary,
  AdvocacyInitiativeDetail,
  AdvocacyInitiativeListItem,
  AdvocacyListFilter,
  AdvocacySportFilter
} from '@/lib/advocacy-types';

export type {
  AdvocacyHubSummary,
  AdvocacyInitiativeDetail,
  AdvocacyInitiativeListItem,
  AdvocacyInitiativeStatus,
  AdvocacyInitiativeType,
  AdvocacyListFilter,
  AdvocacySportFilter
} from '@/lib/advocacy-types';

export {
  advocacyPrimaryCta,
  advocacyRelationRoleLabel,
  advocacyRelationTypeLabel,
  advocacyStatusLabel,
  advocacyTypeLabel,
  assignPrimarySubjectRole,
  clampAdvocacyProgress,
  formatAdvocacyCount,
  groupAdvocacyRelationsByRole,
  hasUniquePrimarySubject,
  mapSportLabelToFilter,
  mapTabLabelToFilter,
  primaryActionIsFollow,
  primaryActionIsReviewEvidence
} from '@/lib/advocacy-format';

export type {
  AdvocacyRelationItem,
  AdvocacyRelationRole,
  AdvocacyRelationType
} from '@/lib/advocacy-types';

export const ADVOCACY_LIST_FILTERS: { key: AdvocacyListFilter; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'alerts', label: 'ALERTS' },
  { key: 'transparency', label: 'TRANSPARENCY' },
  { key: 'standards', label: 'STANDARDS' },
  { key: 'corrections', label: 'CORRECTIONS' },
  { key: 'resolved', label: 'RESOLVED' }
];

export const ADVOCACY_SPORT_FILTERS: { key: AdvocacySportFilter; label: string }[] = [
  { key: 'all', label: 'ALL SPORTS' },
  { key: 'baseball', label: 'BASEBALL' },
  { key: 'basketball', label: 'BASKETBALL' },
  { key: 'football', label: 'FOOTBALL' },
  { key: 'hockey', label: 'HOCKEY' },
  { key: 'multi', label: 'MULTI-SPORT' }
];

export async function getAdvocacyHubSummary(): Promise<{
  summary: AdvocacyHubSummary | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('get_advocacy_hub_summary');
  if (error) return { summary: null, error: error.message };
  return { summary: (data as AdvocacyHubSummary | null) ?? null, error: null };
}

export async function listAdvocacyInitiatives(
  filter: AdvocacyListFilter = 'all',
  sport: AdvocacySportFilter = 'all'
): Promise<{ items: AdvocacyInitiativeListItem[]; error: string | null }> {
  const { data, error } = await supabase.rpc('list_advocacy_initiatives', {
    p_filter: filter,
    p_sport: sport === 'all' ? null : sport
  });
  if (error) return { items: [], error: error.message };
  return { items: (data ?? []) as AdvocacyInitiativeListItem[], error: null };
}

export async function getAdvocacyInitiative(
  idOrSlug: string
): Promise<{ initiative: AdvocacyInitiativeDetail | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_advocacy_initiative', {
    p_id_or_slug: idOrSlug
  });
  if (error) return { initiative: null, error: error.message };
  if (!data) return { initiative: null, error: null };
  const raw = data as AdvocacyInitiativeDetail;
  return {
    initiative: {
      ...raw,
      evidence: raw.evidence ?? [],
      updates: raw.updates ?? [],
      timeline: raw.timeline ?? [],
      sources: raw.sources ?? [],
      relations: Array.isArray(raw.relations) ? raw.relations : [],
      viewer_has_supported: Boolean(raw.viewer_has_supported),
      viewer_is_following: Boolean(raw.viewer_is_following),
      support_allowed: Boolean(raw.support_allowed)
    },
    error: null
  };
}

export async function supportAdvocacyInitiative(initiativeId: string) {
  const { data, error } = await supabase.rpc('support_advocacy_initiative', {
    p_initiative_id: initiativeId
  });
  if (error) return { result: null, error: error.message };
  return { result: data as Record<string, unknown>, error: null };
}

export async function withdrawAdvocacySupport(initiativeId: string) {
  const { data, error } = await supabase.rpc('withdraw_advocacy_support', {
    p_initiative_id: initiativeId
  });
  if (error) return { result: null, error: error.message };
  return { result: data as Record<string, unknown>, error: null };
}

export async function followAdvocacyInitiative(initiativeId: string) {
  const { data, error } = await supabase.rpc('follow_advocacy_initiative', {
    p_initiative_id: initiativeId
  });
  if (error) return { result: null, error: error.message };
  return { result: data as Record<string, unknown>, error: null };
}

export async function unfollowAdvocacyInitiative(initiativeId: string) {
  const { data, error } = await supabase.rpc('unfollow_advocacy_initiative', {
    p_initiative_id: initiativeId
  });
  if (error) return { result: null, error: error.message };
  return { result: data as Record<string, unknown>, error: null };
}

export async function submitAdvocacyIssue(payload: Record<string, unknown>) {
  const { data, error } = await supabase.rpc('submit_advocacy_issue', { p_payload: payload });
  if (error) return { id: null, error: error.message };
  return { id: (data as { id?: string } | null)?.id ?? null, error: null };
}

export async function submitAdvocacyEvidence(payload: Record<string, unknown>) {
  const { data, error } = await supabase.rpc('submit_advocacy_evidence', { p_payload: payload });
  if (error) return { id: null, error: error.message };
  return { id: (data as { id?: string } | null)?.id ?? null, error: null };
}

const ADVOCACY_MEDIA_BUCKET = 'advocacy-campaign-media';

/** Upload evidence photo to storage path evidence/{uid}/{uuid}.jpg */
export async function uploadAdvocacyEvidencePhoto(localUri: string): Promise<{
  storagePath: string | null;
  error: string | null;
}> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { storagePath: null, error: userError?.message ?? 'Sign in required.' };
  }
  try {
    const res = await fetch(localUri);
    const blob = await res.blob();
    const path = `evidence/${userData.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(ADVOCACY_MEDIA_BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (uploadError) return { storagePath: null, error: uploadError.message };
    return { storagePath: path, error: null };
  } catch (e) {
    return {
      storagePath: null,
      error: e instanceof Error ? e.message : 'Upload failed.'
    };
  }
}

export async function listMyAdvocacy() {
  const { data, error } = await supabase.rpc('list_my_advocacy');
  if (error) return { supported: [], following: [], error: error.message };
  const raw = (data ?? {}) as {
    supported?: AdvocacyInitiativeListItem[];
    following?: AdvocacyInitiativeListItem[];
  };
  return {
    supported: raw.supported ?? [],
    following: raw.following ?? [],
    error: null
  };
}
