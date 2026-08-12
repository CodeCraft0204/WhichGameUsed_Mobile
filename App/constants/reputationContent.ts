import { remoteAsset } from '@/constants/remoteAssets';
import type { ImageSourcePropType } from 'react-native';
import { contributorBadgeImages } from '@/constants/mostWantedContent';

/** Card evidence-file attribute badges (status of the card). */
export const cardEvidenceAttributeImages = {
  photo_matched: remoteAsset('figma/reputation/attr_photo_matched.png'),
  catalogued: remoteAsset('figma/reputation/attr_catalogued.png'),
  evidence_published: remoteAsset('figma/reputation/attr_evidence_published.png'),
  trending: remoteAsset('figma/reputation/attr_trending.png'),
  top_rated: remoteAsset('figma/reputation/attr_top_rated.png')
} as const satisfies Record<string, ImageSourcePropType>;

export type CardEvidenceAttributeKey = keyof typeof cardEvidenceAttributeImages;

export const cardEvidenceAttributeCatalog: {
  key: CardEvidenceAttributeKey;
  label: string;
  description: string;
  automatic: boolean;
}[] = [
  {
    key: 'photo_matched',
    label: 'Photo Matched',
    description: 'Memorabilia pattern matched to a source photograph or game image.',
    automatic: false
  },
  {
    key: 'catalogued',
    label: 'Catalogued',
    description: 'Card, product, player, set, and memorabilia details fully linked.',
    automatic: true
  },
  {
    key: 'evidence_published',
    label: 'Evidence Published',
    description: 'Approved evidence is publicly visible on this card.',
    automatic: true
  },
  {
    key: 'trending',
    label: 'Trending',
    description: 'High recent research ratings and leaderboard activity over 7 days.',
    automatic: true
  },
  {
    key: 'top_rated',
    label: 'Top Rated',
    description: 'High community score with at least 10 votes.',
    automatic: true
  }
];

/** Detective rank icons (lifetime XP progression). */
export const detectiveRankImages = {
  1: remoteAsset('figma/reputation/rank_evidence_room_lurker.png'),
  2: remoteAsset('figma/reputation/rank_rookie.png'),
  3: remoteAsset('figma/reputation/rank_patch_patrol.png'),
  4: remoteAsset('figma/reputation/rank_rabbit_hole_ranger.png'),
  5: remoteAsset('figma/reputation/rank_cardboard_commissioner.png')
} as const satisfies Record<number, ImageSourcePropType>;

export type DetectiveRankLevel = 1 | 2 | 3 | 4 | 5;

export const detectiveRankCatalog: {
  level: DetectiveRankLevel;
  key: string;
  label: string;
  xpMin: number;
  xpMax: number | null;
}[] = [
  { level: 1, key: 'evidence_room_lurker', label: 'Evidence Room Lurker', xpMin: 0, xpMax: 99 },
  { level: 2, key: 'rookie', label: 'Rookie', xpMin: 100, xpMax: 499 },
  { level: 3, key: 'patch_patrol', label: 'Patch Patrol', xpMin: 500, xpMax: 1499 },
  { level: 4, key: 'rabbit_hole_ranger', label: 'Rabbit-Hole Ranger', xpMin: 1500, xpMax: 3999 },
  { level: 5, key: 'cardboard_commissioner', label: 'Cardboard Commissioner', xpMin: 4000, xpMax: null }
];

export function detectiveRankForXp(xp: number) {
  let current = detectiveRankCatalog[0];
  for (const rank of detectiveRankCatalog) {
    if (xp >= rank.xpMin) current = rank;
  }
  return current;
}

export function detectiveRankImage(level: number): ImageSourcePropType {
  const key = Math.min(5, Math.max(1, level)) as DetectiveRankLevel;
  return detectiveRankImages[key];
}

export function cardEvidenceAttributeImage(
  key: string
): ImageSourcePropType | null {
  if (key in cardEvidenceAttributeImages) {
    return cardEvidenceAttributeImages[key as CardEvidenceAttributeKey];
  }
  return null;
}

/** Donut currency + gift / level-up art (Phase 2). */
export const reputationUiImages = {
  donut: remoteAsset('figma/reputation/donut_currency.png'),
  qualityStar: remoteAsset('figma/reputation/quality_star.png'),
  qualityStarEmpty: remoteAsset('figma/reputation/quality_star_empty.png'),
  rankLevelUp: remoteAsset('figma/reputation/rank_level_up.png')
} as const;

/** Evidence quality levels with police-star art. */
export const evidenceQualityLevels = [
  { level: 1, key: 'preliminary_lead', label: 'Preliminary Lead' },
  { level: 2, key: 'supporting_evidence', label: 'Supporting Evidence' },
  { level: 3, key: 'strong_evidence', label: 'Strong Evidence' },
  { level: 4, key: 'verified_evidence', label: 'Verified Evidence' },
  { level: 5, key: 'conclusive_match', label: 'Conclusive Match' }
] as const;

export type EvidenceQualityKey = (typeof evidenceQualityLevels)[number]['key'];

export function evidenceQualityLabel(level: number | null | undefined): string {
  if (level == null || level < 1) return 'Unrated';
  const row = evidenceQualityLevels.find((q) => q.level === level);
  return row?.label ?? 'Unrated';
}

/** Achievement catalog — MW art reused where keys overlap. */
export const achievementBadgeCatalog = [
  { key: 'first_evidence', label: 'First Evidence' },
  { key: 'photo_matcher', label: 'Photo Matcher' },
  { key: 'source_hunter', label: 'Source Hunter' },
  { key: 'patch_expert', label: 'Patch Expert' },
  { key: 'provenance_researcher', label: 'Provenance Researcher' },
  { key: 'card_solver', label: 'Card Solver' },
  { key: 'most_wanted_contributor', label: 'Most Wanted Contributor' },
  { key: 'helpful_researcher', label: 'Helpful Researcher' },
  { key: 'community_favorite', label: 'Community Favorite' },
  { key: 'timeline_historian', label: 'Timeline Historian' },
  { key: 'counterfeit_watch', label: 'Counterfeit Watch' },
  { key: 'catalog_contributor', label: 'Catalog Contributor' }
] as const;

export type AchievementBadgeKey = (typeof achievementBadgeCatalog)[number]['key'];

const achievementImageMap: Record<string, ImageSourcePropType> = {
  first_evidence: contributorBadgeImages.evidence_finder,
  photo_matcher: contributorBadgeImages.evidence_finder,
  source_hunter: contributorBadgeImages.source_hunter,
  patch_expert: detectiveRankImages[3],
  provenance_researcher: contributorBadgeImages.research_helper,
  card_solver: contributorBadgeImages.card_solver,
  most_wanted_contributor: contributorBadgeImages.most_wanted_contributor,
  helpful_researcher: contributorBadgeImages.research_helper,
  community_favorite: reputationUiImages.donut,
  timeline_historian: detectiveRankImages[4],
  counterfeit_watch: detectiveRankImages[5],
  catalog_contributor: detectiveRankImages[2]
};

export function achievementBadgeImage(badgeKey: string): ImageSourcePropType {
  return achievementImageMap[badgeKey] ?? detectiveRankImages[1];
}

export function achievementBadgeLabel(badgeKey: string): string {
  const row = achievementBadgeCatalog.find((b) => b.key === badgeKey);
  return row?.label ?? badgeKey.replace(/_/g, ' ');
}
