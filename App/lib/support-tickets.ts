import { supabase } from '@/lib/supabase';

export type SupportTopicId = 'account' | 'password' | 'verification' | 'report' | 'other';

export type SubmitSupportTicketInput = {
  email: string;
  topic: SupportTopicId;
  message: string;
  source?: 'mobile' | 'web' | 'portal';
};

export type SubmitSupportTicketResult = {
  ticketId: string | null;
  publicRef: string | null;
  error: string | null;
};

export async function submitSupportTicket(
  input: SubmitSupportTicketInput
): Promise<SubmitSupportTicketResult> {
  const { data, error } = await supabase.rpc('submit_support_ticket', {
    p_email: input.email.trim(),
    p_topic: input.topic,
    p_message: input.message.trim(),
    p_source: input.source ?? 'mobile'
  });

  if (error) return { ticketId: null, publicRef: null, error: error.message };

  // New RPC returns jsonb { id, public_ref }; older deploys may still return a uuid string.
  if (typeof data === 'string') {
    return { ticketId: data, publicRef: data.slice(0, 8).toUpperCase(), error: null };
  }

  const payload = data as { id?: string; public_ref?: string } | null;
  return {
    ticketId: payload?.id ?? null,
    publicRef: payload?.public_ref ?? null,
    error: null
  };
}
