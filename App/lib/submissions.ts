import {
  bucketForFileKind,
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

async function createSubmissionItem(submissionId: string, userNotes?: string) {
  const { data, error } = await supabase
    .from('submission_items')
    .insert({
      submission_id: submissionId,
      card_id: null,
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
export async function createAndSubmitCardCapture(
  userId: string,
  photos: CapturedPhotos,
  userNotes?: string
): Promise<{ submissionId: string | null; error: string | null }> {
  if (!photos.frontUri?.trim()) {
    return { submissionId: null, error: 'A front photo is required.' };
  }

  const { submissionId, error: draftError } = await createDraftSubmission(userId, userNotes);
  if (draftError || !submissionId) {
    return { submissionId: null, error: draftError ?? 'Could not create submission.' };
  }

  const { itemId, error: itemError } = await createSubmissionItem(submissionId, userNotes);
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
