export type AdvocacyInitiativeType =
  | 'collector_alert'
  | 'transparency_initiative'
  | 'standards_proposal'
  | 'record_correction';

export type AdvocacyInitiativeStatus =
  | 'evidence_gathering'
  | 'active'
  | 'awaiting_response'
  | 'resolved'
  | 'closed';

export type AdvocacyListFilter =
  | 'all'
  | 'alerts'
  | 'transparency'
  | 'standards'
  | 'corrections'
  | 'resolved';

export type AdvocacySportFilter =
  | 'all'
  | 'baseball'
  | 'basketball'
  | 'football'
  | 'hockey'
  | 'multi';

export type AdvocacyHubSummary = {
  active_count: number;
  gathering_evidence_count: number;
  resolved_count: number;
};

export type AdvocacyInitiativeListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  initiative_type: AdvocacyInitiativeType;
  status: AdvocacyInitiativeStatus | string;
  sport: string | null;
  organization_name: string | null;
  goal_count: number | null;
  supporter_count: number;
  follower_count: number;
  confirmed_evidence_count: number;
  update_count: number;
  progress: number | null;
  cover_image_url: string | null;
  promoted_rank: number | null;
  published_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  updated_at: string;
};

export type AdvocacyEvidenceItem = {
  id: string;
  evidence_kind: string;
  title: string;
  body: string | null;
  url: string | null;
  status: string;
  created_at: string;
};

export type AdvocacyUpdateItem = {
  id: string;
  title: string;
  body: string | null;
  is_important: boolean;
  published_at: string | null;
};

export type AdvocacyTimelineItem = {
  id: string;
  event_kind: string;
  label: string;
  occurred_at: string;
};

export type AdvocacyRelationType =
  | 'catalog_card'
  | 'authenticated_asset'
  | 'most_wanted_hunt'
  | 'memorabilia_piece'
  | 'product'
  | 'education_publication'
  | 'discussion_thread'
  | 'external_source';

export type AdvocacyRelationRole =
  | 'primary_subject'
  | 'affected_item'
  | 'supporting_evidence'
  | 'related_research'
  | 'discussion';

export type AdvocacyRelationItem = {
  id: string;
  relation_type: AdvocacyRelationType;
  relation_id: string;
  relation_role: AdvocacyRelationRole;
  display_order: number;
  label_override?: string | null;
  title: string;
  subtitle?: string | null;
  href_hint?: string | null;
};

export type AdvocacyInitiativeDetail = AdvocacyInitiativeListItem & {
  what_is_happening: string | null;
  why_it_matters: string | null;
  change_requested: string | null;
  team_name: string | null;
  related_records_count?: number;
  outcome_type: string | null;
  outcome_summary: string | null;
  outcome_effective_on: string | null;
  outcome_source_url: string | null;
  lessons_learned: string | null;
  unresolved_questions: string | null;
  viewer_has_supported: boolean;
  viewer_is_following: boolean;
  support_allowed: boolean;
  evidence: AdvocacyEvidenceItem[];
  updates: AdvocacyUpdateItem[];
  timeline: AdvocacyTimelineItem[];
  sources: Array<{ id: string; title: string; url: string | null }>;
  relations: AdvocacyRelationItem[];
};
