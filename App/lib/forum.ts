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
  const parsedScore = Number(row.vote_score);

  return {
    ...row,
    total_claps: Number(row.total_claps ?? 0),
    clap_diversity_score: Number(row.clap_diversity_score ?? 0),
    user_clap_count: Number(row.user_clap_count ?? 0),
    vote_score: Number.isFinite(parsedScore) ? parsedScore : 0,
    user_vote: normalizedVote,
    author_avatar_url: resolveProfileAvatarUrl(row.author_avatar_url)
  };
}

function parseRpcNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseRpcUserVote(value: unknown): 'upvote' | 'downvote' | null {
  return value === 'upvote' || value === 'downvote' ? value : null;
}

function voteDelta(value: 'upvote' | 'downvote'): number {
  return value === 'upvote' ? 1 : -1;
}

export function computeVoteScoreAfterAction(
  currentScore: number,
  currentUserVote: 'upvote' | 'downvote' | null,
  action: 'upvote' | 'downvote'
): { user_vote: 'upvote' | 'downvote' | null; vote_score: number } {
  const score = Number.isFinite(currentScore) ? currentScore : 0;

  if (currentUserVote === action) {
    return { user_vote: null, vote_score: score - voteDelta(action) };
  }
  if (currentUserVote == null) {
    return { user_vote: action, vote_score: score + voteDelta(action) };
  }
  return {
    user_vote: action,
    vote_score: score - voteDelta(currentUserVote) + voteDelta(action)
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
            b.vote_score - a.vote_score ||
            b.comment_count - a.comment_count ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : sort === 'all_time'
        ? [...rest].sort(
            (a, b) =>
              b.vote_score - a.vote_score ||
              b.comment_count - a.comment_count ||
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

  let q = supabase.from('forum_threads_enriched').select('*');

  if (opts?.topicSlug) {
    q = q.eq('topic_slug', opts.topicSlug);
  }

  q = q.order('is_pinned', { ascending: false });
  if (sort === 'hottest') {
    q = q
      .order('vote_score', { ascending: false })
      .order('comment_count', { ascending: false })
      .order('created_at', { ascending: false });
  } else if (sort === 'all_time') {
    q = q
      .order('vote_score', { ascending: false })
      .order('comment_count', { ascending: false })
      .order('created_at', { ascending: false });
  } else {
    q = q.order('created_at', { ascending: false });
  }

  const { data, error } = await q.limit(limit);
  if (error) return { items: [], error: error.message };

  let items = ((data ?? []) as ForumThreadSummary[]).map((row) => mapThreadRow(row));
  items = await applyFeedFilters(items);
  items = await attachSavedThreads(items);

  return { items, error: null };
}

export async function listSavedForumThreads(opts?: {
  sort?: ForumSort;
  limit?: number;
}): Promise<{ items: ForumThreadSummary[]; error: string | null }> {
  const sort = opts?.sort ?? 'newest';
  const limit = opts?.limit ?? 50;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { items: [], error: 'Sign in required.' };
  }

  const { data: saves, error: savesError } = await supabase
    .from('forum_thread_saves')
    .select('thread_id, created_at')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (savesError) return { items: [], error: savesError.message };
  if (!saves?.length) return { items: [], error: null };

  const saveOrder = new Map(saves.map((row) => [row.thread_id, row.created_at]));
  const threadIds = saves.map((row) => row.thread_id);

  const { data, error } = await supabase
    .from('forum_threads_enriched')
    .select('*')
    .in('id', threadIds);

  if (error) return { items: [], error: error.message };

  let items = (data ?? []).map((row) => mapThreadRow(row as ForumThreadSummary));

  if (sort === 'newest') {
    items.sort(
      (a, b) =>
        new Date(saveOrder.get(b.id) ?? 0).getTime() -
        new Date(saveOrder.get(a.id) ?? 0).getTime()
    );
  } else {
    items = sortThreads(items, sort);
  }

  items = await applyFeedFilters(items);
  items = items.slice(0, limit).map((row) => ({ ...row, saved: true }));

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

  if (error) {
    if (error.message.includes('forum_comments_body_check')) {
      return {
        commentId: null,
        error:
          'This reply is too short. Use at least one character — if the database is not updated yet, add a few words instead of a single emoji.'
      };
    }
    return { commentId: null, error: error.message };
  }
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
    user_vote?: unknown;
    vote_score?: unknown;
  };

  return {
    error: null,
    user_vote: parseRpcUserVote(payload.user_vote),
    vote_score: parseRpcNumber(payload.vote_score)
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

export type ForumFeedFilterRow = {
  id: string;
  filter_type: 'thread' | 'topic' | 'author';
  filter_target_id: string;
  created_at: string;
  label: string;
  subtitle: string;
};

const FEED_FILTER_TYPE_LABELS: Record<ForumFeedFilterRow['filter_type'], string> = {
  thread: 'Thread',
  topic: 'Topic',
  author: 'Author'
};

export async function countForumFeedFilters(): Promise<{ count: number; error: string | null }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { count: 0, error: null };

  const { count, error } = await supabase
    .from('forum_feed_filters')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userData.user.id);

  if (error) return { count: 0, error: error.message };
  return { count: count ?? 0, error: null };
}

export async function listForumFeedFilters(): Promise<{
  items: ForumFeedFilterRow[];
  error: string | null;
}> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { items: [], error: 'Sign in required.' };

  const { data: filters, error } = await supabase
    .from('forum_feed_filters')
    .select('id, filter_type, filter_target_id, created_at')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) return { items: [], error: error.message };
  if (!filters?.length) return { items: [], error: null };

  const threadIds = filters
    .filter((row) => row.filter_type === 'thread')
    .map((row) => row.filter_target_id);
  const topicIds = filters
    .filter((row) => row.filter_type === 'topic')
    .map((row) => row.filter_target_id);
  const authorIds = filters
    .filter((row) => row.filter_type === 'author')
    .map((row) => row.filter_target_id);

  const [threadsRes, topicsRes, authorsRes] = await Promise.all([
    threadIds.length > 0
      ? supabase.from('forum_threads_enriched').select('id, title').in('id', threadIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    topicIds.length > 0
      ? supabase.from('forum_topics').select('id, title').in('id', topicIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    authorIds.length > 0
      ? supabase.rpc('forum_author_profiles', { author_ids: authorIds })
      : Promise.resolve({ data: [] as ProfileEmbed[] })
  ]);

  const threadTitles = new Map((threadsRes.data ?? []).map((row) => [row.id, row.title]));
  const topicTitles = new Map((topicsRes.data ?? []).map((row) => [row.id, row.title]));
  const authorNames = new Map(
    (
      (authorsRes.data ?? []) as Array<{
        id: string;
        display_name: string | null;
        username: string | null;
      }>
    ).map((row) => [row.id, row.display_name || row.username || 'Collector'])
  );

  const items: ForumFeedFilterRow[] = filters.map((row) => {
    const filterType = row.filter_type as ForumFeedFilterRow['filter_type'];
    let label = 'Hidden item';

    if (filterType === 'thread') {
      label = threadTitles.get(row.filter_target_id) ?? 'Removed thread';
    } else if (filterType === 'topic') {
      label = topicTitles.get(row.filter_target_id) ?? 'Removed topic';
    } else if (filterType === 'author') {
      label = authorNames.get(row.filter_target_id) ?? 'Collector';
    }

    return {
      id: row.id,
      filter_type: filterType,
      filter_target_id: row.filter_target_id,
      created_at: row.created_at,
      label,
      subtitle: FEED_FILTER_TYPE_LABELS[filterType]
    };
  });

  return { items, error: null };
}

export async function removeForumFeedFilter(filterId: string): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: 'Sign in required.' };

  const { error } = await supabase
    .from('forum_feed_filters')
    .delete()
    .eq('id', filterId)
    .eq('user_id', userData.user.id);

  return { error: error?.message ?? null };
}

export async function clearAllForumFeedFilters(): Promise<{
  error: string | null;
  removed: number;
}> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: 'Sign in required.', removed: 0 };

  const { data, error } = await supabase
    .from('forum_feed_filters')
    .delete()
    .eq('user_id', userData.user.id)
    .select('id');

  if (error) return { error: error.message, removed: 0 };
  return { error: null, removed: data?.length ?? 0 };
}

export async function toggleForumThreadSave(threadId: string): Promise<{
  saved: boolean;
  error: string | null;
}> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { saved: false, error: 'Sign in required.' };

  const userId = userData.user.id;

  const { data: existing, error: readError } = await supabase
    .from('forum_thread_saves')
    .select('id')
    .eq('user_id', userId)
    .eq('thread_id', threadId)
    .maybeSingle();

  if (readError) return { saved: false, error: readError.message };

  if (existing?.id) {
    const { error } = await supabase
      .from('forum_thread_saves')
      .delete()
      .eq('user_id', userId)
      .eq('thread_id', threadId);
    return { saved: false, error: error?.message ?? null };
  }

  const { error } = await supabase.from('forum_thread_saves').insert({
    user_id: userId,
    thread_id: threadId
  });

  if (error) {
    // Row already exists (race or stale UI) — treat as saved instead of surfacing DB noise.
    if (error.code === '23505') return { saved: true, error: null };
    return { saved: false, error: error.message };
  }

  return { saved: true, error: null };
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
  let q = supabase
    .from('forum_threads_enriched')
    .select('*')
    .or(`title.ilike.${pat},body.ilike.${pat}`)
    .order('is_pinned', { ascending: false });

  if (sort === 'hottest') {
    q = q
      .order('vote_score', { ascending: false })
      .order('comment_count', { ascending: false })
      .order('created_at', { ascending: false });
  } else if (sort === 'all_time') {
    q = q
      .order('vote_score', { ascending: false })
      .order('comment_count', { ascending: false })
      .order('created_at', { ascending: false });
  } else {
    q = q.order('created_at', { ascending: false });
  }

  const { data, error } = await q.limit(limit);
  if (error) return { items: [], error: error.message };

  let items = ((data ?? []) as ForumThreadSummary[]).map((row) => mapThreadRow(row));
  items = await applyFeedFilters(items);
  items = await attachSavedThreads(items);

  return { items, error: null };
}
