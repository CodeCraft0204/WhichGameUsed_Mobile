/** Copy for the How Points Work guide screen. */
export const pointsWorkCopy = {
  title: 'HOW POINTS WORK',
  subtitle: 'Earn recognition for authentication work, research, and community help.',
  description:
    'Points count toward the monthly Top 20 board and your all-time standing. Rules below reflect the live scoring configuration.',

  summaryTitle: 'AT A GLANCE',
  rankingTitle: 'HOW RANKINGS WORK',
  actionsTitle: 'START EARNING',
  prizeTitle: "THIS MONTH'S PRIZE",
  penaltiesTitle: 'PENALTIES & ADJUSTMENTS',

  seeFullGuide: 'See full guide',
  loading: 'Loading point rules…',
  error: 'Could not load the latest point rules.',
  retry: 'Try again',
  fallbackNote: 'Showing default rules — pull to refresh when back online.',

  rankingSteps: [
    'Earn points automatically when you complete qualifying actions in the app.',
    'The monthly board resets each calendar month. Top 20 collectors appear on the leaderboard.',
    'All-time standing tracks your lifetime total and never resets.',
    'Opt in under Settings to appear on the public leaderboard.'
  ] as const,

  eligibilityNote:
    'Only eligible, non-banned accounts appear on public rankings.',

  summary: {
    auth: {
      label: 'Authentication',
      hint: 'Highest impact — verified cards and accepted evidence.'
    },
    research: {
      label: 'Research',
      hint: 'Ratings and published guides build steady points.'
    },
    forum: {
      label: 'Discussion',
      hint: 'Threads, comments, and upvotes — some actions have daily caps.'
    }
  } as const,

  actions: [
    { key: 'authenticate', label: 'Authenticate a card', href: '/authenticate/authenticate' as const },
    { key: 'research', label: 'Research a card', href: '/database/database' as const },
    { key: 'discussion', label: 'Start a discussion', href: '/discussion/discussion' as const }
  ] as const,

  /** Mobile-friendly descriptions keyed by event_type (fallback when DB description is admin-oriented). */
  ruleDescriptions: {
    auth_evidence_accepted: 'Your authentication evidence is approved and added to the catalog.',
    auth_submission_verified: 'Your card submission is first marked verified.',
    research_rating_received: 'You submit a helpful research rating on a catalog card.',
    guide_published: 'An education guide you authored is published.',
    thread_created: 'You publish a new forum thread.',
    comment_posted: 'You post a comment or reply on a thread.',
    upvote_received: 'Another collector upvotes your thread or comment.',
    downvote_received: 'Another collector downvotes your thread or comment.',
    content_removed: 'Moderators remove your thread or comment.',
    admin_adjustment: 'Portal admins manually award or adjust points with a recorded reason.'
  } as const,

  adminAdjustmentNote:
    'Manual corrections are applied by moderators and always include a reason in your activity history.'
} as const;
