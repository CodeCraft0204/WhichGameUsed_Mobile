import { getUserStanding } from '@/lib/leaderboard';
import { displayName, resolveProfileAvatarUrl } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

export type MessageTopic = 'authentication' | 'research' | 'general';

export type Conversation = {
  id: string;
  topic: MessageTopic;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  archivedAt: string | null;
  peerId: string;
  peerDisplayName: string;
  peerUsername: string | null;
  peerAvatarUrl: string | null;
  peerRank: number | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  senderDisplayName: string;
  senderAvatarUrl: string | null;
  isOwn: boolean;
};

type InboxRow = {
  conversation_id: string;
  topic: MessageTopic;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number | null;
  archived_at: string | null;
  peer_id: string;
  peer_display_name: string | null;
  peer_username: string | null;
  peer_avatar_url: string | null;
};

async function peerRank(userId: string): Promise<number | null> {
  const { entry } = await getUserStanding(userId, 'month');
  return entry?.rank ?? null;
}

function mapInboxRow(row: InboxRow, rank: number | null): Conversation {
  return {
    id: row.conversation_id,
    topic: row.topic,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    unreadCount: Number(row.unread_count ?? 0),
    archivedAt: row.archived_at,
    peerId: row.peer_id,
    peerDisplayName: displayName({
      display_name: row.peer_display_name,
      username: row.peer_username
    }),
    peerUsername: row.peer_username,
    peerAvatarUrl: resolveProfileAvatarUrl(row.peer_avatar_url),
    peerRank: rank
  };
}

export async function listConversations(opts?: {
  includeArchived?: boolean;
}): Promise<{ items: Conversation[]; error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { items: [], error: 'Sign in required.' };

  const { data, error } = await supabase
    .from('collector_inbox_enriched')
    .select('*')
    .eq('viewer_id', userId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) return { items: [], error: error.message };

  const rows = (data ?? []) as InboxRow[];
  const visible = opts?.includeArchived
    ? rows
    : rows.filter((row) => !row.archived_at);

  const items = await Promise.all(
    visible.map(async (row) => mapInboxRow(row, await peerRank(row.peer_id)))
  );

  return { items, error: null };
}

export async function getConversation(
  conversationId: string
): Promise<{ conversation: Conversation | null; error: string | null }> {
  const { items, error } = await listConversations({ includeArchived: true });
  if (error) return { conversation: null, error };
  return {
    conversation: items.find((row) => row.id === conversationId) ?? null,
    error: null
  };
}

export async function searchConversations(
  query: string
): Promise<{ items: Conversation[]; error: string | null }> {
  const { items, error } = await listConversations();
  if (error) return { items: [], error };

  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return { items, error: null };

  return {
    items: items.filter((row) => {
      const haystack = [row.peerDisplayName, row.peerUsername ?? '', row.lastMessagePreview ?? '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(trimmed);
    }),
    error: null
  };
}

export async function getOrCreateDirectConversation(
  otherUserId: string
): Promise<{ conversationId: string | null; error: string | null }> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { conversationId: null, error: 'Sign in required.' };
  if (authData.user.id === otherUserId) {
    return { conversationId: null, error: 'You cannot message yourself.' };
  }

  const { data, error } = await supabase.rpc('collector_get_or_create_direct_conversation', {
    p_other_user_id: otherUserId
  });

  if (error) return { conversationId: null, error: error.message };
  return { conversationId: data as string, error: null };
}

export async function listMessages(
  conversationId: string
): Promise<{ items: Message[]; error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { items: [], error: 'Sign in required.' };

  const { data, error } = await supabase
    .from('collector_messages')
    .select(
      'id, conversation_id, sender_id, body, created_at, edited_at, deleted_at, attachment_url, attachment_type'
    )
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) return { items: [], error: error.message };

  const senderIds = [
    ...new Set((data ?? []).map((row) => row.sender_id).filter(Boolean))
  ] as string[];

  const profileById = new Map<
    string,
    { display_name: string | null; username: string | null; avatar_url: string | null }
  >();

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
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        body: row.body,
        createdAt: row.created_at,
        editedAt: row.edited_at,
        deletedAt: row.deleted_at,
        attachmentUrl: row.attachment_url,
        attachmentType: row.attachment_type,
        senderDisplayName: displayName(profile ?? null),
        senderAvatarUrl: resolveProfileAvatarUrl(profile?.avatar_url),
        isOwn: row.sender_id === userId
      };
    }),
    error: null
  };
}

export async function sendMessage(
  conversationId: string,
  body: string,
  _attachment?: { url: string; type: string }
): Promise<{ messageId: string | null; error: string | null }> {
  const trimmed = body.trim();
  if (!trimmed) return { messageId: null, error: 'Message cannot be empty.' };

  const { data, error } = await supabase.rpc('collector_send_message', {
    p_conversation_id: conversationId,
    p_body: trimmed
  });

  if (error) return { messageId: null, error: error.message };
  return { messageId: data as string, error: null };
}

export async function startConversationWithMessage(opts: {
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

export async function markConversationRead(
  conversationId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('collector_mark_conversation_read', {
    p_conversation_id: conversationId
  });
  return { error: error?.message ?? null };
}

export async function archiveConversation(
  conversationId: string,
  archived = true
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('collector_archive_conversation', {
    p_conversation_id: conversationId,
    p_archived: archived
  });
  return { error: error?.message ?? null };
}

export async function canMessageUser(
  recipientId: string
): Promise<{ allowed: boolean; error: string | null }> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { allowed: false, error: 'Sign in required.' };
  if (authData.user.id === recipientId) return { allowed: false, error: null };

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

export async function reportMessage(
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

// Backward-compatible aliases used elsewhere in the app.
export type InboxConversation = Conversation & { conversationId: string };
export type CollectorMessage = Message;

export async function listInboxConversations(): Promise<{
  items: InboxConversation[];
  error: string | null;
}> {
  const { items, error } = await listConversations();
  return {
    items: items.map((row) => ({ ...row, conversationId: row.id })),
    error
  };
}

export async function listConversationMessages(conversationId: string): Promise<{
  items: CollectorMessage[];
  error: string | null;
}> {
  return listMessages(conversationId);
}

export async function startConversation(opts: {
  recipientId: string;
  topic: MessageTopic;
  body: string;
}): Promise<{ conversationId: string | null; error: string | null }> {
  return startConversationWithMessage(opts);
}

export async function reportCollectorMessage(
  messageId: string,
  reason: string
): Promise<{ error: string | null }> {
  return reportMessage(messageId, reason);
}
