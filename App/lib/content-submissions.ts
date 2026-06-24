import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

const BUCKET = 'user-content';

export type ContentSubmissionInput = {
  templateId: string;
  title?: string;
  body?: string;
  imageUri: string;
  linkedCardId?: string | null;
};

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('Could not read the image.');
  return response.blob();
}

export async function uploadContentImage(
  userId: string,
  uri: string,
  submissionId: string
): Promise<{ path: string | null; error: string | null }> {
  try {
    const blob = await uriToBlob(uri);
    const path = `${userId}/${submissionId}.jpg`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true
    });

    if (error) {
      if (error.message.includes('Bucket not found')) {
        return { path: null, error: 'Storage bucket user-content is not configured yet.' };
      }
      return { path: null, error: error.message };
    }

    return { path, error: null };
  } catch (e) {
    return { path: null, error: e instanceof Error ? e.message : 'Upload failed.' };
  }
}

export async function submitContentCreation(
  input: ContentSubmissionInput
): Promise<{ submissionId: string | null; error: string | null }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { submissionId: null, error: 'Sign in required.' };

  const { data, error } = await supabase
    .from('content_submissions')
    .insert({
      user_id: userData.user.id,
      template_id: input.templateId,
      title: input.title?.trim() || null,
      body: input.body?.trim() || null,
      image_bucket: BUCKET,
      linked_card_id: input.linkedCardId ?? null,
      status: 'pending_review'
    })
    .select('id')
    .single();

  if (error) return { submissionId: null, error: error.message };

  const { path, error: uploadError } = await uploadContentImage(
    userData.user.id,
    input.imageUri,
    data.id
  );
  if (uploadError || !path) return { submissionId: null, error: uploadError ?? 'Upload failed.' };

  const { error: updateError } = await supabase
    .from('content_submissions')
    .update({ image_storage_path: path })
    .eq('id', data.id);

  if (updateError) return { submissionId: null, error: updateError.message };
  return { submissionId: data.id, error: null };
}

export async function pickEditorPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.9,
    allowsEditing: false
  });
  if (result.canceled || !result.assets[0]?.uri) return null;
  return result.assets[0].uri;
}
