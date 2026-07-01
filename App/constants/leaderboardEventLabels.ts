/** Human-readable labels for leaderboard_events.event_type */
export const LEADERBOARD_EVENT_LABELS: Record<string, string> = {
  auth_evidence_accepted: 'Authentication accepted',
  auth_submission_verified: 'Submission verified',
  research_rating_received: 'Research contribution',
  guide_published: 'Guide published',
  thread_created: 'Forum thread created',
  comment_posted: 'Forum comment posted',
  upvote_received: 'Upvote received',
  downvote_received: 'Downvote received',
  content_removed: 'Content removed',
  admin_adjustment: 'Admin adjustment'
};

export function leaderboardEventLabel(eventType: string): string {
  return LEADERBOARD_EVENT_LABELS[eventType] ?? eventType.replace(/_/g, ' ');
}

/** Group event types for profile breakdown chart */
export const LEADERBOARD_EVENT_GROUPS = [
  {
    key: 'auth',
    label: 'Authentication',
    icon: 'shield' as const,
    types: ['auth_evidence_accepted', 'auth_submission_verified']
  },
  {
    key: 'research',
    label: 'Research',
    icon: 'book' as const,
    types: ['research_rating_received', 'guide_published']
  },
  {
    key: 'forum',
    label: 'Discussion',
    icon: 'chat' as const,
    types: ['thread_created', 'comment_posted', 'upvote_received', 'downvote_received']
  },
  {
    key: 'other',
    label: 'Other',
    icon: 'star' as const,
    types: ['content_removed', 'admin_adjustment']
  }
] as const;
