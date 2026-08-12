import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType
} from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText, broadsheetAccent } from '@/constants/appTypography';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';

type CardImagePagerProps = {
  frontSource: ImageSourcePropType;
  backSource: ImageSourcePropType;
  hasFrontImage?: boolean;
  hasBackImage?: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
};

function NoImagePlaceholder({ s, t }: { s: (n: number) => number; t: (n: number) => number }) {
  const styles = useMemo(() => createPlaceholderStyles(s, t), [s, t]);
  return (
    <View style={styles.wrap}>
      <View style={styles.box}>
        <Ionicons name="image-outline" size={s(32)} color={figmaColors.bronze} />
        <Text style={styles.label}>No card image on file</Text>
        <Text style={styles.hint}>Reference images can be added from the admin portal.</Text>
      </View>
    </View>
  );
}

export function CardImagePager({
  frontSource,
  backSource,
  hasFrontImage = true,
  hasBackImage = true,
  s,
  t
}: CardImagePagerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [activeIndex, setActiveIndex] = useState(0);
  const pageWidth = windowWidth - s(32);

  if (!hasFrontImage && !hasBackImage) {
    return <NoImagePlaceholder s={s} t={t} />;
  }

  const slides = [
    ...(hasFrontImage
      ? [{ key: 'front' as const, label: databaseCopy.frontLabel, source: frontSource }]
      : []),
    ...(hasBackImage
      ? [{ key: 'back' as const, label: databaseCopy.backLabel, source: backSource }]
      : [])
  ];

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (slides.length < 2) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    setActiveIndex(index);
  };

  return (
    <View style={styles.wrap}>
      {slides.length > 1 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          decelerationRate="fast"
          snapToInterval={pageWidth}
          snapToAlignment="start"
          contentContainerStyle={styles.scrollContent}
        >
          {slides.map((slide) => (
            <View key={slide.key} style={[styles.page, { width: pageWidth }]}>
              <Text style={styles.label}>{slide.label}</Text>
              <Image source={slide.source} style={styles.image} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.page, { width: pageWidth }]}>
          <Text style={styles.label}>{slides[0].label}</Text>
          <Image source={slides[0].source} style={styles.image} resizeMode="contain" />
        </View>
      )}

      {slides.length > 1 ? (
        <>
          <View style={styles.dots}>
            {slides.map((slide, i) => (
              <View key={slide.key} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>
          <Text style={styles.hint}>Swipe for front / back</Text>
        </>
      ) : null}
    </View>
  );
}

function createPlaceholderStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    wrap: { marginBottom: s(8) },
    box: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6),
      minHeight: s(100),
      maxHeight: s(120),
      paddingVertical: s(16),
      paddingHorizontal: s(20),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.surfaceMuted
    },
    label: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.brown,
      letterSpacing: 0.6,
      textTransform: 'uppercase'
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(18),
      color: figmaColors.textMuted,
      textAlign: 'center'
    }
  });
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: { marginBottom: s(12) },
    scrollContent: { alignItems: 'center' },
    page: { alignItems: 'center' },
    label: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: figmaColors.gray,
      marginBottom: s(6),
      alignSelf: 'flex-start',
      ...broadsheetAccent,
      letterSpacing: 1
    },
    image: {
      width: '100%',
      maxHeight: s(340),
      aspectRatio: 3 / 4,
      borderRadius: s(12),
      backgroundColor: figmaColors.divider,
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: s(6),
      marginTop: s(10)
    },
    dot: {
      width: s(7),
      height: s(7),
      borderRadius: s(4),
      backgroundColor: figmaColors.borderLight
    },
    dotActive: { backgroundColor: figmaColors.charcoal },
    hint: {
      marginTop: s(6),
      textAlign: 'center',
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.textMuted
    }
  });
}
