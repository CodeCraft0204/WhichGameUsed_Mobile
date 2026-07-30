/** Copy for the How Points Work guide screen. */
export const pointsWorkCopy = {
  title: 'HOW POINTS WORK',
  subtitle: 'Earn recognition for authentication work, research, and community help.',
  description:
    'Monthly points feed the Top 20 prize board. Detective XP, Donuts, evidence stars, and card badges are separate systems — they do not inflate monthly rankings.',

  summaryTitle: 'AT A GLANCE',
  rankingTitle: 'HOW RANKINGS WORK',
  systemsTitle: 'RELATED SYSTEMS',
  actionsTitle: 'START EARNING',
  prizeTitle: "THIS MONTH'S PRIZE",
  penaltiesTitle: 'PENALTIES & ADJUSTMENTS',

  seeFullGuide: 'SEE FULL GUIDE',
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

  systemsSteps: [
    'Monthly Points — prize leaderboard; resets each month.',
    'Detective XP — lifetime reputation that unlocks ranks (never decreases except fraud reversal).',
    'Donuts — transferable appreciation you earn and gift; separate from prize XP.',
    'Evidence Stars — quality rating on evidence items (admin confirms Strong and above).',
    'Card Badges — Photo Matched, Catalogued, Published, Trending, Top Rated on the evidence file.'
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
    { key: 'authenticate', label: 'Submit a card', href: '/authenticate/authenticate' as const },
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
