import { supabase } from '@/lib/supabase';

export type CardRequestStatus =
  | 'draft'
  | 'pending_review'
  | 'needs_more_info'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type CardRequestRow = {
  id: string;
  requested_by: string | null;
  player_name: string | null;
  team_name: string | null;
  manufacturer_name: string | null;
  product_year: number | null;
  product_name: string | null;
  card_number: string | null;
  card_title: string | null;
  memorabilia_type: string | null;
  source_url: string | null;
  notes: string | null;
  status: CardRequestStatus;
  accepted_card_id: string | null;
  review_notes: string | null;
  created_at: string;
};

export type CreateCardRequestInput = {
  player_name?: string;
  team_name?: string;
  manufacturer_name?: string;
  product_year?: number | null;
  product_name?: string;
  card_number?: string;
  card_title?: string;
  memorabilia_type?: string;
  source_url?: string;
  notes?: string;
};

export async function createCardRequest(
  userId: string,
  input: CreateCardRequestInput
): Promise<{ requestId: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('card_requests')
    .insert({
      requested_by: userId,
      player_name: input.player_name?.trim() || null,
      team_name: input.team_name?.trim() || null,
      manufacturer_name: input.manufacturer_name?.trim() || null,
      product_year: input.product_year ?? null,
      product_name: input.product_name?.trim() || null,
      card_number: input.card_number?.trim() || null,
      card_title: input.card_title?.trim() || null,
      memorabilia_type: input.memorabilia_type?.trim() || null,
      source_url: input.source_url?.trim() || null,
      notes: input.notes?.trim() || null,
      status: 'pending_review'
    })
    .select('id')
    .single();

  if (error) return { requestId: null, error: error.message };
  return { requestId: data.id as string, error: null };
}

export async function getCardRequestById(
  id: string
): Promise<{ request: CardRequestRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('card_requests')
    .select(
      'id, requested_by, player_name, team_name, manufacturer_name, product_year, product_name, card_number, card_title, memorabilia_type, source_url, notes, status, accepted_card_id, review_notes, created_at'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) return { request: null, error: error.message };
  return { request: (data as CardRequestRow) ?? null, error: null };
}

export async function listMyCardRequests(): Promise<{
  items: CardRequestRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('card_requests')
    .select(
      'id, requested_by, player_name, team_name, manufacturer_name, product_year, product_name, card_number, card_title, memorabilia_type, source_url, notes, status, accepted_card_id, review_notes, created_at'
    )
    .order('created_at', { ascending: false });

  if (error) return { items: [], error: error.message };
  return { items: (data ?? []) as CardRequestRow[], error: null };
}
