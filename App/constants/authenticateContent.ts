import { databaseIcons } from '@/constants/databaseContent';
import { figmaIcons } from '@/constants/figmaIcons';

/** Authenticate screen assets (node 1:96) + shared database card/meta art. */
export const authenticateIcons = {
  hero: require('@/assets/figma/authenticate/hero.png'),
  sectionChevron: require('@/assets/figma/authenticate/chevron.png'),
  ctaIcon: require('@/assets/figma/authenticate/cta_icon.png'),
  ctaArrow: require('@/assets/figma/authenticate/cta_arrow.png'),
  metaCalendar: figmaIcons.metaCalendar,
  metaClock: figmaIcons.hourglassPending,
  metaScan: figmaIcons.collectionChest,
  cardChevron: databaseIcons.cardChevron
} as const;

export type AuthenticateMetaIconKey = 'calendar' | 'clock' | 'scan';

export type AuthenticateMetaItem = {
  key: string;
  icon: AuthenticateMetaIconKey;
  label: string;
  accent?: boolean;
};

export type AuthenticateDraftRecord = {
  key: string;
  cardImage: number;
  title: string;
  description: string;
  tags: string[];
  meta: AuthenticateMetaItem[];
};

export type AuthenticateScannedRecord = {
  key: string;
  cardImage: number;
  title: string;
  tags: string[];
  scannedAt: string;
};

export const authenticateTabs = ['SUBMISSIONS', 'IN PROGRESS', 'COMPLETED'] as const;

export const authenticateDraftRecords: AuthenticateDraftRecord[] = [
  {
    key: 'mantle',
    cardImage: databaseIcons.recordMantle,
    title: '1952 Topps Mickey Mantle\nPatch Review',
    description:
      'Draft submission with patch notes, provenance timeline, and source image checklist.',
    tags: ['PLAYER', 'BASEBALL', 'DRAFT'],
    meta: [
      { key: 'evidence', icon: 'calendar', label: 'Evidence 8/10' },
      { key: 'status', icon: 'clock', label: 'Ready Soon', accent: true }
    ]
  },
  {
    key: 'jordan',
    cardImage: databaseIcons.recordJordan,
    title: 'Michael Jordan\nRelic Comparison',
    description:
      'Side-by-side patch study with stitch analysis, card history, and collector notes.',
    tags: ['PATCH', 'BASKETBALL', 'DRAFT'],
    meta: [
      { key: 'evidence', icon: 'calendar', label: 'Evidence 6/10' },
      { key: 'status', icon: 'clock', label: 'Ready Soon', accent: true }
    ]
  },
  {
    key: 'ruth',
    cardImage: databaseIcons.recordRuth,
    title: 'Babe Ruth Bat Relic\nCase File',
    description:
      'Source images, auction references, and authentication commentary gathered in one draft.',
    tags: ['BAT RELIC', 'BASEBALL', 'DRAFT'],
    meta: [
      { key: 'evidence', icon: 'calendar', label: 'Evidence 7/10' },
      { key: 'status', icon: 'clock', label: 'Ready Soon', accent: true }
    ]
  }
];

export const authenticateScannedRecords: AuthenticateScannedRecord[] = [
  {
    key: 'kobe',
    cardImage: databaseIcons.recentKobe,
    title: 'Kobe Bryant Memorabilia Draft',
    tags: ['PLAYER', 'BASKETBALL'],
    scannedAt: 'Scanned 1h ago'
  },
  {
    key: 'gehrig',
    cardImage: databaseIcons.recentGehrig,
    title: 'Lou Gehrig Provenance Draft',
    tags: ['PLAYER', 'VINTAGE'],
    scannedAt: 'Scanned 3h ago'
  }
];
