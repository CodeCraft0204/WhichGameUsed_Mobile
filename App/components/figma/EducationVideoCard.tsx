import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View } from 'react-native';
import { educationIcons, type EducationVideo } from '@/constants/educationContent';
import { figmaColors } from '@/constants/figmaColors';

type EducationVideoCardProps = EducationVideo & {
  s: (n: number) => number;
  t: (n: number) => number;
};

function MenuDots({ s }: { s: (n: number) => number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4) }}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={{
            width: s(4),
            height: s(4),
            borderRadius: s(2),
            backgroundColor: figmaColors.gray
          }}
        />
      ))}
    </View>
  );
}

export function EducationVideoCard({
  thumb,
  title,
  channel,
  duration,
  platform,
  s,
  t
}: EducationVideoCardProps) {
  const styles = createStyles(s, t);

  return (
    <View style={styles.card}>
      <View style={styles.thumbWrap}>
        <Image source={thumb} style={styles.thumb} resizeMode="cover" />
        <View style={styles.playOverlay}>
          <Image source={educationIcons.playButton} style={styles.playButton} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.channel}>{channel}</Text>
        <Text style={styles.duration}>{duration}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionsRow}>
          <Text style={styles.platform} numberOfLines={1}>
            {platform}
          </Text>
          <MenuDots s={s} />
        </View>
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      minHeight: s(112),
      marginBottom: s(10),
      paddingVertical: s(8),
      paddingHorizontal: s(8),
      gap: s(10)
    },
    thumbWrap: {
      width: s(168),
      height: s(96),
      borderRadius: s(8),
      overflow: 'hidden',
      flexShrink: 0,
      backgroundColor: figmaColors.surfaceHighlight
    },
    thumb: {
      width: '100%',
      height: '100%'
    },
    playOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center'
    },
    playButton: {
      width: s(40),
      height: s(40)
    },
    body: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: s(4),
      paddingRight: s(4)
    },
    title: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      marginRight: s(20),
      lineHeight: t(22),
      color: figmaColors.charcoal
    },
    channel: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(16),
      color: figmaColors.gray
    },
    duration: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(16),
      color: figmaColors.gray
    },
    actions: {
      width: s(108),
      justifyContent: 'center',
      flexShrink: 0
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: s(8)
    },
    platform: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(16),
      color: figmaColors.gray,
      textAlign: 'right',
      flexShrink: 1
    }
  });
}
