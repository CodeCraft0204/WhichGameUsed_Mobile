import { supabase } from '@/lib/supabase';
import {
  contextHeaderByPage,
  type ContextHeaderMessage,
  type ContextHeaderPageKey
} from '@/constants/contextHeaderContent';

const cache = new Map<ContextHeaderPageKey, ContextHeaderMessage[]>();

export function getLocalContextHeaderMessages(pageKey: ContextHeaderPageKey): ContextHeaderMessage[] {
  return contextHeaderByPage[pageKey].messages;
}

export async function fetchContextHeaderMessages(
  pageKey: ContextHeaderPageKey
): Promise<ContextHeaderMessage[]> {
  const cached = cache.get(pageKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('app_context_header_tips')
    .select('text, route, sort_order')
    .eq('page_key', pageKey)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data?.length) {
    const local = getLocalContextHeaderMessages(pageKey);
    cache.set(pageKey, local);
    return local;
  }

  const messages: ContextHeaderMessage[] = data.map((row) => ({
    text: String(row.text),
    route: row.route ? String(row.route) : undefined
  }));

  cache.set(pageKey, messages);
  return messages;
}

export function clearContextHeaderCache(): void {
  cache.clear();
}
