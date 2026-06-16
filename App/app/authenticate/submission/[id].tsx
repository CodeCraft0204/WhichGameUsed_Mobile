import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImagePreviewModal } from '@/components/database/ImagePreviewModal';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { databaseCopy } from '@/constants/databaseCopy';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { signedSubmissionImageUrl } from '@/lib/submission-storage';
import {
  cancelSubmission,
  canCancelSubmission,
  getSubmissionWithItems,
  getSubmissionWithUploads,
  linkedCardTitleFromItems,
  statusLabel,
  type SubmissionStatus,
  type SubmissionUploadRow
} from '@/lib/submissions';

type PhotoSlot = { label: string; url: string | null };

function uploadLabel(kind: string): string {
  if (kind === 'submission_front') return 'Front';
  if (kind === 'submission_back') return 'Back';
  if (kind === 'ownership_proof') return 'Ownership proof';
  return kind;
}

async function uploadsToPhotos(uploads: SubmissionUploadRow[]): Promise<PhotoSlot[]> {
  const slots: PhotoSlot[] = [];
  for (const upload of uploads) {
    const file = upload.file_assets;
    if (!file) continue;
    const url = await signedSubmissionImageUrl(file.bucket_name, file.file_path);
    slots.push({ label: uploadLabel(upload.file_kind), url });
  }
  return slots;
}

export default function SubmissionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  const [status, setStatus] = useState<string>('—');
  const [rawStatus, setRawStatus] = useState<SubmissionStatus | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<string | null>(null);
  const [linkedTitle, setLinkedTitle] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoSlot[]>([]);
  const [preview, setPreview] = useState<PhotoSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    let active = true;
    setLoading(true);

    void (async () => {
      const [detail, uploadsResult] = await Promise.all([
        getSubmissionWithItems(id),
        getSubmissionWithUploads(id)
      ]);
      if (!active) return;
      if (detail.error || !detail.submission) {
        setError(detail.error ?? 'Submission not found.');
        setLoading(false);
        return;
      }

      const submission = detail.submission;
      setRawStatus(submission.status);
      setStatus(statusLabel(submission.status));
      setSubmittedAt(submission.submitted_at);
      setUserNotes(submission.user_notes);
      setAdminNotes(submission.admin_notes);
      setLinkedTitle(linkedCardTitleFromItems(submission.items));
      setPhotos(await uploadsToPhotos(uploadsResult.uploads));
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const handleCancel = async () => {
    if (!id || typeof id !== 'string' || !rawStatus) return;
    if (!canCancelSubmission(rawStatus)) return;
    Alert.alert('Cancel submission?', 'This will mark the submission as cancelled.', [
      { text: 'Keep submission', style: 'cancel' },
      {
        text: 'Cancel submission',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setCancelBusy(true);
            const { error: cancelError, cancelled } = await cancelSubmission(id);
            setCancelBusy(false);
            if (cancelError) {
              setError(cancelError);
              return;
            }
            if (cancelled) {
              setRawStatus('cancelled');
              setStatus(statusLabel('cancelled'));
            }
          })();
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title={databaseCopy.submissionDetail}
          subtitle={linkedTitle ?? 'Card submission'}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <ActivityIndicator color={figmaColors.charcoal} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error ? (
          <View style={styles.detailsCard}>
            <Row label={databaseCopy.status} value={status} />
            <Row
              label={databaseCopy.submitted}
              value={submittedAt ? new Date(submittedAt).toLocaleString() : 'Draft'}
            />
            <Row label={databaseCopy.yourNotes} value={userNotes?.trim() || '—'} />
            <Row label={databaseCopy.adminNotes} value={adminNotes?.trim() || '—'} />
          </View>
        ) : null}

        {!loading && !error && rawStatus && canCancelSubmission(rawStatus) ? (
          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && !cancelBusy && styles.cancelBtnPressed]}
            disabled={cancelBusy}
            onPress={() => void handleCancel()}
          >
            <Text style={styles.cancelBtnText}>
              {cancelBusy ? databaseCopy.cancellingSubmission : databaseCopy.cancelSubmission}
            </Text>
          </Pressable>
        ) : null}

        {photos.length > 0 ? (
          <View style={styles.photoGrid}>
            {photos.map((photo) => (
              <View key={photo.label} style={styles.photoSlot}>
                <Text style={styles.photoLabel}>{photo.label}</Text>
                {photo.url ? (
                  <Pressable onPress={() => setPreview(photo)}>
                    <Image source={{ uri: photo.url }} style={styles.photo} resizeMode="cover" />
                  </Pressable>
                ) : (
                  <View style={[styles.photo, styles.photoPlaceholder]} />
                )}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
      {preview?.url ? (
        <ImagePreviewModal
          visible
          uri={preview.url}
          label={preview.label}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontFamily: appFonts.body, fontSize: 12, color: figmaColors.gray }}>{label}</Text>
      <Text style={{ fontFamily: appFonts.body, fontSize: 18, color: figmaColors.charcoal }}>
        {value}
      </Text>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(16), paddingBottom: s(32) },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error
    },
    detailsCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(16),
      marginBottom: s(20),
      backgroundColor: figmaColors.cream
    },
    photoGrid: { gap: s(16) },
    photoSlot: { gap: s(8) },
    photoLabel: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.charcoal
    },
    photo: {
      width: '100%',
      aspectRatio: 3 / 4,
      borderRadius: s(10),
      backgroundColor: figmaColors.divider
    },
    photoPlaceholder: { opacity: 0.4 }
    ,
    cancelBtn: {
      marginBottom: s(18),
      minHeight: s(48),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.errorBorder,
      backgroundColor: figmaColors.errorBg,
      alignItems: 'center',
      justifyContent: 'center'
    },
    cancelBtnPressed: {
      opacity: 0.9
    },
    cancelBtnText: {
      fontFamily: appFonts.accent,
      fontSize: t(16),
      color: figmaColors.error
    }
  });
}
