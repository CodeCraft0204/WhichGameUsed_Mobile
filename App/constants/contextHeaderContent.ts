import { figmaIcons } from '@/constants/figmaIcons';

export type ContextHeaderPageKey =
  | 'database'
  | 'authenticate'
  | 'create'
  | 'discussion'
  | 'advocacy'
  | 'education'
  | 'mostwanted'
  | 'leaderboard';

export type ContextHeaderMessage = {
  text: string;
  /** Optional in-app route — shows a CTA arrow when set. */
  route?: string;
};

export type ContextHeaderConfig = {
  key: ContextHeaderPageKey;
  icon: number;
  messages: ContextHeaderMessage[];
  dismissible?: boolean;
};

/** Scroll distance (px) over which the guidance strip fully collapses. */
export const CONTEXT_HEADER_COLLAPSE_DISTANCE = 110;

export const contextHeaderByPage: Record<ContextHeaderPageKey, ContextHeaderConfig> = {
  database: {
    key: 'database',
    icon: figmaIcons.collectionChest,
    messages: [
      { text: 'Search the catalog by player, team, or year to find authenticated cards.' },
      { text: 'Use sport filters to narrow results and open a card for provenance details.' },
      { text: 'Trending and recently added sections highlight what collectors are viewing now.' },
      { text: 'Save cards to your wishlist to track players or sets you are researching.', route: '/database/wishlist' },
      { text: 'Tap a card to see patch photos, authentication history, and research notes.' }
    ]
  },
  authenticate: {
    key: 'authenticate',
    icon: figmaIcons.metaShield,
    messages: [
      { text: 'Scan or upload a card photo to start a free authentication submission.', route: '/camera/camera' },
      { text: 'Track pending, in-progress, and reviewed submissions from this hub.' },
      { text: 'Approved cards receive a tamper-proof QR-linked label by mail.' },
      { text: 'Check notifications for updates when your submission moves forward.', route: '/database/notifications' },
      { text: 'Use the tabs to filter submissions by status at a glance.' }
    ]
  },
  create: {
    key: 'create',
    icon: figmaIcons.navCreate,
    messages: [
      { text: 'Capture a card with your camera or choose one from your library.', route: '/camera/camera' },
      { text: 'Use templates to frame photos before submitting to the community.', route: '/create/templates' },
      { text: 'Sign in to save drafts and publish content submissions.' },
      { text: 'Good lighting and a steady hand help the community review your card.' },
      { text: 'After capture, you can crop and annotate before sharing.' }
    ]
  },
  discussion: {
    key: 'discussion',
    icon: figmaIcons.replyBubble,
    messages: [
      { text: 'Browse topics and threads ranked by recent activity or votes.' },
      { text: 'Search threads to find research conversations across the hobby.' },
      { text: 'Tap NEW to start a thread when you are signed in.', route: '/discussion/create' },
      { text: 'Save threads to revisit evidence and debates later.', route: '/discussion/saved' },
      { text: 'Topics group conversations by theme so you can dive into what matters.' }
    ]
  },
  advocacy: {
    key: 'advocacy',
    icon: figmaIcons.megaphone,
    messages: [
      { text: 'Sign petitions asking manufacturers for greater memorabilia transparency.' },
      { text: 'Filter active campaigns and track signature progress toward each goal.' },
      { text: 'Your voice helps push the hobby toward better evidence and trust.' },
      { text: 'Share petitions with other collectors to reach signature goals faster.' },
      { text: 'Wins tab shows campaigns that achieved their transparency milestones.' }
    ]
  },
  education: {
    key: 'education',
    icon: figmaIcons.guidesBook,
    messages: [
      { text: 'Featured guides walk through spotting fakes and studying game-used evidence.' },
      { text: 'Videos break down patch types, provenance clues, and research methods.' },
      { text: 'Use the tabs to switch between guides, videos, and learning paths.' },
      { text: 'Download PDF guides to reference while examining cards offline.' },
      { text: 'Strong research habits protect you from overpaying for unverified memorabilia.' }
    ]
  },
  mostwanted: {
    key: 'mostwanted',
    icon: figmaIcons.wantedPoster,
    messages: [
      { text: 'Browse active hunts and contribute missing game-used evidence.', route: '/mostwanted/mostwanted' },
      { text: 'Filter by sport, reward level, or hunts that are near solved.' },
      { text: 'Submit photos, source links, and research notes for admin review.', route: '/mostwanted/contributions' },
      { text: 'Track your submissions under My Contributions.', route: '/mostwanted/contributions' },
      { text: 'Solved hunts show community research wins and claimed rewards.', route: '/mostwanted/solved' }
    ]
  },
  leaderboard: {
    key: 'leaderboard',
    icon: figmaIcons.trophyRanking,
    messages: [
      { text: 'Rankings reflect authentication work, helpful posts, and research contributions.' },
      { text: 'Switch period tabs to compare monthly, yearly, or all-time standings.' },
      { text: 'Top contributors earn recognition across the collector community.' },
      { text: 'Participate in discussion and submissions to climb the leaderboard.' },
      { text: 'Monthly leaders can earn sealed product, cards, and cash rewards.' }
    ]
  }
};

export function getContextHeaderConfig(key: ContextHeaderPageKey): ContextHeaderConfig {
  return contextHeaderByPage[key];
}
