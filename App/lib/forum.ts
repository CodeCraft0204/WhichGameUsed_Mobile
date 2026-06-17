import { supabase } from '@/lib/supabase';
import { resolveProfileAvatarUrl } from '@/lib/profile';

export type ForumSort = 'newest' | 'hottest' | 'all_time';

export type ForumTopicSummary = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_locked: boolean;
  created_at: string;
  thread_count: number;
  last_activity_at: string | null;
};

export type ForumThreadSummary = {
  id: string;
  topic_id: string;
  author_id: string | null;
  title: string;
  body: string;
  status: string;
  is_locked: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  topic_title: string;
  topic_slug: string;
  author_display_name: string | null;
  author_username: string | null;
  author_avatar_url: string | null;
  comment_count: number;
  vote_score: number;
  saved?: boolean;
};

export type ForumComment = {
  id: string;
  thread_id: string;
  author_id: string | null;
  parent_comment_id: string | null;
  body: string;
  status: string;
  created_at: string;
  updated_at: string;
  author_display_name: string | null;
  author_username: string | null;
  author_avatar_url: string | null;
};

export type ForumThreadDetail = ForumThreadSummary & {
  comments: ForumComment[];
  user_vote: 'upvote' | 'downvote' | null;
};

type ProfileEmbed = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

function normalizeProfileEmbed(profiles: unknown): ProfileEmbed | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return (profiles[0] as ProfileEmbed | undefined) ?? null;
  return profiles as ProfileEmbed;
}

function mapThreadRow(row: ForumThreadSummary): ForumThreadSummary {
  return {
    ...row,
    author_avatar_url: resolveProfileAvatarUrl(row.author_avatar_url)
  };
}

function sortThreads(items: ForumThreadSummary[], sort: ForumSort): ForumThreadSummary[] {
  const pinned = items.filter((row) => row.is_pinned);
  const rest = items.filter((row) => !row.is_pinned);
  const ordered =
    sort === 'hottest'
      ? [...rest].sort((a, b) => b.comment_count - a.comment_count || b.vote_score - a.vote_score)
      : sort === 'all_time'
        ? [...rest].sort((a, b) => b.vote_score - a.vote_score || b.comment_count - a.comment_count)
        : [...rest].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
  return [...pinned, ...ordered];
}

export async function listForumTopics(): Promise<{
  items: ForumTopicSummary[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('forum_topic_summary')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) return { items: [], error: error.message };
  return { items: (data ?? []) as ForumTopicSummary[], error: null };
}

export async function listForumThreads(opts?: {
  topicSlug?: string;
  sort?: ForumSort;
  limit?: number;
}): Promise<{ items: ForumThreadSummary[]; error: string | null }> {
  const sort = opts?.sort ?? 'newest';
  const limit = opts?.limit ?? 25;

  let q = supabase.from('forum_threads_enriched').select('*').limit(limit * 3);

  if (opts?.topicSlug) {
    q = q.eq('topic_slug', opts.topicSlug);
  }

  const { data, error } = await q;
  if (error) return { items: [], error: error.message };

  let items = (data ?? []).map((row) => mapThreadRow(row as ForumThreadSummary));
  items = sortThreads(items, sort).slice(0, limit);

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (userId && items.length > 0) {
    const threadIds = items.map((row) => row.id);
    const { data: saves } = await supabase
      .from('forum_thread_saves')
      .select('thread_id')
      .eq('user_id', userId)
      .in('thread_id', threadIds);
    const saved = new Set((saves ?? []).map((row) => row.thread_id));
    items = items.map((row) => ({ ...row, saved: saved.has(row.id) }));
  }

  return { items, error: null };
}

export async function getForumThread(threadId: string): Promise<{
  thread: ForumThreadDetail | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('forum_threads_enriched')
    .select('*')
    .eq('id', threadId)
    .maybeSingle();
  if (error) return { thread: null, error: error.message };
  if (!data) return { thread: null, error: 'Thread not found.' };

  const { data: comments, error: commentsError } = await supabase
    .from('forum_comments')
    .select(
      `id, thread_id, author_id, parent_comment_id, body, status, created_at, updated_at,
      profiles:author_id (display_name, username, avatar_url)`
    )
    .eq('thread_id', threadId)
    .is('deleted_at', null)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (commentsError) return { thread: null, error: commentsError.message };

  const mappedComments: ForumComment[] = (comments ?? []).map((row) => {
    const profile = normalizeProfileEmbed(row.profiles);
    return {
      id: row.id,
      thread_id: row.thread_id,
      author_id: row.author_id,
      parent_comment_id: row.parent_comment_id,
      body: row.body,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author_display_name: profile?.display_name ?? null,
      author_username: profile?.username ?? null,
      author_avatar_url: resolveProfileAvatarUrl(profile?.avatar_url)
    };
  });

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  let user_vote: 'upvote' | 'downvote' | null = null;
  let saved = false;

  if (userId) {
    const [{ data: vote }, { data: save }] = await Promise.all([
      supabase
        .from('votes')
        .select('value')
        .eq('user_id', userId)
        .eq('target_type', 'forum_thread')
        .eq('target_id', threadId)
        .maybeSingle(),
      supabase
        .from('forum_thread_saves')
        .select('id')
        .eq('user_id', userId)
        .eq('thread_id', threadId)
        .maybeSingle()
    ]);
    user_vote = (vote?.value as 'upvote' | 'downvote' | undefined) ?? null;
    saved = Boolean(save);
  }

  return {
    thread: {
      ...mapThreadRow(data as ForumThreadSummary),
      comments: mappedComments,
      user_vote,
      saved
    },
    error: null
  };
}

export async function createForumThread(input: {
  topicId: string;
  title: string;
  body: string;
}): Promise<{ threadId: string | null; error: string | null }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { threadId: null, error: 'Sign in required.' };

  const { data, error } = await supabase
    .from('forum_threads')
    .insert({
      topic_id: input.topicId,
      author_id: userData.user.id,
      title: input.title.trim(),
      body: input.body.trim()
    })
    .select('id')
    .single();

  if (error) return { threadId: null, error: error.message };
  return { threadId: data.id, error: null };
}

export async function createForumComment(input: {
  threadId: string;
  body: string;
  parentCommentId?: string | null;
}): Promise<{ commentId: string | null; error: string | null }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { commentId: null, error: 'Sign in required.' };

  const { data, error } = await supabase
    .from('forum_comments')
    .insert({
      thread_id: input.threadId,
      author_id: userData.user.id,
      body: input.body.trim(),
      parent_comment_id: input.parentCommentId ?? null
    })
    .select('id')
    .single();

  if (error) return { commentId: null, error: error.message };
  return { commentId: data.id, error: null };
}

export async function voteForumThread(
  threadId: string,
  value: 'upvote' | 'downvote'
): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: 'Sign in required.' };

  const { error } = await supabase.from('votes').upsert(
    {
      user_id: userData.user.id,
      target_type: 'forum_thread',
      target_id: threadId,
      value
    },
    { onConflict: 'user_id,target_type,target_id' }
  );

  return { error: error?.message ?? null };
}

export async function toggleForumThreadSave(threadId: string): Promise<{
  saved: boolean;
  error: string | null;
}> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { saved: false, error: 'Sign in required.' };

  const { data: existing } = await supabase
    .from('forum_thread_saves')
    .select('id')
    .eq('user_id', userData.user.id)
    .eq('thread_id', threadId)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase.from('forum_thread_saves').delete().eq('id', existing.id);
    return { saved: false, error: error?.message ?? null };
  }

  const { error } = await supabase.from('forum_thread_saves').insert({
    user_id: userData.user.id,
    thread_id: threadId
  });
  return { saved: true, error: error?.message ?? null };
}

export async function reportForumContent(input: {
  targetType: 'forum_thread' | 'forum_comment';
  targetId: string;
  reason: string;
}): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: 'Sign in required.' };

  const { error } = await supabase.from('moderation_reports').insert({
    reporter_id: userData.user.id,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason.trim()
  });

  return { error: error?.message ?? null };
}

export async function searchForumThreads(
  query: string,
  limit = 20
): Promise<{ items: ForumThreadSummary[]; error: string | null }> {
  const trimmed = query.trim();
  if (!trimmed) return { items: [], error: null };

  const { data, error } = await supabase
    .from('forum_threads_enriched')
    .select('*')
    .or(`title.ilike.%${trimmed}%,body.ilike.%${trimmed}%`)
    .limit(limit);

  if (error) return { items: [], error: error.message };
  return {
    items: (data ?? []).map((row) => mapThreadRow(row as ForumThreadSummary)),
    error: null
  };
}
