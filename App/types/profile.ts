export type AppRole = 'user' | 'admin' | 'super_admin';

export type Profile = {
  id: string;
  role: AppRole;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  about: string | null;
  location_text: string | null;
};

export type MessagePermission = 'everyone' | 'followers_only' | 'nobody';

/** Full profile row for the signed-in user's settings screen. */
export type MyProfile = Profile & {
  is_public: boolean;
  leaderboard_eligible: boolean;
  message_permission: MessagePermission;
  show_forum_activity_on_profile: boolean;
  notify_push_messages: boolean;
  notify_push_follows: boolean;
};

export type MyProfileUpdate = {
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  about?: string | null;
  location_text?: string | null;
  is_public?: boolean;
  leaderboard_eligible?: boolean;
  message_permission?: MessagePermission;
  show_forum_activity_on_profile?: boolean;
  notify_push_messages?: boolean;
  notify_push_follows?: boolean;
};
