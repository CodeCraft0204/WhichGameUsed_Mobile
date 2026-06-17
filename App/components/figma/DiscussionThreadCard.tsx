import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  discussionClipLayout,
  discussionIcons,
  defaultThreadAvatar
} from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';

function ClippedThreadIcon({
  left,
  top,
  width,
  height,
  s
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  s: (n: number) => number;
}) {
  const rowWidth = s(discussionClipLayout.threadRowWidth);
  const rowHeight = s(discussionClipLayout.threadRowHeight);

  return (
    <View style={{ width: s(width), height: s(height), overflow: 'hidden' }}>
      <Image
        source={discussionIcons.threadActions}
        style={{
          width: rowWidth,
          height: rowHeight,
          position: 'absolute',
          left: -s(left),
          top: -s(top)
        }}
        resizeMode="stretch"
      />
    </View>
  );
}

type DiscussionThreadCardProps = {
  avatarUrl?: string | null;
  title: string;
  category: string;
  author: string;
  comments: string;
  saved?: boolean;
  onPress?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function DiscussionThreadCard({
  avatarUrl,
  title,
  category,
  author,
  comments,
  saved = false,
  onPress,
  s,
  t
}: DiscussionThreadCardProps) {
  const styles = createStyles(s, t);

  const content = (
    <>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
      ) : (
        <Image source={defaultThreadAvatar} style={styles.avatar} resizeMode="cover" />
      )}

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {category}
            </Text>
          </View>
          <Text style={styles.authorText}>by {author}</Text>
        </View>
      </View>

      <View style={styles.actionsColumn}>
        <View style={styles.actionsDivider} />
        <View style={styles.actionsContent}>
          <ClippedThreadIcon
            s={s}
            left={discussionClipLayout.threadCommentLeft}
            top={discussionClipLayout.threadCommentTop}
            width={discussionClipLayout.threadCommentWidth}
            height={discussionClipLayout.threadCommentHeight}
          />
          <Text style={styles.commentCount}>{comments}</Text>
          <ClippedThreadIcon
            s={s}
            left={discussionClipLayout.threadBookmarkLeft}
            top={discussionClipLayout.threadBookmarkTop}
            width={discussionClipLayout.threadBookmarkWidth}
            height={discussionClipLayout.threadBookmarkHeight}
          />
          {saved ? <Text style={styles.savedMark}>★</Text> : null}
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cardFeaturedBg,
      borderWidth: 1,
      borderColor: figmaColors.cardFeaturedBorder,
      borderRadius: s(14),
      minHeight: s(100),
      marginBottom: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(10),
      paddingLeft: s(10),
      paddingRight: s(8)
    },
    avatar: {
      width: s(76),
      height: s(76),
      borderRadius: s(38),
      flexShrink: 0,
      backgroundColor: figmaColors.surfaceHighlight
    },
    body: {
      flex: 1,
      paddingHorizontal: s(10),
      justifyContent: 'center',
      gap: s(6),
      minWidth: 0
    },
    title: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      lineHeight: t(22),
      color: figmaColors.charcoal
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: s(6)
    },
    categoryTag: {
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.tagBorder,
      borderRadius: s(7),
      paddingHorizontal: s(8),
      paddingVertical: s(3),
      maxWidth: '72%'
    },
    categoryText: {
      fontFamily: appFonts.body,
      fontSize: t(9),
      color: figmaColors.gray
    },
    authorText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray,
      flexShrink: 1
    },
    actionsColumn: {
      width: s(88),
      flexDirection: 'row',
      alignItems: 'stretch'
    },
    actionsDivider: {
      width: 1,
      backgroundColor: figmaColors.metaDivider,
      marginVertical: s(8),
      marginRight: s(8)
    },
    actionsContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: s(4),
      paddingRight: s(2)
    },
    commentCount: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray
    },
    savedMark: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.bronze
    }
  });
}
