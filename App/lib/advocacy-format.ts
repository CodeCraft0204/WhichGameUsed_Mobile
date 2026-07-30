import type {
  AdvocacyInitiativeType,
  AdvocacyListFilter,
  AdvocacyRelationItem,
  AdvocacyRelationRole,
  AdvocacyRelationType,
  AdvocacySportFilter
} from '@/lib/advocacy-types';

export const ADVOCACY_RELATION_ROLE_ORDER: AdvocacyRelationRole[] = [
  'primary_subject',
  'affected_item',
  'supporting_evidence',
  'related_research',
  'discussion'
];

export function advocacyPrimaryCta(type: AdvocacyInitiativeType): string {
  if (type === 'collector_alert') return 'FOLLOW ALERT';
  if (type === 'transparency_initiative') return 'SUPPORT INITIATIVE';
  if (type === 'standards_proposal') return 'ENDORSE STANDARD';
  return 'REVIEW EVIDENCE';
}

export function advocacyTypeLabel(type: AdvocacyInitiativeType): string {
  if (type === 'collector_alert') return 'ALERT';
  if (type === 'transparency_initiative') return 'TRANSPARENCY';
  if (type === 'standards_proposal') return 'STANDARDS';
  return 'CORRECTION';
}

export function advocacyStatusLabel(status: string): string {
  if (status === 'evidence_gathering') return 'GATHERING EVIDENCE';
  if (status === 'active') return 'ACTIVE';
  if (status === 'awaiting_response') return 'AWAITING RESPONSE';
  if (status === 'resolved') return 'RESOLVED';
  if (status === 'closed') return 'CLOSED';
  return status.toUpperCase();
}

export function clampAdvocacyProgress(progress: number | null | undefined): number {
  if (progress == null || Number.isNaN(progress)) return 0;
  return Math.max(0, Math.min(1, progress));
}

export function formatAdvocacyCount(count: number): string {
  return new Intl.NumberFormat('en-US').format(count);
}

export function mapTabLabelToFilter(label: string): AdvocacyListFilter {
  const upper = label.trim().toUpperCase();
  if (upper === 'ALERTS') return 'alerts';
  if (upper === 'TRANSPARENCY') return 'transparency';
  if (upper === 'STANDARDS') return 'standards';
  if (upper === 'CORRECTIONS') return 'corrections';
  if (upper === 'RESOLVED') return 'resolved';
  return 'all';
}

export function mapSportLabelToFilter(label: string): AdvocacySportFilter {
  const upper = label.trim().toUpperCase();
  if (upper === 'BASEBALL') return 'baseball';
  if (upper === 'BASKETBALL') return 'basketball';
  if (upper === 'FOOTBALL') return 'football';
  if (upper === 'HOCKEY') return 'hockey';
  if (upper === 'MULTI-SPORT' || upper === 'MULTI') return 'multi';
  return 'all';
}

export function primaryActionIsFollow(type: AdvocacyInitiativeType): boolean {
  return type === 'collector_alert';
}

export function primaryActionIsReviewEvidence(type: AdvocacyInitiativeType): boolean {
  return type === 'record_correction';
}

export function advocacyRelationRoleLabel(role: AdvocacyRelationRole): string {
  if (role === 'primary_subject') return 'Primary subject';
  if (role === 'affected_item') return 'Affected items';
  if (role === 'supporting_evidence') return 'Supporting evidence';
  if (role === 'related_research') return 'Related research';
  return 'Discussion';
}

export function advocacyRelationTypeLabel(type: AdvocacyRelationType): string {
  if (type === 'catalog_card') return 'Card';
  if (type === 'authenticated_asset') return 'Asset';
  if (type === 'most_wanted_hunt') return 'Most Wanted';
  if (type === 'memorabilia_piece') return 'Memorabilia';
  if (type === 'product') return 'Product';
  if (type === 'education_publication') return 'Education';
  if (type === 'discussion_thread') return 'Discussion';
  return 'Source';
}

/** Public payload titles only — never include emails/PII fields. */
export function isPublicAdvocacyRelationPayload(
  row: Partial<AdvocacyRelationItem> & Record<string, unknown>
): boolean {
  const forbidden = ['email', 'submitted_by', 'created_by', 'user_id', 'phone'];
  return !forbidden.some((key) => key in row);
}

export function countPrimarySubjects(
  relations: Array<{ relation_role: string }>
): number {
  return relations.filter((r) => r.relation_role === 'primary_subject').length;
}

export function hasUniquePrimarySubject(
  relations: Array<{ relation_role: string }>
): boolean {
  return countPrimarySubjects(relations) <= 1;
}

/** Mirrors admin_set_advocacy_relation: at most one primary_subject per initiative. */
export function assignPrimarySubjectRole<
  T extends { id: string; relation_role: AdvocacyRelationRole }
>(relations: T[], relationId: string): T[] {
  return relations.map((r) => {
    if (r.id === relationId) return { ...r, relation_role: 'primary_subject' as const };
    if (r.relation_role === 'primary_subject') {
      return { ...r, relation_role: 'affected_item' as const };
    }
    return r;
  });
}

export function groupAdvocacyRelationsByRole(
  relations: AdvocacyRelationItem[]
): Record<AdvocacyRelationRole, AdvocacyRelationItem[]> {
  const grouped: Record<AdvocacyRelationRole, AdvocacyRelationItem[]> = {
    primary_subject: [],
    affected_item: [],
    supporting_evidence: [],
    related_research: [],
    discussion: []
  };
  for (const role of ADVOCACY_RELATION_ROLE_ORDER) {
    grouped[role] = relations
      .filter((r) => r.relation_role === role)
      .sort((a, b) => a.display_order - b.display_order || a.title.localeCompare(b.title));
  }
  return grouped;
}
