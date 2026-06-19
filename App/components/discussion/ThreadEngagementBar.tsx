import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThreadClapButton } from '@/components/discussion/ThreadClapButton';
import { discussionIcons } from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';

type ThreadEngagementBarProps = {
  voteScore: number;
  userVote: 'upvote' | 'downvote' | null;
  onUpvote: () => void;
  onDownvote: () => void;
  totalClaps: number;
  userClaps: number;
  clapMaxed: boolean;
  clapBubbles: { id: number; key: number }[];
  onClapPressIn: () => void;
  onClapPressOut: () => void;
  saved: boolean;
  onSave: () => void;
  onMore: () => void;
  disabled?: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
};

const VOTE_ICON = { width: 16, height: 14 };

export function ThreadEngagementBar({
  voteScore,
  userVote,
  onUpvote,
  onDownvote,
  totalClaps,
  userClaps,
  clapMaxed,
  clapBubbles,
  onClapPressIn,
  onClapPressOut,
  saved,
  onSave,
  onMore,
  disabled = false,
  s,
  t
}: ThreadEngagementBarProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const iconW = s(VOTE_ICON.width);
  const iconH = s(VOTE_ICON.height);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.voteCluster}>
        <Pressable
          style={[styles.voteButton, userVote === 'upvote' && styles.voteButtonActive]}
          onPress={onUpvote}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Upvote thread"
        >
          <Image
            source={discussionIcons.threadLike}
            style={{ width: iconW, height: iconH }}
            resizeMode="contain"
          />
        </Pressable>
        <Text style={[styles.voteScore, userVote != null && styles.voteScoreActive]}>
          {voteScore}
        </Text>
        <Pressable
          style={[styles.voteButton, userVote === 'downvote' && styles.voteButtonActive]}
          onPress={onDownvote}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Downvote thread"
        >
          <Image
            source={discussionIcons.threadLike}
            style={{ width: iconW, height: iconH, transform: [{ rotate: '180deg' }] }}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <ThreadClapButton
        totalClaps={totalClaps}
        userClaps={userClaps}
        maxed={clapMaxed}
        active={userClaps > 0}
        bubbles={clapBubbles}
        onPressIn={onClapPressIn}
        onPressOut={onClapPressOut}
        disabled={disabled}
        inline
        s={s}
        t={t}
      />

      <Pressable
        style={[styles.actionChip, saved && styles.actionChipActive]}
        onPress={onSave}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Remove bookmark' : 'Save thread'}
      >
        <Image
          source={discussionIcons.threadBookmark}
          style={{ width: s(13), height: s(15), opacity: saved ? 1 : 0.55 }}
          resizeMode="contain"
        />
        <Text style={[styles.actionLabel, saved && styles.actionLabelActive]}>
          {saved ? 'Saved' : 'Save'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.actionChip}
        onPress={onMore}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="More thread options"
      >
        <Text style={styles.moreIcon}>⋯</Text>
      </Pressable>
    </ScrollView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      paddingBottom: s(16)
    },
    voteCluster: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(18),
      backgroundColor: figmaColors.cardFeaturedBg,
      paddingHorizontal: s(3),
      paddingVertical: s(3),
      flexShrink: 0
    },
    voteButton: {
      width: s(32),
      height: s(28),
      borderRadius: s(14),
      alignItems: 'center',
      justifyContent: 'center'
    },
    voteButtonActive: {
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.tagBorder
    },
    voteScore: {
      minWidth: s(22),
      textAlign: 'center',
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray,
      paddingHorizontal: s(2)
    },
    voteScoreActive: {
      color: figmaColors.charcoal,
      fontFamily: appFonts.accent
    },
    actionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(5),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(18),
      paddingHorizontal: s(10),
      paddingVertical: s(7),
      backgroundColor: figmaColors.cardFeaturedBg,
      flexShrink: 0
    },
    actionChipActive: {
      borderColor: figmaColors.buttonPrimaryBorder,
      backgroundColor: figmaColors.tagBg
    },
    actionLabel: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.charcoal
    },
    actionLabelActive: {
      color: figmaColors.bronze
    },
    moreIcon: {
      fontFamily: appFonts.body,
      fontSize: t(20),
      lineHeight: t(20),
      color: figmaColors.charcoal,
      marginTop: s(-4)
    }
  });
}
