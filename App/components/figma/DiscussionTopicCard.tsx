import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View } from 'react-native';
import { discussionClipLayout, discussionIcons, type DiscussionTopic } from '@/constants/discussionContent';
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

type DiscussionTopicCardProps = DiscussionTopic & {
  s: (n: number) => number;
  t: (n: number) => number;
};

export function DiscussionTopicCard({
  icon,
  title,
  description,
  followers,
  threads,
  s,
  t
}: DiscussionTopicCardProps) {
  const styles = createStyles(s, t);
  const iconSize = s(86);

  return (
    <View style={styles.card}>
      <Image source={icon} style={[styles.topicIcon, { width: iconSize, height: iconSize }]} resizeMode="contain" />

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.metaColumn}>
        <View style={styles.metaDivider} />
        <View style={styles.metaContent}>
          <View style={styles.metaRow}>
            <Image source={discussionIcons.metaFollowers} style={styles.metaIcon} resizeMode="contain" />
            <Text style={styles.metaText}>{followers}</Text>
          </View>
          <View style={styles.metaRow}>
            <ClippedThreadIcon
              s={s}
              left={discussionClipLayout.threadCommentLeft}
              top={discussionClipLayout.threadCommentTop}
              width={discussionClipLayout.threadCommentWidth}
              height={discussionClipLayout.threadCommentHeight}
            />
            <Text style={styles.metaText}>{threads}</Text>
          </View>
        </View>
        <Image source={discussionIcons.cardChevron} style={styles.cardChevron} resizeMode="contain" />
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cardFeaturedBg,
      borderWidth: 1,
      borderColor: figmaColors.cardFeaturedBorder,
      borderRadius: s(16),
      minHeight: s(118),
      marginBottom: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(10),
      paddingLeft: s(10),
      paddingRight: s(8)
    },
    topicIcon: {
      flexShrink: 0
    },
    body: {
      flex: 1,
      paddingHorizontal: s(10),
      justifyContent: 'center',
      gap: s(4),
      minWidth: 0
    },
    title: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      lineHeight: t(20),
      color: figmaColors.charcoal
    },
    description: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(18),
      color: figmaColors.gray
    },
    metaColumn: {
      width: s(148),
      flexDirection: 'row',
      alignItems: 'stretch',
      position: 'relative'
    },
    metaDivider: {
      width: 1,
      backgroundColor: figmaColors.metaDivider,
      marginVertical: s(6),
      marginRight: s(10)
    },
    metaContent: {
      flex: 1,
      justifyContent: 'center',
      gap: s(8),
      paddingRight: s(12)
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    metaIcon: {
      width: s(16),
      height: s(16)
    },
    metaText: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(15),
      color: figmaColors.gray
    },
    cardChevron: {
      position: 'absolute',
      right: 0,
      top: '50%',
      marginTop: s(-8),
      width: s(9),
      height: s(15)
    }
  });
}
