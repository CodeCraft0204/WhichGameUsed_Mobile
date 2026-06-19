import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { formatVoteScore } from '@/constants/discussionContent';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { discussionIcons } from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';

type ThreadEngagementBarProps = {
  voteScore: number;
  userVote: 'upvote' | 'downvote' | null;
  onUpvote: () => void;
  onDownvote: () => void;
  saved: boolean;
  onSave: () => void;
  onMore: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  s: (n: number) => number;
  t: (n: number) => number;
};

const VOTE_ICON = { width: 16, height: 14 };

export function ThreadEngagementBar({
  voteScore,
  userVote,
  onUpvote,
  onDownvote,
  saved,
  onSave,
  onMore,
  disabled = false,
  style,
  s,
  t
}: ThreadEngagementBarProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const iconW = s(VOTE_ICON.width);
  const iconH = s(VOTE_ICON.height);
  const scoreLabel = formatVoteScore(voteScore);

  return (
    <View style={[styles.wrap, style]}>
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
          {scoreLabel}
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
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      alignSelf: 'flex-start',
      flexWrap: 'wrap',
      gap: s(6),
      width: '100%'
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
      minWidth: s(28),
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
