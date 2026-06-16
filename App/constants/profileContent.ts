export const profileCopy = {
  title: 'MY PROFILE',
  subtitle: 'YOUR COLLECTOR IDENTITY.',
  description: 'Update how you appear across the community. Account and privacy settings live in Settings.',
  sections: {
    about: 'ABOUT YOU'
  },
  links: {
    openSettings: 'Open settings'
  },
  fields: {
    displayName: 'Display name',
    displayNameHint: 'Shown on posts and your public profile.',
    username: 'Username',
    usernameHint: 'Lowercase letters, numbers, and underscores only.',
    about: 'Bio',
    aboutHint: 'A short note about your collecting focus.',
    aboutPlaceholder: 'Game-used patches, vintage baseball, provenance research…',
    location: 'Location',
    locationHint: 'City or region — optional.',
    locationPlaceholder: 'Chicago, IL',
    email: 'Email'
  },
  avatar: {
    change: 'Change photo',
    remove: 'Remove photo',
    uploading: 'Uploading…'
  },
  actions: {
    save: 'SAVE CHANGES',
    saving: 'SAVING…',
    saved: 'Profile updated.',
    signOut: 'SIGN OUT',
    signingOut: 'SIGNING OUT…'
  },
  validation: {
    username: 'Username must be 3–24 characters (letters, numbers, underscores).'
  }
} as const;
