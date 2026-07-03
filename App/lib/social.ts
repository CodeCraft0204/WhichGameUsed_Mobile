import { supabase } from '@/lib/supabase';
import { displayName, resolveProfileAvatarUrl } from '@/lib/profile';

export type MessagePermission = 'everyone' | 'followers_only' | 'nobody';
export type MessageTopic = 'authentication' | 'research' | 'general';

export type SocialProfileSummary = {
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  followedAt: string;
};

export type FollowCounts = {
  followers: number;
  following: number;
};

export type InboxConversation = {
  conversationId: string;
  topic: MessageTopic;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  peerId: string;
  peerDisplayName: string;
  peerUsername: string | null;
  peerAvatarUrl: string | null;
};

export type CollectorMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  senderDisplayName: string;
  senderAvatarUrl: string | null;
  isOwn: boolean;
};

export type SocialNotification = {
  id: string;
  type: 'new_follower' | 'new_message';
  actorId: string | null;
  conversationId: string | null;
  readAt: string | null;
  createdAt: string;
  actorDisplayName: string | null;
  actorAvatarUrl: string | null;
};

function mapSocialProfile(row: {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  followed_at: string;
}): SocialProfileSummary {
  const profile = {
    display_name: row.display_name,
    username: row.username
  };
  return {
    userId: row.user_id,
    displayName: displayName(profile),
    username: row.username,
    avatarUrl: resolveProfileAvatarUrl(row.avatar_url),
    followedAt: row.followed_at
  };
}

export async function fetchFollowCounts(userId: string): Promise<{
  counts: FollowCounts;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('collector_follow_counts', {
    p_user_id: userId
  });

  if (error) return { counts: { followers: 0, following: 0 }, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  return {
    counts: {
      followers: Number(row?.followers_count ?? 0),
      following: Number(row?.following_count ?? 0)
    },
    error: null
  };
}

export async function checkIsFollowing(followingId: string): Promise<{
  isFollowing: boolean;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('collector_is_following', {
    p_following_id: followingId
  });
  if (error) return { isFollowing: false, error: error.message };
  return { isFollowing: Boolean(data), error: null };
}

export async function toggleFollow(followingId: string): Promise<{
  isFollowing: boolean;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('collector_toggle_follow', {
    p_following_id: followingId
  });
  if (error) return { isFollowing: false, error: error.message };
  return { isFollowing: Boolean(data), error: null };
}

export async function listFollowers(userId: string): Promise<{
  items: SocialProfileSummary[];
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('collector_list_followers', {
    p_user_id: userId,
    p_limit: 100
  });
  if (error) return { items: [], error: error.message };
  return {
    items: (data ?? []).map((row: Parameters<typeof mapSocialProfile>[0]) => mapSocialProfile(row)),
    error: null
  };
}

export async function listFollowing(userId: string): Promise<{
  items: SocialProfileSummary[];
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('collector_list_following', {
    p_user_id: userId,
    p_limit: 100
  });
  if (error) return { items: [], error: error.message };
  return {
    items: (data ?? []).map((row: Parameters<typeof mapSocialProfile>[0]) => mapSocialProfile(row)),
    error: null
  };
}

export async function canMessageUser(recipientId: string): Promise<{
  allowed: boolean;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('collector_can_message', {
    p_recipient_id: recipientId
  });
  if (error) return { allowed: false, error: error.message };
  return { allowed: Boolean(data), error: null };
}

export async function blockUser(blockedId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('collector_block_user', { p_blocked_id: blockedId });
  return { error: error?.message ?? null };
}

export async function unblockUser(blockedId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('collector_unblock_user', { p_blocked_id: blockedId });
  return { error: error?.message ?? null };
}

export async function reportCollectorUser(
  userId: string,
  reason: string
): Promise<{ error: string | null }> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: 'Sign in required.' };

  const { error } = await supabase.from('moderation_reports').insert({
    reporter_id: authData.user.id,
    target_type: 'collector_user',
    target_id: userId,
    reason: reason.trim()
  });
  return { error: error?.message ?? null };
}

export async function reportCollectorMessage(
  messageId: string,
  reason: string
): Promise<{ error: string | null }> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: 'Sign in required.' };

  const { error } = await supabase.from('moderation_reports').insert({
    reporter_id: authData.user.id,
    target_type: 'collector_message',
    target_id: messageId,
    reason: reason.trim()
  });
  return { error: error?.message ?? null };
}

export async function startConversation(opts: {
  recipientId: string;
  topic: MessageTopic;
  body: string;
}): Promise<{ conversationId: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('collector_start_conversation', {
    p_recipient_id: opts.recipientId,
    p_topic: opts.topic,
    p_body: opts.body.trim()
  });
  if (error) return { conversationId: null, error: error.message };
  return { conversationId: data as string, error: null };
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<{ messageId: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('collector_send_message', {
    p_conversation_id: conversationId,
    p_body: body.trim()
  });
  if (error) return { messageId: null, error: error.message };
  return { messageId: data as string, error: null };
}

export async function listInboxConversations(): Promise<{
  items: InboxConversation[];
  error: string | null;
}> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { items: [], error: 'Sign in required.' };

  const { data, error } = await supabase
    .from('collector_inbox_enriched')
    .select('*')
    .eq('viewer_id', userId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) return { items: [], error: error.message };

  return {
    items: (data ?? []).map((row) => ({
      conversationId: row.conversation_id,
      topic: row.topic as MessageTopic,
      lastMessageAt: row.last_message_at,
      lastMessagePreview: row.last_message_preview,
      unreadCount: Number(row.unread_count ?? 0),
      peerId: row.peer_id,
      peerDisplayName: displayName({
        display_name: row.peer_display_name,
        username: row.peer_username
      }),
      peerUsername: row.peer_username,
      peerAvatarUrl: resolveProfileAvatarUrl(row.peer_avatar_url)
    })),
    error: null
  };
}

export async function listConversationMessages(conversationId: string): Promise<{
  items: CollectorMessage[];
  error: string | null;
}> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { items: [], error: 'Sign in required.' };

  const { data, error } = await supabase
    .from('collector_messages')
    .select('id, sender_id, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return { items: [], error: error.message };

  const senderIds = [
    ...new Set((data ?? []).map((row) => row.sender_id).filter(Boolean))
  ] as string[];

  const profileById = new Map<string, { display_name: string | null; username: string | null; avatar_url: string | null }>();
  if (senderIds.length > 0) {
    const { data: profiles } = await supabase.rpc('forum_author_profiles', {
      author_ids: senderIds
    });
    for (const profile of profiles ?? []) {
      profileById.set(profile.id, profile);
    }
  }

  return {
    items: (data ?? []).map((row) => {
      const profile = profileById.get(row.sender_id);
      return {
        id: row.id,
        senderId: row.sender_id,
        body: row.body,
        createdAt: row.created_at,
        senderDisplayName: displayName(profile ?? null),
        senderAvatarUrl: resolveProfileAvatarUrl(profile?.avatar_url),
        isOwn: row.sender_id === userId
      };
    }),
    error: null
  };
}

export async function markConversationRead(conversationId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('collector_mark_conversation_read', {
    p_conversation_id: conversationId
  });
  return { error: error?.message ?? null };
}

export async function fetchUnreadSocialCount(): Promise<{ count: number; error: string | null }> {
  const { data, error } = await supabase.rpc('collector_unread_social_count');
  if (error) return { count: 0, error: error.message };
  return { count: Number(data ?? 0), error: null };
}

export async function listSocialNotifications(limit = 30): Promise<{
  items: SocialNotification[];
  error: string | null;
}> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { items: [], error: 'Sign in required.' };

  const { data, error } = await supabase
    .from('collector_social_notifications')
    .select('id, type, actor_id, conversation_id, read_at, created_at')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { items: [], error: error.message };

  const actorIds = [
    ...new Set((data ?? []).map((row) => row.actor_id).filter(Boolean))
  ] as string[];

  const profileById = new Map<string, { display_name: string | null; username: string | null; avatar_url: string | null }>();
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase.rpc('forum_author_profiles', { author_ids: actorIds });
    for (const profile of profiles ?? []) {
      profileById.set(profile.id, profile);
    }
  }

  return {
    items: (data ?? []).map((row) => {
      const profile = row.actor_id ? profileById.get(row.actor_id) : null;
      return {
        id: row.id,
        type: row.type as SocialNotification['type'],
        actorId: row.actor_id,
        conversationId: row.conversation_id,
        readAt: row.read_at,
        createdAt: row.created_at,
        actorDisplayName: profile ? displayName(profile) : null,
        actorAvatarUrl: resolveProfileAvatarUrl(profile?.avatar_url)
      };
    }),
    error: null
  };
}

export async function markAllSocialNotificationsRead(): Promise<{ error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'Sign in required.' };

  const { error } = await supabase
    .from('collector_social_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userData.user.id)
    .is('read_at', null);

  return { error: error?.message ?? null };
}

export async function listUserForumThreads(
  authorId: string,
  limit = 5
): Promise<{
  items: Array<{
    id: string;
    title: string;
    topicSlug: string;
    topicTitle: string;
    createdAt: string;
    commentCount: number;
    voteScore: number;
  }>;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('forum_threads_enriched')
    .select('id, title, topic_slug, topic_title, created_at, comment_count, vote_score')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { items: [], error: error.message };
  return {
    items: (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      topicSlug: row.topic_slug,
      topicTitle: row.topic_title,
      createdAt: row.created_at,
      commentCount: Number(row.comment_count ?? 0),
      voteScore: Number(row.vote_score ?? 0)
    })),
    error: null
  };
}
