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
      { text: 'Tap any card in the database to open its evidence file.' },
      { text: 'Search by sport, team, player, card, and even memorabilia type.' },
      { text: 'Review and rate the evidence file for any card.' },
      { text: 'Track cards that are trending and follow the freshest new evidence.' },
      {
        text: 'Save cards to your Watch List and receive notifications whenever new evidence comes across the desk.',
        route: '/database/wishlist'
      }
    ]
  },
  authenticate: {
    key: 'authenticate',
    icon: figmaIcons.metaShield,
    messages: [
      { text: 'If your card is in our database, you can submit for free QR-linked stickers.' },
      { text: 'Simply upload front and back photos of your card and submit.', route: '/camera/camera' },
      { text: 'Track your submissions through the app.' },
      {
        text: 'Place the sticker on your card holder so anyone can see the evidence.'
      },
      {
        text: 'Every tamper-evident QR-linked sticker is registered in our database. Verify any sticker by comparing the registration number to submission photos.',
        route: '/database/verify'
      }
    ]
  },
  create: {
    key: 'create',
    icon: figmaIcons.navCreate,
    messages: [
      { text: 'Create evidence boards with photos, screenshots, shapes, and text.' },
      {
        text: 'Crop, annotate, and frame photos. Keep photo editing apps on the bench.',
        route: '/create/templates'
      },
      { text: 'Submit your evidence to be linked to any card in our database.' },
      {
        text: 'Start a discussion and get the Squad’s feedback on your findings.',
        route: '/discussion/discussion'
      },
      {
        text: 'Climb to the top of our monthly user leaderboard to win wax, cards, and more.',
        route: '/leaderboard/leaderboard'
      }
    ]
  },
  discussion: {
    key: 'discussion',
    icon: figmaIcons.replyBubble,
    messages: [
      { text: 'Follow the newest evidence shared on the platform.' },
      { text: 'Ask for authenticity opinions on any game-used card.' },
      { text: 'Share your latest pickups with your fellow Squad members.' },
      { text: 'Save threads to revisit evidence and debates later.', route: '/discussion/saved' },
      { text: 'Browse topics and threads ranked by recent activity or votes.' }
    ]
  },
  advocacy: {
    key: 'advocacy',
    icon: figmaIcons.megaphone,
    messages: [
      { text: 'Ask manufacturers to share their memorabilia photos and game-date information.' },
      { text: 'Demand transparency from the hobby’s unelected leaders.' },
      { text: 'Create and share petitions on and off the platform.' },
      { text: 'Stick with the story, follow a petition to see our words in effect.' },
      {
        text: 'Share your stories with the Squad in Discussion.',
        route: '/discussion/discussion'
      }
    ]
  },
  education: {
    key: 'education',
    icon: figmaIcons.guidesBook,
    messages: [
      { text: 'Learn to build a case for any game-used memorabilia.' },
      {
        text: 'Study the art of authentication through photo matching, provenance, and source analysis.'
      },
      { text: 'Download PDF guides for offline reference.' },
      { text: 'See what makes a card look suspect using real examples.' },
      { text: 'Keep up to date with the latest and greatest content from Which Game Used.' }
    ]
  },
  mostwanted: {
    key: 'mostwanted',
    icon: figmaIcons.wantedPoster,
    messages: [
      { text: 'Vote on and view memorabilia mysteries.' },
      {
        text: 'Contribute to the conversation, submit evidence, and help build case files.',
        route: '/mostwanted/contributions'
      },
      { text: 'Solve cases to capture bounties worth up to $100.' },
      { text: 'One big case is all it takes to change the hobby forever.' },
      {
        text: 'This platform started with a card, a question, and a search for answers — read the Babe Ruth story in Education.',
        route: '/education/education'
      }
    ]
  },
  leaderboard: {
    key: 'leaderboard',
    icon: figmaIcons.trophyRanking,
    messages: [
      { text: 'Participate on the platform and climb the ranks.' },
      {
        text: 'Each month, first place is awarded sealed wax, cards, and hobby paraphernalia worth $100.'
      },
      { text: 'The quickest way to win is to contribute to the evidence files.' },
      { text: 'Security measures ensure participants cannot spam their way to a win.' },
      { text: 'Wear your winner’s badge around the precinct with select profile icons.' }
    ]
  }
};

export function getContextHeaderConfig(key: ContextHeaderPageKey): ContextHeaderConfig {
  return contextHeaderByPage[key];
}
