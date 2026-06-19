import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appFonts } from '@/constants/appFonts';
import {
  forumReportReasons,
  type ForumReportReasonKey
} from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';

export type ReportSheetTarget = {
  type: 'forum_thread' | 'forum_comment';
  id: string;
  headline: string;
  preview?: string;
};

type ReportContentSheetProps = {
  visible: boolean;
  target: ReportSheetTarget | null;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (reasonKey: ForumReportReasonKey, notes: string) => void | Promise<void>;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function ReportContentSheet({
  visible,
  target,
  busy = false,
  onClose,
  onSubmit,
  s,
  t
}: ReportContentSheetProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [reasonKey, setReasonKey] = useState<ForumReportReasonKey>('spam');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!visible) return;
    setReasonKey('spam');
    setNotes('');
  }, [visible, target?.id]);

  const canSubmit = reasonKey !== 'other' || notes.trim().length >= 4;

  if (!target) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Flag for moderators</Text>
          <Text style={styles.headline}>{target.headline}</Text>
          {target.preview ? (
            <Text style={styles.preview} numberOfLines={3}>
              “{target.preview}”
            </Text>
          ) : null}
          <Text style={styles.subtitle}>
            Choose the closest reason. Our team reviews flags privately — nothing is posted publicly.
          </Text>

          {forumReportReasons.map((option) => {
            const active = option.key === reasonKey;
            return (
              <Pressable
                key={option.key}
                style={[styles.reasonRow, active && styles.reasonRowActive]}
                onPress={() => setReasonKey(option.key)}
                disabled={busy}
              >
                <View style={[styles.radio, active && styles.radioActive]} />
                <Text style={styles.reasonText}>{option.label}</Text>
              </Pressable>
            );
          })}

          {reasonKey === 'other' ? (
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="What should moderators know? (required)"
              placeholderTextColor={figmaColors.textMuted}
              multiline
              editable={!busy}
            />
          ) : null}

          <Pressable
            style={[styles.submitBtn, (!canSubmit || busy) && styles.submitBtnDisabled]}
            onPress={() => void onSubmit(reasonKey, notes)}
            disabled={!canSubmit || busy}
            accessibilityRole="button"
          >
            {busy ? (
              <ActivityIndicator color={figmaColors.buttonPrimaryText} />
            ) : (
              <Text style={styles.submitText}>Send to moderators</Text>
            )}
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={onClose} disabled={busy}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)'
    },
    sheet: {
      backgroundColor: figmaColors.background,
      borderTopLeftRadius: s(20),
      borderTopRightRadius: s(20),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      maxHeight: '88%'
    },
    scrollContent: {
      paddingHorizontal: s(20),
      paddingBottom: s(16)
    },
    handle: {
      alignSelf: 'center',
      width: s(40),
      height: s(4),
      borderRadius: s(2),
      backgroundColor: figmaColors.borderLight,
      marginTop: s(8),
      marginBottom: s(14)
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(20),
      color: figmaColors.charcoal,
      marginBottom: s(6)
    },
    headline: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    preview: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray,
      fontStyle: 'italic',
      marginBottom: s(8)
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    reasonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      paddingVertical: s(11),
      paddingHorizontal: s(12),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      marginBottom: s(8),
      backgroundColor: figmaColors.cardFeaturedBg
    },
    reasonRowActive: {
      borderColor: figmaColors.buttonPrimaryBorder,
      backgroundColor: figmaColors.tagBg
    },
    radio: {
      width: s(16),
      height: s(16),
      borderRadius: s(8),
      borderWidth: 2,
      borderColor: figmaColors.borderStrong
    },
    radioActive: {
      borderColor: figmaColors.bronze,
      backgroundColor: figmaColors.bronze
    },
    reasonText: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.charcoal
    },
    notesInput: {
      minHeight: s(88),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal,
      textAlignVertical: 'top',
      marginBottom: s(12),
      backgroundColor: figmaColors.background
    },
    submitBtn: {
      height: s(46),
      borderRadius: s(23),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(4)
    },
    submitBtnDisabled: {
      opacity: 0.45
    },
    submitText: {
      fontFamily: appFonts.accent,
      fontSize: t(13),
      color: figmaColors.buttonPrimaryText
    },
    cancelBtn: {
      alignItems: 'center',
      paddingVertical: s(14)
    },
    cancelText: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.gray
    }
  });
}
