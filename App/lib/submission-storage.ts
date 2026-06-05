import { supabase } from '@/lib/supabase';

export const SUBMISSION_PHOTOS_BUCKET = 'submission-photos';
export const OWNERSHIP_PROOF_BUCKET = 'ownership-proof-photos';

export type SubmissionFileKind =
  | 'submission_front'
  | 'submission_back'
  | 'submission_patch_closeup'
  | 'ownership_proof';

export function bucketForFileKind(kind: SubmissionFileKind): string {
  return kind === 'ownership_proof' ? OWNERSHIP_PROOF_BUCKET : SUBMISSION_PHOTOS_BUCKET;
}

function objectPath(userId: string, submissionId: string, kind: SubmissionFileKind): string {
  const stamp = Date.now();
  return `${userId}/${submissionId}/${kind}-${stamp}.jpg`;
}

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Could not read the photo from your device.');
  }
  return response.blob();
}

/** Upload a local image URI into a private submission bucket. */
export async function uploadSubmissionImage(
  userId: string,
  submissionId: string,
  kind: SubmissionFileKind,
  localUri: string
): Promise<{ path: string; bucket: string; error: string | null }> {
  const bucket = bucketForFileKind(kind);
  const path = objectPath(userId, submissionId, kind);

  try {
    const blob = await uriToBlob(localUri);
    const contentType = blob.type && blob.type !== 'application/octet-stream' ? blob.type : 'image/jpeg';

    const { error } = await supabase.storage.from(bucket).upload(path, blob, {
      contentType,
      upsert: false,
      cacheControl: '3600'
    });

    if (error) {
      if (error.message.includes('Bucket not found')) {
        return {
          path,
          bucket,
          error: 'Photo storage is not configured. Apply migration 20260602100000_submission_capture_workflow.sql.'
        };
      }
      return { path, bucket, error: error.message };
    }

    return { path, bucket, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed.';
    return { path, bucket, error: message };
  }
}

/** Signed URL for displaying a private submission photo (mobile preview). */
export async function signedSubmissionImageUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
