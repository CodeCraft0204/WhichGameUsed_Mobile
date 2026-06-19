import React, { useMemo } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appFonts } from '@/constants/appFonts';
import { discussionIcons } from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';

type DiscussionMoreSheetProps = {
  visible: boolean;
  onClose: () => void;
  onShowLess: () => void;
  onManageHidden: () => void;
  onFlagContent: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function DiscussionMoreSheet({
  visible,
  onClose,
  onShowLess,
  onManageHidden,
  onFlagContent,
  s,
  t
}: DiscussionMoreSheetProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />
        <Text style={styles.title}>Thread options</Text>
        <Text style={styles.subtitle}>Adjust your feed or ask moderators to review this thread.</Text>

        <Pressable style={styles.optionRow} onPress={onShowLess}>
          <Text style={styles.optionText}>Show less like this</Text>
          <Text style={styles.optionHint}>Hide similar topics and authors</Text>
        </Pressable>

        <Pressable style={styles.optionRow} onPress={onManageHidden}>
          <Text style={styles.optionText}>Manage hidden content</Text>
          <Text style={styles.optionHint}>Show threads and topics in your feed again</Text>
        </Pressable>

        <Pressable style={styles.optionRow} onPress={onFlagContent}>
          <View style={styles.optionTitleRow}>
            <Image source={discussionIcons.threadReport} style={styles.optionIcon} resizeMode="contain" />
            <Text style={styles.optionText}>Flag for moderators</Text>
          </View>
          <Text style={styles.optionHint}>Send this thread to the review queue</Text>
        </Pressable>

        <Pressable style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>Close</Text>
        </Pressable>
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
      paddingHorizontal: s(20),
      paddingBottom: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight
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
      marginBottom: s(4)
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray,
      marginBottom: s(14)
    },
    optionRow: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(14),
      marginBottom: s(8),
      backgroundColor: figmaColors.cardFeaturedBg
    },
    optionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8)
    },
    optionIcon: {
      width: s(16),
      height: s(16),
      opacity: 0.8
    },
    optionText: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    optionHint: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray,
      marginTop: s(4)
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
