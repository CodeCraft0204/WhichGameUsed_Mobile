import { figmaIcons } from '@/constants/figmaIcons';

export { databaseCopy } from '@/constants/databaseCopy';

export const databaseIcons = {
  hero: require('@/assets/figma/database/hero_archive.png'),
  recordMantle: require('@/assets/figma/database/record_mantle.png'),
  recordJordan: require('@/assets/figma/database/record_jordan.png'),
  recordRuth: require('@/assets/figma/database/record_ruth.png'),
  recentKobe: require('@/assets/figma/database/recent_kobe.png'),
  recentGehrig: require('@/assets/figma/database/recent_gehrig.png'),
  metaPerson: figmaIcons.metaPerson,
  metaBaseball: require('@/assets/figma/database/meta_baseball.png'),
  metaBasketball: require('@/assets/figma/database/meta_basketball.png'),
  metaCalendar: figmaIcons.metaCalendar,
  metaShield: figmaIcons.metaShield,
  cardChevron: require('@/assets/figma/database/card_chevron.png'),
  sectionChevron: require('@/assets/figma/database/section_chevron.png'),
  ctaRecords: require('@/assets/figma/database/cta_records.png'),
  ctaArrow: require('@/assets/figma/database/cta_arrow.png'),
  cardPlaceholder: require('@/assets/authenticate/card-placeholder.png')
} as const;

export type DatabaseMetaIconKey = 'person' | 'baseball' | 'basketball' | 'calendar' | 'shield';

export type DatabaseMetaItem = {
  key: string;
  icon: DatabaseMetaIconKey;
  label: string;
};

export type DatabaseRecord = {
  key: string;
  cardImage: number;
  title: string;
  description: string;
  tags: string[];
  meta: DatabaseMetaItem[];
};

export const databaseFeaturedRecords: DatabaseRecord[] = [
  {
    key: 'mantle',
    cardImage: databaseIcons.recordMantle,
    title: '1952 Topps Mickey Mantle\nRelic File',
    description:
      'Authenticated memorabilia card with patch notes, provenance trail, and source links.',
    tags: ['PLAYER', 'AUTHENTICATED', 'VINTAGE'],
    meta: [
      { key: 'player', icon: 'person', label: 'Mickey Mantle' },
      { key: 'team', icon: 'baseball', label: 'New York Yankees' },
      { key: 'year', icon: 'calendar', label: '1952' },
      { key: 'auth', icon: 'shield', label: 'PSA/DNA' }
    ]
  },
  {
    key: 'jordan',
    cardImage: databaseIcons.recordJordan,
    title: 'Michael Jordan\nPatch Comparison',
    description:
      'Side-by-side patch study with stitch analysis, card history, and collector notes.',
    tags: ['PATCH', 'BASKETBALL', 'RESEARCH'],
    meta: [
      { key: 'player', icon: 'person', label: 'Michael Jordan' },
      { key: 'team', icon: 'basketball', label: 'Chicago Bulls' },
      { key: 'year', icon: 'calendar', label: '1997-98' },
      { key: 'auth', icon: 'shield', label: 'Beckett Auth.' }
    ]
  },
  {
    key: 'ruth',
    cardImage: databaseIcons.recordRuth,
    title: 'Babe Ruth Bat Relic Archive',
    description:
      'Source images, auction references, and authentication commentary gathered in one record.',
    tags: ['BAT RELIC', 'BASEBALL', 'SOURCES'],
    meta: [
      { key: 'player', icon: 'person', label: 'Babe Ruth' },
      { key: 'team', icon: 'baseball', label: 'New York Yankees' },
      { key: 'year', icon: 'calendar', label: '1930s' },
      { key: 'auth', icon: 'shield', label: 'JSA' }
    ]
  }
];

export const databaseRecentRecords: DatabaseRecord[] = [
  {
    key: 'kobe',
    cardImage: databaseIcons.recentKobe,
    title: 'Kobe Bryant Memorabilia Index',
    description:
      'Comprehensive index of game-used cards, patches, and related collector resources.',
    tags: ['PLAYER', 'BASKETBALL', 'INDEX'],
    meta: [
      { key: 'year', icon: 'calendar', label: '2005-2016' },
      { key: 'auth', icon: 'shield', label: 'Multiple Labs' }
    ]
  },
  {
    key: 'gehrig',
    cardImage: databaseIcons.recentGehrig,
    title: 'Lou Gehrig Provenance Notes',
    description:
      'Documented ownership history with letters, photos, and auction records.',
    tags: ['PLAYER', 'VINTAGE', 'PROVENANCE'],
    meta: [
      { key: 'year', icon: 'calendar', label: '1920s-1930s' },
      { key: 'auth', icon: 'shield', label: 'PSA/DNA' }
    ]
  }
];

export { databaseSportTabs } from '@/constants/databaseFilters';
