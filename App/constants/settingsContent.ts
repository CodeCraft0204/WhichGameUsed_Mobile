export const settingsCopy = {
  title: 'SETTINGS',
  subtitle: 'ACCOUNT & PREFERENCES.',
  description: 'Privacy, security, support, and app preferences.',
  sections: {
    privacy: 'PRIVACY',
    account: 'ACCOUNT',
    legal: 'LEGAL & SUPPORT',
    app: 'APP'
  },
  privacy: {
    publicProfile: 'Public profile',
    publicProfileHint: 'Allow others to view your profile and contributions.',
    leaderboard: 'Leaderboard eligible',
    leaderboardHint: 'Include your activity in monthly rankings and prizes.'
  },
  social: {
    section: 'SOCIAL & MESSAGING',
    messages: 'Messages inbox',
    following: 'Collectors you follow',
    notifications: 'Notifications',
    pushMessages: 'Push alerts for messages',
    pushMessagesHint: 'Notify immediately when someone sends you a direct message.',
    pushFollows: 'Push alerts for new followers',
    pushFollowsHint: 'Notify when another collector follows you.',
    whoCanMessage: 'Who can message me',
    whoCanMessageHint: 'Control who can start a private conversation.',
    showForumActivity: 'Show forum activity on profile',
    showForumActivityHint: 'Display your recent discussion threads on your public profile.',
    presenceStatus: 'Chat status',
    presenceStatusHint: 'Choose how you appear to other collectors in messaging.'
  },
  account: {
    editProfile: 'Edit profile',
    email: 'Email',
    memberSince: 'Member since',
    signInMethod: 'Sign-in method',
    changePassword: 'Change password',
    signOut: 'Sign out'
  },
  legal: {
    communityStandards: 'Community standards',
    contactSupport: 'Contact support'
  },
  app: {
    version: 'App version',
    versionValue: '1.0.0'
  },
  actions: {
    saved: 'Settings saved.',
    signOutConfirm: 'Sign out of Which Game Used?'
  }
} as const;
