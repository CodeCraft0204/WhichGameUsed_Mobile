export type CollectionStatus = 'collected' | 'partial' | 'missing';

/** Honest list/detail metrics — never invent views/likes. */
export function huntEngagementMetrics(row: {
  watcher_count?: number | null;
  contributor_count?: number | null;
  evidence_submission_count?: number | null;
  comment_count?: number | null;
}): {
  watching: number;
  middleLabel: 'Contributors' | 'Evidence';
  middleValue: number;
  comments: number;
} {
  const watching = row.watcher_count ?? 0;
  const contributors = row.contributor_count;
  const evidence = row.evidence_submission_count ?? 0;
  const useContributors = typeof contributors === 'number' && contributors > 0;
  return {
    watching,
    middleLabel: useContributors ? 'Contributors' : 'Evidence',
    middleValue: useContributors ? contributors : evidence,
    comments: row.comment_count ?? 0
  };
}

export function requirementCollectionStatus(req: {
  is_fulfilled: boolean;
  collection_status?: CollectionStatus;
}): CollectionStatus {
  if (req.collection_status) return req.collection_status;
  return req.is_fulfilled ? 'collected' : 'missing';
}
