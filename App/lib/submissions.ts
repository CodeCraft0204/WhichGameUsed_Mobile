import {
  bucketForFileKind,
  signedSubmissionImageUrl,
  type SubmissionFileKind,
  uploadSubmissionImage
} from '@/lib/submission-storage';
import { supabase } from '@/lib/supabase';

export type SubmissionStatus =
  | 'draft'
  | 'pending_payment'
  | 'pending_admin_review'
  | 'needs_more_info'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type SubmissionRow = {
  id: string;
  user_id: string;
  status: SubmissionStatus;
  user_notes: string | null;
  admin_notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SubmissionItemRow = {
  id: string;
  submission_id: string;
  card_id: string | null;
  status: SubmissionStatus;
  user_notes: string | null;
};

export type SubmissionUploadRow = {
  id: string;
  submission_id: string;
  submission_item_id: string | null;
  file_kind: SubmissionFileKind;
  file_asset_id: string;
  file_assets: {
    bucket_name: string;
    file_path: string;
  } | null;
};

const SUBMISSION_COLUMNS =
  'id, user_id, status, user_notes, admin_notes, submitted_at, created_at, updated_at';

export type CapturedPhotos = {
  frontUri: string;
  backUri?: string | null;
  proofUri?: string | null;
};

export async function listMySubmissions(
  statuses?: SubmissionStatus[]
): Promise<{ items: SubmissionRow[]; error: string | null }> {
  let q = supabase
    .from('submissions')
    .select(SUBMISSION_COLUMNS)
    .order('created_at', { ascending: false });

  if (statuses?.length) {
    q = q.in('status', statuses);
  }

  const { data, error } = await q;
  if (error) return { items: [], error: error.message };
  return { items: (data ?? []) as SubmissionRow[], error: null };
}

export async function getSubmissionWithItems(
  submissionId: string
): Promise<{
  submission: SubmissionWithItems | null;
  error: string | null;
}> {
  const { submission, uploads, error } = await getSubmissionWithUploads(submissionId);
  if (error || !submission) return { submission: null, error: error ?? 'Submission not found.' };

  const { data: itemRows, error: itemError } = await supabase
    .from('submission_items')
    .select('id, card_id, cards(title)')
    .eq('submission_id', submissionId);

  if (itemError) return { submission: null, error: itemError.message };

  return {
    submission: {
      ...submission,
      items: (itemRows ?? []) as SubmissionWithItems['items']
    },
    error: null
  };
}

export async function getSubmissionWithUploads(
  submissionId: string
): Promise<{
  submission: SubmissionRow | null;
  uploads: SubmissionUploadRow[];
  error: string | null;
}> {
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .select(SUBMISSION_COLUMNS)
    .eq('id', submissionId)
    .maybeSingle();

  if (subError) return { submission: null, uploads: [], error: subError.message };

  const { data: uploads, error: upError } = await supabase
    .from('submission_uploads')
    .select(
      'id, submission_id, submission_item_id, file_kind, file_asset_id, file_assets(bucket_name, file_path)'
    )
    .eq('submission_id', submissionId);

  if (upError) return { submission: null, uploads: [], error: upError.message };

  return {
    submission: (submission as SubmissionRow | null) ?? null,
    uploads: (uploads ?? []) as unknown as SubmissionUploadRow[],
    error: null
  };
}

async function createDraftSubmission(userId: string, userNotes?: string) {
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      user_id: userId,
      status: 'draft',
      user_notes: userNotes?.trim() || null
    })
    .select('id')
    .single();

  if (error) return { submissionId: null, error: error.message };
  return { submissionId: data.id as string, error: null };
}

async function createSubmissionItem(
  submissionId: string,
  userNotes?: string,
  cardId?: string | null
) {
  const { data, error } = await supabase
    .from('submission_items')
    .insert({
      submission_id: submissionId,
      card_id: cardId?.trim() || null,
      status: 'draft',
      user_notes: userNotes?.trim() || null
    })
    .select('id')
    .single();

  if (error) return { itemId: null, error: error.message };
  return { itemId: data.id as string, error: null };
}

async function registerUpload(
  submissionId: string,
  itemId: string,
  userId: string,
  kind: SubmissionFileKind,
  bucket: string,
  path: string
) {
  const { data: asset, error: assetError } = await supabase
    .from('file_assets')
    .insert({
      bucket_name: bucket,
      file_path: path,
      file_kind: kind,
      visibility: 'private',
      uploaded_by: userId,
      submission_id: submissionId,
      mime_type: 'image/jpeg'
    })
    .select('id')
    .single();

  if (assetError) return { error: assetError.message };

  const { error: linkError } = await supabase.from('submission_uploads').insert({
    submission_id: submissionId,
    submission_item_id: itemId,
    file_asset_id: asset.id,
    file_kind: kind,
    is_required: kind === 'submission_front' || kind === 'ownership_proof'
  });

  return { error: linkError?.message ?? null };
}

/**
 * Create a draft submission, upload photos, and submit for admin review.
 */
export type SubmissionWithItems = SubmissionRow & {
  preview_image_url?: string | null;
  items: {
    id: string;
    card_id: string | null;
    cards: { title: string } | { title: string }[] | null;
  }[];
};

export async function listMySubmissionsWithItems(
  statuses?: SubmissionStatus[]
): Promise<{ items: SubmissionWithItems[]; error: string | null }> {
  const { items, error } = await listMySubmissions(statuses);
  if (error) return { items: [], error };

  const enriched: SubmissionWithItems[] = [];
  for (const submission of items) {
    const [{ data: itemRows, error: itemError }, { data: uploadRows, error: uploadError }] =
      await Promise.all([
        supabase
          .from('submission_items')
          .select('id, card_id, cards(title)')
          .eq('submission_id', submission.id),
        supabase
          .from('submission_uploads')
          .select('file_kind, file_assets(bucket_name, file_path)')
          .eq('submission_id', submission.id)
      ]);

    if (itemError) return { items: [], error: itemError.message };
    if (uploadError) return { items: [], error: uploadError.message };

    let previewImageUrl: string | null = null;
    const uploads = (uploadRows ?? []) as {
      file_kind: string;
      file_assets:
        | { bucket_name: string; file_path: string }
        | { bucket_name: string; file_path: string }[]
        | null;
    }[];
    const previewUpload =
      uploads.find((u) => u.file_kind === 'submission_front') ??
      uploads.find((u) => u.file_kind === 'submission_back') ??
      uploads.find((u) => u.file_kind === 'ownership_proof') ??
      uploads[0];
    const previewFile = Array.isArray(previewUpload?.file_assets)
      ? previewUpload?.file_assets[0] ?? null
      : previewUpload?.file_assets ?? null;
    if (previewFile) {
      previewImageUrl = await signedSubmissionImageUrl(
        previewFile.bucket_name,
        previewFile.file_path
      );
    }

    enriched.push({
      ...submission,
      preview_image_url: previewImageUrl,
      items: (itemRows ?? []) as SubmissionWithItems['items']
    });
  }

  return { items: enriched, error: null };
}

function linkedCardTitleFromItems(items: SubmissionWithItems['items']): string | null {
  for (const item of items) {
    const cards = item.cards;
    if (!cards) continue;
    if (Array.isArray(cards)) return cards[0]?.title ?? null;
    return cards.title;
  }
  return null;
}

export { linkedCardTitleFromItems };

export async function createAndSubmitCardCapture(
  userId: string,
  photos: CapturedPhotos,
  userNotes?: string,
  cardId?: string | null
): Promise<{ submissionId: string | null; error: string | null }> {
  if (!photos.frontUri?.trim()) {
    return { submissionId: null, error: 'A front photo is required.' };
  }

  const { submissionId, error: draftError } = await createDraftSubmission(userId, userNotes);
  if (draftError || !submissionId) {
    return { submissionId: null, error: draftError ?? 'Could not create submission.' };
  }

  const { itemId, error: itemError } = await createSubmissionItem(submissionId, userNotes, cardId);
  if (itemError || !itemId) {
    return { submissionId: null, error: itemError ?? 'Could not create submission item.' };
  }

  const uploads: { kind: SubmissionFileKind; uri: string }[] = [
    { kind: 'submission_front', uri: photos.frontUri }
  ];
  if (photos.backUri) uploads.push({ kind: 'submission_back', uri: photos.backUri });
  if (photos.proofUri) uploads.push({ kind: 'ownership_proof', uri: photos.proofUri });

  for (const { kind, uri } of uploads) {
    const { path, bucket, error: uploadError } = await uploadSubmissionImage(
      userId,
      submissionId,
      kind,
      uri
    );
    if (uploadError) return { submissionId: null, error: uploadError };

    const { error: regError } = await registerUpload(
      submissionId,
      itemId,
      userId,
      kind,
      bucket,
      path
    );
    if (regError) return { submissionId: null, error: regError };
  }

  const now = new Date().toISOString();
  const { error: itemUpdateError } = await supabase
    .from('submission_items')
    .update({ status: 'pending_admin_review' })
    .eq('id', itemId);

  if (itemUpdateError) return { submissionId: null, error: itemUpdateError.message };

  const { error: submitError } = await supabase
    .from('submissions')
    .update({
      status: 'pending_admin_review',
      submitted_at: now
    })
    .eq('id', submissionId);

  if (submitError) return { submissionId: null, error: submitError.message };

  return { submissionId, error: null };
}

export function statusLabel(status: SubmissionStatus): string {
  const map: Record<string, string> = {
    draft: 'Draft',
    pending_admin_review: 'Pending review',
    needs_more_info: 'Needs info',
    approved: 'Approved',
    rejected: 'Denied',
    pending_payment: 'Pending payment',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return map[status] ?? status;
}

export function bucketForKind(kind: SubmissionFileKind): string {
  return bucketForFileKind(kind);
}

const CANCELLABLE_STATUSES: SubmissionStatus[] = [
  'draft',
  'pending_payment',
  'pending_admin_review',
  'needs_more_info'
];

export function canCancelSubmission(status: SubmissionStatus): boolean {
  return CANCELLABLE_STATUSES.includes(status);
}

export async function cancelSubmission(
  submissionId: string
): Promise<{ cancelled: boolean; error: string | null }> {
  const { data: row, error: getError } = await supabase
    .from('submissions')
    .select('status')
    .eq('id', submissionId)
    .maybeSingle();
  if (getError) return { cancelled: false, error: getError.message };
  if (!row) return { cancelled: false, error: 'Submission not found.' };

  const current = (row as { status: SubmissionStatus }).status;
  if (!canCancelSubmission(current)) {
    return { cancelled: false, error: 'This submission can no longer be cancelled.' };
  }

  const [{ error: subError }, { error: itemError }] = await Promise.all([
    supabase
      .from('submissions')
      .update({ status: 'cancelled' })
      .eq('id', submissionId)
      .in('status', CANCELLABLE_STATUSES),
    supabase
      .from('submission_items')
      .update({ status: 'cancelled' })
      .eq('submission_id', submissionId)
      .in('status', CANCELLABLE_STATUSES)
  ]);

  if (subError) return { cancelled: false, error: subError.message };
  if (itemError) return { cancelled: false, error: itemError.message };
  return { cancelled: true, error: null };
}
