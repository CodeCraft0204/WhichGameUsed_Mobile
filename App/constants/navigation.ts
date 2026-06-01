import type { Href } from 'expo-router';

export const primaryNav: Array<{ label: string; href: Href }> = [
  { label: 'Sign In', href: '/sign-in/sign-in' },
  { label: 'Sign Up', href: '/sign-up/sign-up' },
  { label: 'Password Reset', href: '/password-reset/password-reset' },
  { label: 'Database', href: '/database/database' },
  { label: 'Authenticate', href: '/authenticate/authenticate' },
  { label: 'Discussion', href: '/discussion/discussion' },
  { label: 'Education', href: '/education/education' },
  { label: 'MostWanted', href: '/mostwanted/mostwanted' },
  { label: 'Leaderboard', href: '/leaderboard/leaderboard' },
  { label: 'Advocacy', href: '/advocacy/advocacy' },
  { label: 'Camera', href: '/camera/camera' }
];
