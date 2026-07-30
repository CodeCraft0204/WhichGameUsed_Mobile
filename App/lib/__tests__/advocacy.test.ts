import { describe, expect, it } from 'vitest';
import {
  advocacyPrimaryCta,
  advocacyStatusLabel,
  advocacyTypeLabel,
  assignPrimarySubjectRole,
  clampAdvocacyProgress,
  formatAdvocacyCount,
  groupAdvocacyRelationsByRole,
  hasUniquePrimarySubject,
  isPublicAdvocacyRelationPayload,
  mapTabLabelToFilter,
  primaryActionIsFollow
} from '../advocacy-format';
import type { AdvocacyRelationItem } from '../advocacy-types';

describe('advocacyPrimaryCta', () => {
  it('maps initiative types to primary CTA copy', () => {
    expect(advocacyPrimaryCta('collector_alert')).toBe('FOLLOW ALERT');
    expect(advocacyPrimaryCta('transparency_initiative')).toBe('SUPPORT INITIATIVE');
    expect(advocacyPrimaryCta('standards_proposal')).toBe('ENDORSE STANDARD');
    expect(advocacyPrimaryCta('record_correction')).toBe('REVIEW EVIDENCE');
  });
});

describe('advocacy labels', () => {
  it('formats type and status', () => {
    expect(advocacyTypeLabel('collector_alert')).toBe('ALERT');
    expect(advocacyStatusLabel('evidence_gathering')).toBe('GATHERING EVIDENCE');
  });
});

describe('clampAdvocacyProgress', () => {
  it('clamps to 0..1', () => {
    expect(clampAdvocacyProgress(null)).toBe(0);
    expect(clampAdvocacyProgress(1.4)).toBe(1);
  });
});

describe('mapTabLabelToFilter', () => {
  it('maps hub chips', () => {
    expect(mapTabLabelToFilter('ALERTS')).toBe('alerts');
    expect(mapTabLabelToFilter('RESOLVED')).toBe('resolved');
    expect(mapTabLabelToFilter('ALL')).toBe('all');
  });
});

describe('primaryActionIsFollow', () => {
  it('is true only for collector alerts', () => {
    expect(primaryActionIsFollow('collector_alert')).toBe(true);
    expect(primaryActionIsFollow('transparency_initiative')).toBe(false);
  });
});

describe('formatAdvocacyCount', () => {
  it('formats with grouping', () => {
    expect(formatAdvocacyCount(742)).toBe('742');
  });
});

function rel(
  id: string,
  role: AdvocacyRelationItem['relation_role'],
  order = 0
): AdvocacyRelationItem {
  return {
    id,
    relation_type: 'catalog_card',
    relation_id: id,
    relation_role: role,
    display_order: order,
    title: `Card ${id}`,
    href_hint: 'catalog_card'
  };
}

describe('advocacy relations helpers', () => {
  it('enforces at most one primary_subject', () => {
    expect(hasUniquePrimarySubject([rel('a', 'primary_subject')])).toBe(true);
    expect(
      hasUniquePrimarySubject([rel('a', 'primary_subject'), rel('b', 'primary_subject')])
    ).toBe(false);
  });

  it('assignPrimarySubjectRole demotes the previous primary', () => {
    const next = assignPrimarySubjectRole(
      [rel('a', 'primary_subject'), rel('b', 'affected_item')],
      'b'
    );
    expect(hasUniquePrimarySubject(next)).toBe(true);
    expect(next.find((r) => r.id === 'b')?.relation_role).toBe('primary_subject');
    expect(next.find((r) => r.id === 'a')?.relation_role).toBe('affected_item');
  });

  it('groups relations by role for detail UI', () => {
    const grouped = groupAdvocacyRelationsByRole([
      rel('h', 'related_research'),
      rel('a', 'primary_subject'),
      rel('c', 'affected_item', 1),
      rel('b', 'affected_item', 0)
    ]);
    expect(grouped.primary_subject).toHaveLength(1);
    expect(grouped.affected_item.map((r) => r.id)).toEqual(['b', 'c']);
    expect(grouped.related_research).toHaveLength(1);
  });

  it('public relation payload rejects PII keys', () => {
    expect(
      isPublicAdvocacyRelationPayload({
        id: '1',
        title: 'Card',
        relation_role: 'primary_subject'
      })
    ).toBe(true);
    expect(
      isPublicAdvocacyRelationPayload({
        id: '1',
        title: 'Card',
        email: 'x@y.com'
      })
    ).toBe(false);
  });
});
