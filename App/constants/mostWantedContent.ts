import { remoteAsset } from '@/constants/remoteAssets';
import type { ImageSourcePropType } from 'react-native';
import { figmaIcons } from '@/constants/figmaIcons';

/** Ornate contributor badge art — shown on profile after admin confirm. */
export const contributorBadgeImages = {
  evidence_finder: remoteAsset('figma/mostwanted/new_assets (15).png'),
  source_hunter: remoteAsset('figma/mostwanted/new_assets (16).png'),
  research_helper: remoteAsset('figma/mostwanted/new_assets (17).png'),
  card_solver: remoteAsset('figma/mostwanted/new_assets (18).png'),
  most_wanted_contributor: remoteAsset('figma/mostwanted/new_assets (19).png')
} as const satisfies Record<string, ImageSourcePropType>;

export type ContributorBadgeImageKey = keyof typeof contributorBadgeImages;

export function contributorBadgeImage(badgeKey: string): ImageSourcePropType | null {
  if (badgeKey in contributorBadgeImages) {
    return contributorBadgeImages[badgeKey as ContributorBadgeImageKey];
  }
  return null;
}

/** Most Wanted screen decorative assets (header hero, etc.). */
export const mostWantedIcons = {
  hero: remoteAsset('figma/mostwanted/hero_illustration.png'),
  gift: figmaIcons.treasureChest,
  ctaTrophy: figmaIcons.trophyRanking,
  ctaArrow: remoteAsset('figma/mostwanted/cta_arrow.png'),

  // Figma redesign assets (assets/figma/mostwanted)
  statTarget: remoteAsset('figma/mostwanted/new_assets (1).png'),
  statContributors: remoteAsset('figma/mostwanted/new_assets (2).png'),
  statPuzzle: remoteAsset('figma/mostwanted/new_assets (3).png'),
  badgeCluster: remoteAsset('figma/mostwanted/new_assets (4).png'),
  evidenceImage: remoteAsset('figma/mostwanted/new_assets (5).png'),
  evidenceLink: remoteAsset('figma/mostwanted/new_assets (6).png'),
  evidenceJersey: remoteAsset('figma/mostwanted/new_assets (7).png'),
  evidenceNote: remoteAsset('figma/mostwanted/new_assets (8).png'),
  evidenceCamera: remoteAsset('figma/mostwanted/new_assets (9).png'),
  evidenceDoc: remoteAsset('figma/mostwanted/new_assets (20).png'),
  discuss: remoteAsset('figma/mostwanted/new_assets (10).png'),
  watchStar: remoteAsset('figma/mostwanted/new_assets (11).png'),
  share: remoteAsset('figma/mostwanted/new_assets (12).png'),
  ctaShield: remoteAsset('figma/mostwanted/new_assets (13).png'),
  shieldDark: remoteAsset('figma/mostwanted/new_assets (14).png'),
  people: remoteAsset('figma/mostwanted/new_assets (21).png'),
  featuredBanner: remoteAsset('figma/mostwanted/new_assets (22).png'),
  starSmall: remoteAsset('figma/mostwanted/new_assets (23).png'),
  eye: remoteAsset('figma/mostwanted/new_assets (24).png'),
  likeDark: remoteAsset('figma/mostwanted/new_assets (25).png'),
  commentDark: remoteAsset('figma/mostwanted/new_assets (26).png'),
  trophy: remoteAsset('figma/mostwanted/new_assets (27).png'),
  starFilled: remoteAsset('figma/mostwanted/new_assets (28).png'),
  eyeDark: remoteAsset('figma/mostwanted/new_assets (29).png'),
  like: remoteAsset('figma/mostwanted/icon_like.png'),
  dislike: remoteAsset('figma/mostwanted/icon_dislike.png'),
  comment: remoteAsset('figma/mostwanted/icon_comment.png'),
  ...contributorBadgeImages
} as const;
