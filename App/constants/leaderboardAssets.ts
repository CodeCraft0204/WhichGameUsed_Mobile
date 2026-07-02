/** Leaderboard & collector profile art from assets/figma/leaderboard */
export const leaderboardAssets = {
  tornPaperBanner: require('@/assets/figma/leaderboard/1.png'),
  pointsPillSilver: require('@/assets/figma/leaderboard/2.png'),
  pointsPillGold: require('@/assets/figma/leaderboard/3.png'),
  pointsPillBronze: require('@/assets/figma/leaderboard/4.png'),
  laurelSilver: require('@/assets/figma/leaderboard/5.png'),
  laurelGold: require('@/assets/figma/leaderboard/6.png'),
  laurelBronze: require('@/assets/figma/leaderboard/7.png'),
  avatarFrame: require('@/assets/figma/leaderboard/8.png'),
  giftIcon: require('@/assets/figma/leaderboard/9.png'),
  prizeDisplayCase: require('@/assets/figma/leaderboard/10.png'),
  avatarRingGold: require('@/assets/figma/leaderboard/11.png'),
  rankBadgeShield: require('@/assets/figma/leaderboard/12.png'),
  cardFrame: require('@/assets/figma/leaderboard/13.png'),
  pointsChest: require('@/assets/figma/leaderboard/14.png'),
  iconAuth: require('@/assets/figma/leaderboard/15.png'),
  iconResearch: require('@/assets/figma/leaderboard/16.png'),
  iconDiscussion: require('@/assets/figma/leaderboard/17.png'),
  iconOther: require('@/assets/figma/leaderboard/18.png'),
  learnMoreBtn: require('@/assets/figma/leaderboard/19.png'),
  viewProfileIcon: require('@/assets/figma/leaderboard/20.png'),
  rankSeal: require('@/assets/figma/leaderboard/rank_badge1.png'),
  sectionChevron: require('@/assets/figma/leaderboard/section_chevron.png'),
  ctaTrophy: require('@/assets/figma/leaderboard/cta_trophy.png'),
  heroTrophy: require('@/assets/figma/leaderboard/hero_trophy.png'),
  ctaArrow: require('@/assets/figma/leaderboard/cta_arrow.png'),
  podiumRoot: require('@/assets/figma/leaderboard/Root.png')
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
