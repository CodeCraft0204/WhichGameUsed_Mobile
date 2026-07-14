import { resolveCardImageUrl } from '@/lib/card-images';
import { type CreateCardRequestInput, createCardRequest } from '@/lib/card-requests';
import { supabase } from '@/lib/supabase';

export type WishlistDisplayStatus =
  | 'saved'
  | 'requested'
  | 'under_review'
  | 'promoted_to_most_wanted'
  | 'evidence_needed'
  | 'added_to_database';

export type WishlistEnrichedItem = {
  id: string;
  user_id: string;
  card_id: string | null;
  card_request_id: string | null;
  notes: string | null;
  created_at: string;
  display_status: WishlistDisplayStatus;
  most_wanted_hunt_id: string | null;
  most_wanted_status: string | null;
  catalog_card_id: string | null;
  request_status: string | null;
  review_notes: string | null;
  card_title: string;
  player_name: string | null;
  product_name: string | null;
  product_year: number | null;
  front_image_file_id: string | null;
  imageUrl?: string | null;
};

/** @deprecated Prefer WishlistEnrichedItem via listMyWishlistEnriched */
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

export function wishlistItemTitle(item: WishlistEnrichedItem | WishlistItemRow): string {
  if ('card_title' in item && item.card_title) return item.card_title;
  const legacy = item as WishlistItemRow;
  const cards = legacy.cards;
  if (cards) {
    if (Array.isArray(cards)) return cards[0]?.title ?? 'Catalog card';
    return cards.title;
  }
  const req = legacy.card_requests;
  const row = Array.isArray(req) ? req[0] : req;
  return (
    row?.card_title?.trim() ||
    row?.player_name?.trim() ||
    row?.product_name?.trim() ||
    'Requested card'
  );
}

async function attachWishlistImages(items: WishlistEnrichedItem[]): Promise<WishlistEnrichedItem[]> {
  return Promise.all(
    items.map(async (item) => {
      if (!item.front_image_file_id) return { ...item, imageUrl: null };
      const imageUrl = await resolveCardImageUrl(item.front_image_file_id);
      return { ...item, imageUrl };
    })
  );
}

export async function listMyWishlistEnriched(): Promise<{
  items: WishlistEnrichedItem[];
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('list_my_wishlist_enriched');
  if (error) return { items: [], error: error.message };
  const rows = (data ?? []) as WishlistEnrichedItem[];
  const items = await attachWishlistImages(rows);
  return { items, error: null };
}

export async function getWishlistItemEnriched(
  itemId: string
): Promise<{ item: WishlistEnrichedItem | null; error: string | null }> {
  const { items, error } = await listMyWishlistEnriched();
  if (error) return { item: null, error };
  return { item: items.find((row) => row.id === itemId) ?? null, error: null };
}

/** Legacy list — prefer listMyWishlistEnriched */
export async function listMyWishlist(): Promise<{
  items: WishlistItemRow[];
  error: string | null;
}> {
  const { items, error } = await listMyWishlistEnriched();
  if (error) return { items: [], error };
  return {
    items: items.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      card_id: row.card_id,
      card_request_id: row.card_request_id,
      notes: row.notes,
      created_at: row.created_at,
      cards: row.catalog_card_id ? { id: row.catalog_card_id, title: row.card_title } : null,
      card_requests: row.card_request_id
        ? {
            id: row.card_request_id,
            player_name: row.player_name,
            card_title: row.card_title,
            product_name: row.product_name,
            status: row.request_status ?? 'pending_review'
          }
        : null
    })),
    error: null
  };
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
