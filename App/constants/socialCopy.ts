import type { MessagePermission, MessageTopic } from '@/lib/social';

export const socialCopy = {
  follow: 'FOLLOW',
  followingAction: 'FOLLOWING',
  message: 'MESSAGE',
  followers: 'Followers',
  followingLabel: 'Following',
  inbox: {
    title: 'MESSAGES',
    subtitle: 'PRIVATE COLLECTOR CONVERSATIONS.',
    description: 'Ask about authentication, research, or collecting.',
    emptyTitle: 'No messages yet',
    emptyBody: 'Start a conversation from a collector profile.',
    signInTitle: 'Sign in to view messages',
    signInBody: 'Message other collectors about auth, research, and cards.'
  },
  compose: {
    title: 'ASK COLLECTOR',
    subtitle: 'START A PRIVATE CONVERSATION.',
    topicLabel: 'Topic',
    messageLabel: 'Your message',
    messagePlaceholder: 'Ask about evidence, authentication, or research…',
    send: 'SEND MESSAGE',
    sending: 'SENDING…',
    topicRequired: 'Choose a topic.',
    bodyRequired: 'Write a message before sending.',
    notAllowed: 'This collector is not accepting messages right now.'
  },
  conversation: {
    placeholder: 'Write a reply…',
    send: 'Send',
    block: 'Block collector',
    report: 'Report conversation',
    blockConfirm: 'Block this collector? You will unfollow each other and stop receiving messages.',
    reportPrompt: 'Describe the issue with this conversation.',
    reportSent: 'Report submitted. Our team will review it.'
  },
  followingLists: {
    followersTitle: 'FOLLOWERS',
    followingTitle: 'FOLLOWING',
    emptyFollowers: 'No followers yet.',
    emptyFollowing: 'Not following anyone yet.',
    discoverHint: 'Find collectors on the leaderboard or in Discussion.'
  },
  profile: {
    recentDiscussions: 'Recent discussions',
    viewThread: 'View thread',
    noDiscussions: 'No public forum threads yet.'
  },
  notifications: {
    title: 'SOCIAL ACTIVITY',
    subtitle: 'FOLLOWS & MESSAGES.',
    markAllRead: 'Mark all read',
    empty: 'No recent social activity.',
    newFollower: 'started following you',
    newMessage: 'sent you a message'
  },
  settings: {
    section: 'SOCIAL & MESSAGING',
    whoCanMessage: 'Who can message me',
    whoCanMessageHint: 'Control who can start a private conversation.',
    showForumActivity: 'Show forum activity on profile',
    showForumActivityHint: 'Display your recent discussion threads on your public profile.',
    messagesLink: 'Messages inbox',
    followingLink: 'Collectors you follow',
    notificationsLink: 'Social notifications'
  }
} as const;

export const messageTopicOptions: Array<{ value: MessageTopic; label: string; hint: string }> = [
  {
    value: 'authentication',
    label: 'Authentication',
    hint: 'Questions about verifying game-used cards or evidence.'
  },
  {
    value: 'research',
    label: 'Research',
    hint: 'Provenance, sets, or catalog research help.'
  },
  {
    value: 'general',
    label: 'General',
    hint: 'Other collecting questions or collaboration.'
  }
];

export const messagePermissionOptions: Array<{
  value: MessagePermission;
  label: string;
  hint: string;
}> = [
  {
    value: 'everyone',
    label: 'Everyone',
    hint: 'Any signed-in collector can message you.'
  },
  {
    value: 'followers_only',
    label: 'Followers only',
    hint: 'Only collectors you follow can start a conversation.'
  },
  {
    value: 'nobody',
    label: 'Nobody',
    hint: 'Disable new incoming messages.'
  }
];

export function messageTopicLabel(topic: MessageTopic): string {
  return messageTopicOptions.find((opt) => opt.value === topic)?.label ?? topic;
}
