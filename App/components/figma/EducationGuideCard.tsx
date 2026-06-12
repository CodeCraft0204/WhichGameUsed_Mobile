import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View } from 'react-native';
import { educationIcons, type EducationGuide } from '@/constants/educationContent';
import { figmaColors } from '@/constants/figmaColors';

type EducationGuideCardProps = EducationGuide & {
  s: (n: number) => number;
  t: (n: number) => number;
};

export function EducationGuideCard({ image, title, description, meta, s, t }: EducationGuideCardProps) {
  const styles = createStyles(s, t);
  const iconWidth = s(28);
  const iconHeight = s(32);

  return (
    <View style={styles.card}>
      <View style={[styles.pdfBadge, { width: iconWidth, height: iconHeight + s(10) }]}>
        <Image
          source={educationIcons.pdfIcon}
          style={{ width: iconWidth, height: iconHeight }}
          resizeMode="contain"
        />
      </View>

      <View style={styles.imageWrap}>
        <Image source={image} style={styles.guideImage} resizeMode="contain" />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.meta}>{meta}</Text>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      width: s(230),
      minHeight: s(367),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      paddingHorizontal: s(12),
      paddingBottom: s(12),
      overflow: 'hidden'
    },
    pdfBadge: {
      marginTop: s(10),
      alignItems: 'center',
      justifyContent: 'flex-start',
      alignSelf: 'flex-start',
      overflow: 'hidden'
    },
    pdfLabel: {
      marginTop: s(2),
      fontFamily: appFonts.body,
      fontSize: t(8),
      lineHeight: t(9),
      color: figmaColors.accent,
      textAlign: 'center'
    },
    imageWrap: {
      width: '100%',
      height: s(148),
      marginTop: s(6),
      alignItems: 'center',
      justifyContent: 'center'
    },
    guideImage: {
      width: '100%',
      height: '100%'
    },
    title: {
      marginTop: s(8),
      fontFamily: appFonts.body,
      fontSize: t(22),
      lineHeight: t(28),
      color: figmaColors.charcoal
    },
    description: {
      marginTop: s(8),
      fontFamily: appFonts.body,
      fontSize: t(17),
      lineHeight: t(21),
      color: figmaColors.gray
    },
    meta: {
      marginTop: s(10),
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    }
  });
}
