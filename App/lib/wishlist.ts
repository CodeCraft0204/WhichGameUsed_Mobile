import { type CreateCardRequestInput, createCardRequest } from '@/lib/card-requests';
import { supabase } from '@/lib/supabase';

export type WishlistItemRow = {
  id: string;
  user_id: string;
  card_id: string | null;
  card_request_id: string | null;
  notes: string | null;
  created_at: string;
  cards: { id: string; title: string } | { id: string; title: string }[] | null;
  card_requests: {
    id: string;
    player_name: string | null;
    card_title: string | null;
    product_name: string | null;
    status: string;
  } | {
    id: string;
    player_name: string | null;
    card_title: string | null;
    product_name: string | null;
    status: string;
  }[] | null;
};

const WISHLIST_SELECT =
  'id, user_id, card_id, card_request_id, notes, created_at, cards(id, title), card_requests(id, player_name, card_title, product_name, status)';

export function wishlistItemTitle(item: WishlistItemRow): string {
  const cards = item.cards;
  if (cards) {
    if (Array.isArray(cards)) return cards[0]?.title ?? 'Catalog card';
    return cards.title;
  }
  const req = item.card_requests;
  const row = Array.isArray(req) ? req[0] : req;
  return (
    row?.card_title?.trim() ||
    row?.player_name?.trim() ||
    row?.product_name?.trim() ||
    'Requested card'
  );
}

export async function listMyWishlist(): Promise<{
  items: WishlistItemRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('wish_list_items')
    .select(WISHLIST_SELECT)
    .order('created_at', { ascending: false });

  if (error) return { items: [], error: error.message };
  return { items: (data ?? []) as WishlistItemRow[], error: null };
}

export async function getWishlistEntryForCard(
  cardId: string
): Promise<{ itemId: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('wish_list_items')
    .select('id')
    .eq('card_id', cardId)
    .maybeSingle();

  if (error) return { itemId: null, error: error.message };
  return { itemId: (data?.id as string | undefined) ?? null, error: null };
}

export async function removeWishlistByCardId(cardId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('wish_list_items').delete().eq('card_id', cardId);
  return { error: error?.message ?? null };
}

export async function isCardOnWishlist(cardId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('wish_list_items')
    .select('id')
    .eq('card_id', cardId)
    .maybeSingle();
  return !error && !!data;
}

export async function addCardToWishlist(
  userId: string,
  cardId: string,
  notes?: string
): Promise<{ itemId: string | null; error: string | null }> {
  const { data: existing } = await supabase
    .from('wish_list_items')
    .select('id')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .maybeSingle();

  if (existing?.id) return { itemId: existing.id as string, error: null };

  const { data, error } = await supabase
    .from('wish_list_items')
    .insert({
      user_id: userId,
      card_id: cardId,
      card_request_id: null,
      notes: notes?.trim() || null
    })
    .select('id')
    .single();

  if (error) return { itemId: null, error: error.message };
  return { itemId: data.id as string, error: null };
}

export async function removeWishlistItem(itemId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('wish_list_items').delete().eq('id', itemId);
  return { error: error?.message ?? null };
}

export async function addRequestedCardToWishlist(
  userId: string,
  input: CreateCardRequestInput
): Promise<{ requestId: string | null; wishlistId: string | null; error: string | null }> {
  const { requestId, error: requestError } = await createCardRequest(userId, input);
  if (requestError || !requestId) {
    return { requestId: null, wishlistId: null, error: requestError ?? 'Could not create request.' };
  }

  const { data, error } = await supabase
    .from('wish_list_items')
    .insert({
      user_id: userId,
      card_id: null,
      card_request_id: requestId,
      notes: input.notes?.trim() || null
    })
    .select('id')
    .single();

  if (error) return { requestId, wishlistId: null, error: error.message };
  return { requestId, wishlistId: data.id as string, error: null };
}
