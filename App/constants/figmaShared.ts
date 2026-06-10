import { figmaIcons } from '@/constants/figmaIcons';

/** Icons reused across hub screens (Return / Education / Most Wanted / Leaderboard / Advocacy). */
export const figmaSharedIcons = {
  utilitySearch: figmaIcons.utilitySearch,
  utilityProfile: figmaIcons.utilityProfile,
  utilitySettings: figmaIcons.utilitySettings,
  titleBrush: require('@/assets/figma/advocacy/title_brush.png'),
  sectionChevron: require('@/assets/figma/advocacy/section_chevron.png'),
  navReturn: figmaIcons.navReturn,
  navEducation: figmaIcons.navEducation,
  navMostwanted: figmaIcons.navMostWanted,
  navLeaderboard: figmaIcons.navLeaderboard,
  navAdvocacy: figmaIcons.navAdvocacy
} as const;

export type HubNavKey = 'return' | 'education' | 'mostwanted' | 'leaderboard' | 'advocacy';

export const hubNavItems = [
  { key: 'return' as const, label: 'RETURN', href: '/database/database' as const, icon: figmaSharedIcons.navReturn },
  { key: 'education' as const, label: 'EDUCATION', href: '/education/education' as const, icon: figmaSharedIcons.navEducation },
  { key: 'mostwanted' as const, label: 'MOST WANTED', href: '/mostwanted/mostwanted' as const, icon: figmaSharedIcons.navMostwanted },
  { key: 'leaderboard' as const, label: 'LEADERBOARD', href: '/leaderboard/leaderboard' as const, icon: figmaSharedIcons.navLeaderboard },
  { key: 'advocacy' as const, label: 'ADVOCACY', href: '/advocacy/advocacy' as const, icon: figmaSharedIcons.navAdvocacy }
];
