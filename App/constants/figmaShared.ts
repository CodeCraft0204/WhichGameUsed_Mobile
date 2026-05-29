/** Icons reused across hub screens (Return / Education / Most Wanted / Leaderboard / Advocacy). */
export const figmaSharedIcons = {
  utilitySearch: require('@/assets/figma/advocacy/utility_search.png'),
  utilityProfile: require('@/assets/figma/advocacy/utility_profile.png'),
  utilitySettings: require('@/assets/figma/advocacy/utility_settings.png'),
  titleBrush: require('@/assets/figma/advocacy/title_brush.png'),
  sectionChevron: require('@/assets/figma/advocacy/section_chevron.png'),
  navReturn: require('@/assets/figma/advocacy/nav_return.png'),
  navEducation: require('@/assets/figma/advocacy/nav_education.png'),
  navMostwanted: require('@/assets/figma/advocacy/nav_mostwanted.png'),
  navLeaderboard: require('@/assets/figma/advocacy/nav_leaderboard.png'),
  navAdvocacy: require('@/assets/figma/advocacy/nav_advocacy.png')
} as const;

export type HubNavKey = 'return' | 'education' | 'mostwanted' | 'leaderboard' | 'advocacy';

export const hubNavItems = [
  { key: 'return' as const, label: 'RETURN', href: '/database/database' as const, icon: figmaSharedIcons.navReturn },
  { key: 'education' as const, label: 'EDUCATION', href: '/education/education' as const, icon: figmaSharedIcons.navEducation },
  { key: 'mostwanted' as const, label: 'MOST WANTED', href: '/mostwanted/mostwanted' as const, icon: figmaSharedIcons.navMostwanted },
  { key: 'leaderboard' as const, label: 'LEADERBOARD', href: '/leaderboard/leaderboard' as const, icon: figmaSharedIcons.navLeaderboard },
  { key: 'advocacy' as const, label: 'ADVOCACY', href: '/advocacy/advocacy' as const, icon: figmaSharedIcons.navAdvocacy }
];
