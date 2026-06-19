import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { discussionIcons } from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';

type DiscussionThreadCardProps = {
  avatarUrl?: string | null;
  authorName: string;
  title: string;
  category: string;
  author: string;
  comments: string;
  votes: string;
  saved?: boolean;
  onPress?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function DiscussionThreadCard({
  avatarUrl,
  authorName,
  title,
  category,
  author,
  comments,
  votes,
  saved = false,
  onPress,
  s,
  t
}: DiscussionThreadCardProps) {
  const styles = createStyles(s, t);
  const avatarSize = s(76);
  const actionIconSize = s(16);

  const content = (
    <>
      <ProfileAvatar url={avatarUrl ?? null} name={authorName} size={avatarSize} />

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {category}
            </Text>
          </View>
          <Text style={styles.authorText} numberOfLines={1}>
            by {author}
          </Text>
        </View>
      </View>

      <View style={styles.actionsColumn}>
        <View style={styles.actionsDivider} />
        <View style={styles.actionsContent}>
          <Image
            source={discussionIcons.threadLike}
            style={{ width: actionIconSize, height: actionIconSize }}
            resizeMode="contain"
          />
          <Text style={styles.metaCount}>{votes}</Text>
          <Image
            source={discussionIcons.threadComment}
            style={{ width: actionIconSize, height: actionIconSize }}
            resizeMode="contain"
          />
          <Text style={styles.metaCount}>{comments}</Text>
          <Image
            source={discussionIcons.threadBookmark}
            style={[
              { width: actionIconSize, height: actionIconSize },
              !saved && styles.bookmarkMuted
            ]}
            resizeMode="contain"
          />
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
      gap: s(6),
      minWidth: 0
    },
    categoryTag: {
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.tagBorder,
      borderRadius: s(7),
      paddingHorizontal: s(8),
      paddingVertical: s(3),
      flexShrink: 1,
      maxWidth: '58%'
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
      flex: 1,
      flexShrink: 1
    },
    actionsColumn: {
      width: s(96),
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
    metaCount: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray,
      marginRight: s(2)
    },
    bookmarkMuted: {
      opacity: 0.35
    }
  });
}
