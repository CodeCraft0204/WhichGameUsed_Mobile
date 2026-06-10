import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type ImproveResponse = {
  ok: boolean;
  improved?: string;
  error?: string;
};

async function readFunctionError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as { error?: string; message?: string };
      if (body?.error) return body.error;
      if (body?.message) return body.message;
    } catch {
      // ignore parse failures
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return 'Could not improve notes.';
}

export async function improveSubmissionNotes(
  text: string,
  context?: string | null
): Promise<{ improved: string | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke<ImproveResponse>('writing-improver', {
    body: {
      text,
      context: context?.trim() || undefined
    }
  });

  if (error) {
    return { improved: null, error: await readFunctionError(error) };
  }

  if (!data?.ok || !data.improved) {
    return { improved: null, error: data?.error ?? 'Could not improve notes.' };
  }

  return { improved: data.improved, error: null };
}
