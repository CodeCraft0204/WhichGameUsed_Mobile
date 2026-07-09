import { figmaIcons } from '@/constants/figmaIcons';

/** Most Wanted screen decorative assets (header hero, etc.). */
export const mostWantedIcons = {
  hero: require('@/assets/figma/mostwanted/hero_illustration.png'),
  gift: figmaIcons.treasureChest,
  ctaTrophy: figmaIcons.trophyRanking,
  ctaArrow: require('@/assets/figma/mostwanted/cta_arrow.png')
} as const;
