/** Education screen assets (node 1:574). */
export const educationIcons = {
  hero: require('@/assets/figma/education/hero_illustration.png'),
  guideFakePatches: require('@/assets/figma/education/guide_fake_patches.png'),
  guideBeckett: require('@/assets/figma/education/guide_beckett.png'),
  guideHobbyHistory: require('@/assets/figma/education/guide_hobby_history.png'),
  pdfIcon: require('@/assets/figma/education/pdf_icon.png'),
  videoEbay: require('@/assets/figma/education/video_thumb_ebay.png'),
  videoBeckett: require('@/assets/figma/education/video_thumb_beckett.png'),
  videoPatch: require('@/assets/figma/education/video_thumb_patch.png'),
  ctaShield: require('@/assets/figma/education/cta_shield.png'),
  ctaArrow: require('@/assets/figma/education/cta_arrow.png'),
  playButton: require('@/assets/figma/education/play_button.png')
} as const;

export type EducationGuide = {
  key: string;
  image: number;
  title: string;
  description: string;
  meta: string;
};

export type EducationVideo = {
  key: string;
  thumb: number;
  title: string;
  channel: string;
  duration: string;
  platform: string;
};

export const educationTabs = [
  'ALL',
  'AUTHENTICATION',
  'PHOTO MATCHING',
  'IDENTIFYING FAKES',
  'SOURCES'
] as const;

/** Two rows so equal-width pills show full labels on phone widths. */
export const educationTabRows: readonly (readonly (typeof educationTabs)[number][])[] = [
  ['ALL', 'AUTHENTICATION', 'PHOTO MATCHING'],
  ['IDENTIFYING FAKES', 'SOURCES']
];

export const educationGuides: EducationGuide[] = [
  {
    key: 'patches',
    image: educationIcons.guideFakePatches,
    title: 'Identifying Fake Patches',
    description: 'Spot altered swatches, manufactured patches, and other memorabilia red flags.',
    meta: '24 PAGES • BEGINNER'
  },
  {
    key: 'beckett',
    image: educationIcons.guideBeckett,
    title: 'Reading Beckett & Auction Catalogs',
    description: 'Use hobby publications and old sales catalogs as research sources.',
    meta: '18 PAGES • INTERMEDIATE'
  },
  {
    key: 'history',
    image: educationIcons.guideHobbyHistory,
    title: 'Making Hobby History',
    description: 'Build timelines, provenance, and player-worn evidence from the record.',
    meta: '16 PAGES • ALL LEVELS'
  }
];

export const educationVideos: EducationVideo[] = [
  {
    key: 'ebay',
    thumb: educationIcons.videoEbay,
    title: 'Browsing eBay for Counterfeit Game-Used Cards',
    channel: 'Which Game Used',
    duration: '12:45',
    platform: 'YouTube'
  },
  {
    key: 'beckett',
    thumb: educationIcons.videoBeckett,
    title: 'How to Read Beckett Like a Researcher',
    channel: 'Hobby Archive',
    duration: '8:32',
    platform: 'YouTube'
  },
  {
    key: 'patch',
    thumb: educationIcons.videoPatch,
    title: 'Patch Authentication Basics',
    channel: 'Collector Classroom',
    duration: '10:21',
    platform: 'Instagram'
  }
];
