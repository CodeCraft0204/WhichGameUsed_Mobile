import { remoteAsset } from '@/constants/remoteAssets';
/** Leaderboard & collector profile art from assets/figma/leaderboard */
export const leaderboardAssets = {
  tornPaperBanner: remoteAsset('figma/leaderboard/1.png'),
  pointsPillSilver: remoteAsset('figma/leaderboard/2.png'),
  pointsPillGold: remoteAsset('figma/leaderboard/3.png'),
  pointsPillBronze: remoteAsset('figma/leaderboard/4.png'),
  laurelSilver: remoteAsset('figma/leaderboard/5.png'),
  laurelGold: remoteAsset('figma/leaderboard/6.png'),
  laurelBronze: remoteAsset('figma/leaderboard/7.png'),
  avatarFrame: remoteAsset('figma/leaderboard/8.png'),
  giftIcon: remoteAsset('figma/leaderboard/9.png'),
  prizeDisplayCase: remoteAsset('figma/leaderboard/10.png'),
  avatarRingGold: remoteAsset('figma/leaderboard/11.png'),
  rankBadgeShield: remoteAsset('figma/leaderboard/12.png'),
  cardFrame: remoteAsset('figma/leaderboard/13.png'),
  pointsChest: remoteAsset('figma/leaderboard/14.png'),
  iconAuth: remoteAsset('figma/leaderboard/15.png'),
  iconResearch: remoteAsset('figma/leaderboard/16.png'),
  iconDiscussion: remoteAsset('figma/leaderboard/17.png'),
  iconOther: remoteAsset('figma/leaderboard/18.png'),
  learnMoreBtn: remoteAsset('figma/leaderboard/19.png'),
  viewProfileIcon: remoteAsset('figma/leaderboard/20.png'),
  rankSeal: remoteAsset('figma/leaderboard/rank_badge1.png'),
  sectionChevron: remoteAsset('figma/leaderboard/section_chevron.png'),
  ctaTrophy: remoteAsset('figma/leaderboard/cta_trophy.png'),
  heroTrophy: remoteAsset('figma/leaderboard/hero_trophy.png'),
  ctaArrow: remoteAsset('figma/leaderboard/cta_arrow.png'),
  podiumRoot: remoteAsset('figma/leaderboard/Root.png')
} as const;

/** Root.png art size — keeps podium aspect ratio locked to the asset. */
export const PODIUM_ASPECT = 810 / 300;

/** Points ribbon art (2.png / 3.png / 4.png) ≈ 152×33. */
export const POINTS_PILL_ASPECT = 152 / 33;

/**
 * Per-rank podium layout derived from Root.png (810×300).
 * colFlex = column width share; top/card/base = vertical zones inside each column.
 */
/** Vertical zones tuned to Root.png parchment windows (810×300 art). */
export const PODIUM_LAYOUT = {
  2: { colFlex: 286, topFlex: 17, cardFlex: 34, baseFlex: 49 },
  1: { colFlex: 354, topFlex: 3, cardFlex: 49, baseFlex: 48 },
  3: { colFlex: 286, topFlex: 21, cardFlex: 31, baseFlex: 48 }
} as const;

/** Rank medals (5–7) + points ribbons (2–4) + avatar rings per place. */
export const PODIUM_RANK_THEME = {
  1: {
    laurel: leaderboardAssets.laurelGold,
    pointsPill: leaderboardAssets.pointsPillGold,
    avatarRing: leaderboardAssets.avatarRingGold
  },
  2: {
    laurel: leaderboardAssets.laurelSilver,
    pointsPill: leaderboardAssets.pointsPillSilver,
    avatarRing: leaderboardAssets.avatarFrame
  },
  3: {
    laurel: leaderboardAssets.laurelBronze,
    pointsPill: leaderboardAssets.pointsPillBronze,
    avatarRing: leaderboardAssets.avatarFrame
  }
} as const;

export const BREAKDOWN_ICONS = {
  auth: leaderboardAssets.iconAuth,
  research: leaderboardAssets.iconResearch,
  forum: leaderboardAssets.iconDiscussion,
  other: leaderboardAssets.iconOther
} as const;
