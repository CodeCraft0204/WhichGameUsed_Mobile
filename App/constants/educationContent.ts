/** Education screen assets — guide/video thumbs + tool icons in assets/figma/education. */
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
  playButton: require('@/assets/figma/education/play_button.png'),
  toolPsa: require('@/assets/figma/education/tool_psa.png'),
  toolMlb: require('@/assets/figma/education/tool_mlb.png'),
  toolUda: require('@/assets/figma/education/tool_uda.png'),
  toolHeritage: require('@/assets/figma/education/tool_heritage.png')
} as const;

export type EducationContentType =
  | 'pdf'
  | 'outline'
  | 'video'
  | 'tool'
  | 'case_study'
  | 'web_guide'
  | 'research_report'
  | 'jersey_archive'
  | 'external_tool';

export type EducationDifficulty = 'beginner' | 'intermediate' | 'all';

export type EducationTopic = 'beginner' | 'intermediate' | 'fraud' | 'verify' | 'research';

export type EducationSourceType =
  | 'which_game_used'
  | 'trusted_external'
  | 'community_contribution'
  | 'licensed_archive';

export type EducationRightsStatus =
  | 'owned'
  | 'licensed'
  | 'permission_received'
  | 'external_link_only'
  | 'pending_review';

/** Quick filter chips on the Education hub (scroll / filter targets). */
export type EducationQuickFilter =
  | 'ALL'
  | 'PDFS'
  | 'VIDEOS'
  | 'JERSEY'
  | 'CASES'
  | 'TOOLS';

export const educationQuickFilters: EducationQuickFilter[] = [
  'ALL',
  'PDFS',
  'VIDEOS',
  'JERSEY',
  'CASES',
  'TOOLS'
];

export const educationQuickFilterLabels: Record<EducationQuickFilter, string> = {
  ALL: 'ALL',
  PDFS: 'PDFS',
  VIDEOS: 'VIDEOS',
  JERSEY: 'JERSEY ARCHIVE',
  CASES: 'CASE STUDIES',
  TOOLS: 'RESEARCH TOOLS'
};

export type EducationBrowseTypeKey =
  | 'pdfs'
  | 'videos'
  | 'reports'
  | 'cases'
  | 'jersey'
  | 'tools';

export type EducationBrowseType = {
  key: EducationBrowseTypeKey;
  title: string;
  subtitle: string;
  sectionId: string;
  filter: EducationQuickFilter;
};

export const educationBrowseTypes: EducationBrowseType[] = [
  {
    key: 'pdfs',
    title: 'PDF Guides',
    subtitle: 'Guides & reports',
    sectionId: 'pdfs',
    filter: 'PDFS'
  },
  {
    key: 'videos',
    title: 'Videos',
    subtitle: 'Walkthroughs',
    sectionId: 'videos',
    filter: 'VIDEOS'
  },
  {
    key: 'reports',
    title: 'Research Reports',
    subtitle: 'Coming with CMS',
    sectionId: 'pdfs',
    filter: 'PDFS'
  },
  {
    key: 'cases',
    title: 'Case Studies',
    subtitle: 'Investigations',
    sectionId: 'cases',
    filter: 'CASES'
  },
  {
    key: 'jersey',
    title: 'Jersey Archive',
    subtitle: 'Sport → Team → Year',
    sectionId: 'jersey',
    filter: 'JERSEY'
  },
  {
    key: 'tools',
    title: 'Research Tools',
    subtitle: 'Lookups & archives',
    sectionId: 'tools',
    filter: 'TOOLS'
  }
];

/** Placeholder cascade options for jersey archive shell (no inventory yet). */
export const educationJerseySports = ['Baseball', 'Basketball', 'Football', 'Hockey'] as const;

export type EducationJourneyStep = 'LEARN' | 'VERIFY' | 'RESEARCH' | 'APPLY';

type EducationLibraryFields = {
  sourceType?: EducationSourceType;
  rightsStatus?: EducationRightsStatus;
  sport?: string;
  team?: string;
  yearStart?: number;
  yearEnd?: number;
  tags?: string[];
};

export type EducationGuide = EducationLibraryFields & {
  key: string;
  image: number;
  title: string;
  description: string;
  publisher: string;
  contentType: Extract<EducationContentType, 'pdf' | 'outline'>;
  difficulty: EducationDifficulty;
  lengthLabel: string;
  lastReviewed: string;
  isExternal?: boolean;
  /** Hosted PDF URL when available. */
  href?: string;
  /** In-app outline slug for WGU guides. */
  outlineSlug?: string;
  topics: EducationTopic[];
  chapters?: string[];
};

export type EducationVideo = EducationLibraryFields & {
  key: string;
  thumb: number;
  title: string;
  channel: string;
  duration: string;
  platform: string;
  publisher: string;
  contentType: Extract<EducationContentType, 'video' | 'web_guide'>;
  difficulty?: EducationDifficulty;
  lastReviewed: string;
  isExternal: boolean;
  href: string;
  topics: EducationTopic[];
};

export type EducationTool = EducationLibraryFields & {
  key: string;
  icon: number;
  title: string;
  description: string;
  publisher: string;
  contentType: 'tool' | 'external_tool';
  lastReviewed: string;
  isExternal: true;
  href: string;
  footnote?: string;
  topics: EducationTopic[];
};

export type EducationCaseStudyCta =
  | 'mostwanted'
  | 'discussion'
  | 'wishlist'
  | 'authenticate'
  | 'database';

export type EducationCaseStudy = EducationLibraryFields & {
  key: string;
  title: string;
  body: string;
  publisher: string;
  contentType: 'case_study';
  lastReviewed: string;
  isExternal: false;
  ctaLabel: string;
  ctaTarget: EducationCaseStudyCta;
  topics: EducationTopic[];
};

export type EducationFeaturedItem =
  | { kind: 'guide'; item: EducationGuide }
  | { kind: 'video'; item: EducationVideo }
  | { kind: 'case'; item: EducationCaseStudy };

/** Mixed featured strip: all guides + first video + first case study. */
export function featuredPublications(): EducationFeaturedItem[] {
  const items: EducationFeaturedItem[] = educationGuides.map((item) => ({
    kind: 'guide' as const,
    item
  }));
  if (educationVideos[0]) items.push({ kind: 'video', item: educationVideos[0] });
  if (educationCaseStudies[0]) items.push({ kind: 'case', item: educationCaseStudies[0] });
  return items;
}

function matchesQuery(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

export function searchEducationLibrary(query: string): {
  guides: EducationGuide[];
  videos: EducationVideo[];
  tools: EducationTool[];
  cases: EducationCaseStudy[];
} {
  const q = query.trim();
  if (!q) {
    return {
      guides: educationGuides,
      videos: educationVideos,
      tools: educationTools,
      cases: educationCaseStudies
    };
  }

  const guideHit = (g: EducationGuide) =>
    matchesQuery(
      [g.title, g.description, g.publisher, g.topics.join(' '), ...(g.tags ?? [])].join(' '),
      q
    );
  const videoHit = (v: EducationVideo) =>
    matchesQuery(
      [v.title, v.channel, v.publisher, v.platform, v.topics.join(' '), ...(v.tags ?? [])].join(' '),
      q
    );
  const toolHit = (t: EducationTool) =>
    matchesQuery([t.title, t.description, t.publisher, ...(t.tags ?? [])].join(' '), q);
  const caseHit = (c: EducationCaseStudy) =>
    matchesQuery([c.title, c.body, c.publisher, c.topics.join(' '), ...(c.tags ?? [])].join(' '), q);

  return {
    guides: educationGuides.filter(guideHit),
    videos: educationVideos.filter(videoHit),
    tools: educationTools.filter(toolHit),
    cases: educationCaseStudies.filter(caseHit)
  };
}

export const educationJourneyChips: EducationJourneyStep[] = [
  'LEARN',
  'VERIFY',
  'RESEARCH',
  'APPLY'
];

export const educationGuides: EducationGuide[] = [
  {
    key: 'altered-patches',
    image: educationIcons.guideFakePatches,
    title: 'Identifying Altered Patch Cards',
    description:
      'Learn how to spot replaced swatches, suspicious logo patches, inconsistent stitching, incorrect materials, and patch-window alterations.',
    publisher: 'Which Game Used',
    contentType: 'outline',
    difficulty: 'beginner',
    lengthLabel: '14–18 pages',
    lastReviewed: 'Jul 2026',
    sourceType: 'which_game_used',
    rightsStatus: 'owned',
    outlineSlug: 'identifying-altered-patch-cards',
    topics: ['beginner', 'fraud'],
    tags: ['authentication', 'altered patches'],
    chapters: [
      'Original swatch versus altered patch examples',
      'Patch size and window alignment',
      'Stitching, fabric and logo consistency',
      'Serial-number and parallel comparisons',
      'Manufacturer checklist research',
      'What to photograph before submitting for authentication',
      'Final red-flag checklist'
    ]
  },
  {
    key: 'research-catalogs',
    image: educationIcons.guideBeckett,
    title: 'Researching Game-Used Cards with Catalogs and Archives',
    description:
      'Use checklists, old hobby publications, auction descriptions and historical sales images to investigate a memorabilia claim.',
    publisher: 'Which Game Used',
    contentType: 'outline',
    difficulty: 'intermediate',
    lengthLabel: '16–20 pages',
    lastReviewed: 'Jul 2026',
    sourceType: 'which_game_used',
    rightsStatus: 'owned',
    outlineSlug: 'researching-game-used-cards',
    topics: ['intermediate', 'research'],
    tags: ['catalog research', 'provenance'],
    chapters: [
      'Identifying the exact card, year, set and parallel',
      'Reading memorabilia wording on the card back',
      'Searching Beckett checklists',
      'Searching old auction records',
      'Comparing lot descriptions and photographs',
      'Recording sources, dates and archived URLs',
      'Separating confirmed facts from collector assumptions'
    ]
  },
  {
    key: 'psa-fraud-2025',
    image: educationIcons.guideHobbyHistory,
    title: '2025 PSA Fraud Report',
    description:
      'Review current counterfeit patterns, fraud risks and collector-protection practices.',
    publisher: 'PSA',
    contentType: 'pdf',
    difficulty: 'all',
    lengthLabel: '32 pages',
    lastReviewed: 'Jul 2026',
    isExternal: true,
    sourceType: 'trusted_external',
    rightsStatus: 'external_link_only',
    href: 'https://downloads.ctfassets.net/l40e281thfxr/72ZJooe31lk9KGBklfQFOu/4a3bf368f91a364fad3ccc2eca077a17/PSA_Fraud-Report_2025.pdf',
    topics: ['fraud', 'beginner', 'intermediate'],
    tags: ['counterfeits', 'fraud']
  }
];

export const educationVideos: EducationVideo[] = [
  {
    key: 'mlb-auth-works',
    thumb: educationIcons.videoPatch,
    title: 'How MLB Authentication Works',
    channel: 'MLB',
    duration: '3:33',
    platform: 'MLB Video',
    publisher: 'MLB',
    contentType: 'video',
    difficulty: 'beginner',
    lastReviewed: 'Jul 2026',
    isExternal: true,
    sourceType: 'trusted_external',
    rightsStatus: 'external_link_only',
    href: 'https://www.mlb.com/video/business-of-baseball-mlb-authentication',
    topics: ['beginner', 'verify', 'fraud']
  },
  {
    key: 'mlb-game-used-auth',
    thumb: educationIcons.videoEbay,
    title: 'See How Game-Used Memorabilia Gets Authenticated',
    channel: 'MLB',
    duration: 'Watch',
    platform: 'YouTube',
    publisher: 'MLB',
    contentType: 'video',
    difficulty: 'beginner',
    lastReviewed: 'Jul 2026',
    isExternal: true,
    sourceType: 'trusted_external',
    rightsStatus: 'external_link_only',
    href: 'https://www.youtube.com/watch?v=ssE1bc7N9Po',
    topics: ['beginner', 'verify']
  },
  {
    key: 'psa-security-guide',
    thumb: educationIcons.videoBeckett,
    title: 'PSA Security: A Buyer’s Guide',
    channel: 'PSA',
    duration: 'Web guide',
    platform: 'PSA',
    publisher: 'PSA',
    contentType: 'web_guide',
    difficulty: 'all',
    lastReviewed: 'Jul 2026',
    isExternal: true,
    sourceType: 'trusted_external',
    rightsStatus: 'external_link_only',
    href: 'https://www.psacard.com/services/psasecurityabuyersguide',
    topics: ['fraud', 'verify', 'intermediate']
  }
];

export const educationTools: EducationTool[] = [
  {
    key: 'psa-cert',
    icon: educationIcons.toolPsa,
    title: 'Verify a PSA Certification',
    description: 'Check a PSA certification number and review the associated collectible record.',
    publisher: 'PSA',
    contentType: 'tool',
    lastReviewed: 'Jul 2026',
    isExternal: true,
    sourceType: 'trusted_external',
    rightsStatus: 'external_link_only',
    href: 'https://www.psacard.com/cert',
    footnote:
      'A valid certification number alone does not completely eliminate counterfeit risk.',
    topics: ['verify']
  },
  {
    key: 'mlb-hologram',
    icon: educationIcons.toolMlb,
    title: 'Verify an MLB Hologram',
    description: 'Look up officially authenticated MLB game-used and autographed memorabilia.',
    publisher: 'MLB',
    contentType: 'tool',
    lastReviewed: 'Jul 2026',
    isExternal: true,
    sourceType: 'trusted_external',
    rightsStatus: 'external_link_only',
    href: 'https://www.mlb.com/official-information/authentication',
    topics: ['verify']
  },
  {
    key: 'uda-hologram',
    icon: educationIcons.toolUda,
    title: 'Verify an Upper Deck Hologram',
    description: 'Match a UDA hologram number with its registered item description and image.',
    publisher: 'Upper Deck',
    contentType: 'tool',
    lastReviewed: 'Jul 2026',
    isExternal: true,
    sourceType: 'trusted_external',
    rightsStatus: 'external_link_only',
    href: 'https://upperdeck.com/hologram/',
    topics: ['verify']
  },
  {
    key: 'heritage-archive',
    icon: educationIcons.toolHeritage,
    title: 'Search Historical Auction Records',
    description: 'Research previous listings, photographs, descriptions, provenance and sale results.',
    publisher: 'Heritage Auctions',
    contentType: 'tool',
    lastReviewed: 'Jul 2026',
    isExternal: true,
    sourceType: 'trusted_external',
    rightsStatus: 'external_link_only',
    href: 'https://www.ha.com/c/ref/information-archive.zx',
    topics: ['research']
  }
];

export const educationCaseStudies: EducationCaseStudy[] = [
  {
    key: 'mw-solved',
    title: 'How a Most Wanted Card Was Solved',
    body: 'Community evidence, checklist research, and careful photo comparison turned an open hunt into a confirmed game-used record.',
    publisher: 'Which Game Used',
    contentType: 'case_study',
    lastReviewed: 'Jul 2026',
    isExternal: false,
    sourceType: 'which_game_used',
    rightsStatus: 'owned',
    ctaLabel: 'OPEN MOST WANTED HUNT',
    ctaTarget: 'mostwanted',
    topics: ['intermediate', 'research']
  },
  {
    key: 'patch-flagged',
    title: 'Why This Patch Was Flagged',
    body: 'Window alignment, stitch pattern, and material cues did not match known authentic examples—so the submission was held for more evidence.',
    publisher: 'Which Game Used',
    contentType: 'case_study',
    lastReviewed: 'Jul 2026',
    isExternal: false,
    sourceType: 'which_game_used',
    rightsStatus: 'owned',
    ctaLabel: 'JOIN THE DISCUSSION',
    ctaTarget: 'discussion',
    topics: ['beginner', 'fraud']
  },
  {
    key: 'conflicting-auctions',
    title: 'Comparing Two Conflicting Auction Listings',
    body: 'Two lot descriptions claimed the same provenance. Side-by-side photos and archived sale notes showed only one story held up.',
    publisher: 'Which Game Used',
    contentType: 'case_study',
    lastReviewed: 'Jul 2026',
    isExternal: false,
    sourceType: 'which_game_used',
    rightsStatus: 'owned',
    ctaLabel: 'JOIN THE DISCUSSION',
    ctaTarget: 'discussion',
    topics: ['intermediate', 'research']
  },
  {
    key: 'wishlist-to-database',
    title: 'From Wishlist Request to Confirmed Database Record',
    body: 'Demand scoring, admin promotion, and community research moved a missing card from wishlist interest into the live catalog.',
    publisher: 'Which Game Used',
    contentType: 'case_study',
    lastReviewed: 'Jul 2026',
    isExternal: false,
    sourceType: 'which_game_used',
    rightsStatus: 'owned',
    ctaLabel: 'VIEW THE CARD',
    ctaTarget: 'wishlist',
    topics: ['intermediate']
  },
  {
    key: 'strong-evidence',
    title: 'How to Submit Strong Authentication Evidence',
    body: 'Clear fronts and backs, patch close-ups, source links, and honest notes give reviewers what they need to confirm or reject a claim.',
    publisher: 'Which Game Used',
    contentType: 'case_study',
    lastReviewed: 'Jul 2026',
    isExternal: false,
    sourceType: 'which_game_used',
    rightsStatus: 'owned',
    ctaLabel: 'AUTHENTICATE A SIMILAR CARD',
    ctaTarget: 'authenticate',
    topics: ['beginner', 'fraud']
  }
];

export function guideByOutlineSlug(slug: string): EducationGuide | undefined {
  return educationGuides.find((g) => g.outlineSlug === slug);
}

export function guidesForTopic(topic: EducationTopic): EducationGuide[] {
  return educationGuides.filter((g) => g.topics.includes(topic));
}

export function videosForTopic(topic: EducationTopic): EducationVideo[] {
  return educationVideos.filter((v) => v.topics.includes(topic));
}

export function formatGuideMeta(guide: EducationGuide): string {
  const level =
    guide.difficulty === 'all'
      ? 'ALL LEVELS'
      : guide.difficulty === 'beginner'
        ? 'BEGINNER'
        : 'INTERMEDIATE';
  return `${guide.lengthLabel.toUpperCase()} • ${level}`;
}
