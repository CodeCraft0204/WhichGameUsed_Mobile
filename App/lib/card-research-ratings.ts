import { supabase } from '@/lib/supabase';

export type CardResearchRatings = {
  adminRating: number | null;
  communityRating: number | null;
  communityVoteCount: number;
  userRating: number | null;
};

export async function getCardResearchRatings(
  cardId: string
): Promise<{ ratings: CardResearchRatings; error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  const [summaryRes, userRes] = await Promise.all([
    supabase
      .from('card_public_summary')
      .select('admin_research_rating, community_research_rating, community_research_vote_count')
      .eq('id', cardId)
      .maybeSingle(),
    userId
      ? supabase
          .from('card_research_ratings')
          .select('rating')
          .eq('card_id', cardId)
          .eq('user_id', userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null })
  ]);

  if (summaryRes.error) {
    return {
      ratings: { adminRating: null, communityRating: null, communityVoteCount: 0, userRating: null },
      error: summaryRes.error.message
    };
  }

  const row = summaryRes.data as {
    admin_research_rating: number | null;
    community_research_rating: number | null;
    community_research_vote_count: number | null;
  } | null;

  return {
    ratings: {
      adminRating: row?.admin_research_rating ?? null,
      communityRating: row?.community_research_rating ?? null,
      communityVoteCount: row?.community_research_vote_count ?? 0,
      userRating: (userRes.data as { rating: number } | null)?.rating ?? null
    },
    error: null
  };
}

export async function setUserResearchRating(
  cardId: string,
  rating: number
): Promise<{ error: string | null }> {
  if (rating < 1 || rating > 5) return { error: 'Rating must be between 1 and 5.' };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: 'Sign in required.' };

  const { error } = await supabase.from('card_research_ratings').upsert(
    {
      card_id: cardId,
      user_id: userData.user.id,
      rating
    },
    { onConflict: 'card_id,user_id' }
  );

  return { error: error?.message ?? null };
}
