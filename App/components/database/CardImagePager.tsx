import React, { useMemo, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText, broadsheetAccent } from '@/constants/appTypography';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';

type CardImagePagerProps = {
  frontSource: { uri: string } | number;
  backSource: { uri: string } | number;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function CardImagePager({ frontSource, backSource, s, t }: CardImagePagerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [activeIndex, setActiveIndex] = useState(0);
  const pageWidth = windowWidth - s(32);
  const slides = [
    { key: 'front', label: databaseCopy.frontLabel, source: frontSource },
    { key: 'back', label: databaseCopy.backLabel, source: backSource }
  ];

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    setActiveIndex(index);
  };

  return (
    <View style={styles.wrap}>
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

      <View style={styles.dots}>
        {slides.map((slide, i) => (
          <View key={slide.key} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
      <Text style={styles.hint}>Swipe for front / back</Text>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: { marginBottom: s(18) },
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
