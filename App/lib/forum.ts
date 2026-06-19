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
  total_claps: number;
  clap_diversity_score: number;
  user_clap_count: number;
  vote_score: number;
  user_vote: 'upvote' | 'downvote' | null;
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
};

type ProfileEmbed = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

function mapThreadRow(row: ForumThreadSummary): ForumThreadSummary {
  const userVote = row.user_vote;
  const normalizedVote =
    userVote === 'upvote' || userVote === 'downvote' ? userVote : null;

  return {
    ...row,
    total_claps: Number(row.total_claps ?? 0),
    clap_diversity_score: Number(row.clap_diversity_score ?? 0),
    user_clap_count: Number(row.user_clap_count ?? 0),
    vote_score: Number(row.vote_score ?? 0),
    user_vote: normalizedVote,
    author_avatar_url: resolveProfileAvatarUrl(row.author_avatar_url)
  };
}

function escapeIlike(term: string): string {
  return term.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

function postgrestOrIlikeValue(term: string): string {
  const pattern = `%${escapeIlike(term.trim())}%`;
  return `"${pattern.replace(/"/g, '""')}"`;
}

async function attachSavedThreads(
  items: ForumThreadSummary[]
): Promise<ForumThreadSummary[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId || items.length === 0) return items;

  const threadIds = items.map((row) => row.id);
  const { data: saves } = await supabase
    .from('forum_thread_saves')
    .select('thread_id')
    .eq('user_id', userId)
    .in('thread_id', threadIds);
  const saved = new Set((saves ?? []).map((row) => row.thread_id));
  return items.map((row) => ({ ...row, saved: saved.has(row.id) }));
}

async function applyFeedFilters(items: ForumThreadSummary[]): Promise<ForumThreadSummary[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId || items.length === 0) return items;

  const { data: filters, error } = await supabase
    .from('forum_feed_filters')
    .select('filter_type, filter_target_id')
    .eq('user_id', userId);

  if (error || !filters?.length) return items;

  const hiddenThreads = new Set<string>();
  const hiddenTopics = new Set<string>();
  const hiddenAuthors = new Set<string>();

  for (const row of filters) {
    if (row.filter_type === 'thread') hiddenThreads.add(row.filter_target_id);
    if (row.filter_type === 'topic') hiddenTopics.add(row.filter_target_id);
    if (row.filter_type === 'author') hiddenAuthors.add(row.filter_target_id);
  }

  return items.filter(
    (thread) =>
      !hiddenThreads.has(thread.id) &&
      !hiddenTopics.has(thread.topic_id) &&
      (!thread.author_id || !hiddenAuthors.has(thread.author_id))
  );
}

function sortThreads(items: ForumThreadSummary[], sort: ForumSort): ForumThreadSummary[] {
  const pinned = items.filter((row) => row.is_pinned);
  const rest = items.filter((row) => !row.is_pinned);
  const ordered =
    sort === 'hottest'
      ? [...rest].sort(
          (a, b) =>
            b.clap_diversity_score - a.clap_diversity_score ||
            b.comment_count - a.comment_count ||
            b.total_claps - a.total_claps
        )
      : sort === 'all_time'
        ? [...rest].sort(
            (a, b) =>
              b.clap_diversity_score - a.clap_diversity_score ||
              b.total_claps - a.total_claps ||
              b.comment_count - a.comment_count
          )
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
  items = sortThreads(items, sort).slice(0, limit * 2);
  items = await applyFeedFilters(items);
  items = items.slice(0, limit);
  items = await attachSavedThreads(items);

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
    .select('id, thread_id, author_id, parent_comment_id, body, status, created_at, updated_at')
    .eq('thread_id', threadId)
    .is('deleted_at', null)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (commentsError) return { thread: null, error: commentsError.message };

  const authorIds = [
    ...new Set(
      (comments ?? [])
        .map((row) => row.author_id)
        .filter((authorId): authorId is string => Boolean(authorId))
    )
  ];

  const authorById = new Map<string, ProfileEmbed>();
  if (authorIds.length > 0) {
    const { data: authors } = await supabase.rpc('forum_author_profiles', {
      author_ids: authorIds
    });
    for (const author of authors ?? []) {
      authorById.set(author.id, {
        display_name: author.display_name,
        username: author.username,
        avatar_url: author.avatar_url
      });
    }
  }

  const mappedComments: ForumComment[] = (comments ?? []).map((row) => {
    const profile = row.author_id ? authorById.get(row.author_id) : null;
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
  let saved = false;

  if (userId) {
    const { data: save } = await supabase
      .from('forum_thread_saves')
      .select('id')
      .eq('user_id', userId)
      .eq('thread_id', threadId)
      .maybeSingle();
    saved = Boolean(save);
  }

  return {
    thread: {
      ...mapThreadRow(data as ForumThreadSummary),
      comments: mappedComments,
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
): Promise<{
  error: string | null;
  user_vote: 'upvote' | 'downvote' | null;
  vote_score: number | null;
}> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: 'Sign in required.', user_vote: null, vote_score: null };
  }

  const { data, error } = await supabase.rpc('cast_forum_thread_vote', {
    p_thread_id: threadId,
    p_action: value
  });

  if (error) {
    return { error: error.message, user_vote: null, vote_score: null };
  }

  const payload = (data ?? {}) as {
    user_vote?: 'upvote' | 'downvote' | null;
    vote_score?: number;
  };

  const userVote = payload.user_vote;
  return {
    error: null,
    user_vote: userVote === 'upvote' || userVote === 'downvote' ? userVote : null,
    vote_score: typeof payload.vote_score === 'number' ? payload.vote_score : null
  };
}

export async function addForumThreadClaps(
  threadId: string,
  clapsAdded: number
): Promise<{
  error: string | null;
  total_claps: number | null;
  user_clap_count: number | null;
  claps_added: number | null;
}> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return {
      error: 'Sign in required.',
      total_claps: null,
      user_clap_count: null,
      claps_added: null
    };
  }

  if (!Number.isFinite(clapsAdded) || clapsAdded <= 0) {
    return {
      error: 'Invalid clap count.',
      total_claps: null,
      user_clap_count: null,
      claps_added: null
    };
  }

  const { data, error } = await supabase.rpc('add_forum_thread_claps', {
    p_thread_id: threadId,
    p_claps_added: Math.floor(clapsAdded)
  });

  if (error) {
    return {
      error: error.message,
      total_claps: null,
      user_clap_count: null,
      claps_added: null
    };
  }

  const payload = (data ?? {}) as {
    total_claps?: number;
    user_clap_count?: number;
    claps_added?: number;
  };

  return {
    error: null,
    total_claps: payload.total_claps ?? null,
    user_clap_count: payload.user_clap_count ?? null,
    claps_added: payload.claps_added ?? null
  };
}

export async function hideForumThreadLess(threadId: string): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: 'Sign in required.' };

  const { error } = await supabase.rpc('hide_forum_thread_less', {
    p_thread_id: threadId
  });

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

  const reason = input.reason.trim();
  if (reason.length < 4) return { error: 'Please describe why you are reporting this.' };

  const { data: existing, error: existingError } = await supabase
    .from('moderation_reports')
    .select('id')
    .eq('reporter_id', userData.user.id)
    .eq('target_type', input.targetType)
    .eq('target_id', input.targetId)
    .eq('status', 'pending')
    .maybeSingle();

  if (existingError) return { error: existingError.message };
  if (existing?.id) {
    return { error: 'You already reported this. Our moderators are reviewing it.' };
  }

  const { error } = await supabase.from('moderation_reports').insert({
    reporter_id: userData.user.id,
    target_type: input.targetType,
    target_id: input.targetId,
    reason
  });

  if (!error) return { error: null };

  const message = error.message;
  if (message.includes('invalid input value for enum target_type')) {
    return {
      error:
        'Reporting is not fully configured on this server yet. Ask an admin to apply the latest forum migrations.'
    };
  }
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return { error: 'You do not have permission to report content. Sign in and try again.' };
  }

  return { error: message };
}

export async function searchForumThreads(
  query: string,
  opts?: { sort?: ForumSort; limit?: number }
): Promise<{ items: ForumThreadSummary[]; error: string | null }> {
  const trimmed = query.trim();
  const sort = opts?.sort ?? 'newest';
  const limit = opts?.limit ?? 20;
  if (!trimmed) return { items: [], error: null };

  const pat = postgrestOrIlikeValue(trimmed);
  const { data, error } = await supabase
    .from('forum_threads_enriched')
    .select('*')
    .or(`title.ilike.${pat},body.ilike.${pat}`)
    .limit(limit * 3);

  if (error) return { items: [], error: error.message };

  let items = (data ?? []).map((row) => mapThreadRow(row as ForumThreadSummary));
  items = sortThreads(items, sort).slice(0, limit * 2);
  items = await applyFeedFilters(items);
  items = items.slice(0, limit);
  items = await attachSavedThreads(items);

  return { items, error: null };
}
