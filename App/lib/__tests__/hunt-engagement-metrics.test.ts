import { describe, expect, it } from 'vitest';
import { huntEngagementMetrics, requirementCollectionStatus } from '../most-wanted-metrics';

describe('huntEngagementMetrics', () => {
  it('uses contributors when count is available and > 0', () => {
    expect(
      huntEngagementMetrics({
        watcher_count: 12,
        contributor_count: 4,
        evidence_submission_count: 9,
        comment_count: 3
      })
    ).toEqual({
      watching: 12,
      middleLabel: 'Contributors',
      middleValue: 4,
      comments: 3
    });
  });

  it('falls back to evidence submissions when contributors unavailable', () => {
    expect(
      huntEngagementMetrics({
        watcher_count: 2,
        contributor_count: 0,
        evidence_submission_count: 7,
        comment_count: 1
      })
    ).toEqual({
      watching: 2,
      middleLabel: 'Evidence',
      middleValue: 7,
      comments: 1
    });
  });

  it('never invents views or likes', () => {
    const m = huntEngagementMetrics({});
    expect(m).not.toHaveProperty('views');
    expect(m).not.toHaveProperty('likes');
    expect(m.watching).toBe(0);
  });
});

describe('requirementCollectionStatus', () => {
  it('prefers RPC collection_status over is_fulfilled alone', () => {
    expect(
      requirementCollectionStatus({
        id: '1',
        requirement_key: 'front_image',
        label: 'Front',
        sort_order: 0,
        is_fulfilled: false,
        collection_status: 'partial'
      })
    ).toBe('partial');
  });

  it('falls back to collected/missing from is_fulfilled', () => {
    expect(
      requirementCollectionStatus({
        id: '1',
        requirement_key: 'front_image',
        label: 'Front',
        sort_order: 0,
        is_fulfilled: true
      })
    ).toBe('collected');
  });
});
