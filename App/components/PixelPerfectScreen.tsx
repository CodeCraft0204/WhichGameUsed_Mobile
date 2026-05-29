import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ImageSourcePropType
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PixelPerfectScreenProps = {
  source: ImageSourcePropType;
  frameWidth: number;
  frameHeight: number;
  backgroundColor?: string;
};

export function PixelPerfectScreen({
  source,
  frameWidth,
  frameHeight,
  backgroundColor = '#000000'
}: PixelPerfectScreenProps) {
  const { width: screenWidth } = useWindowDimensions();
  const imageHeight = (screenWidth / frameWidth) * frameHeight;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'bottom']}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: imageHeight }}
      >
        <View style={styles.centerWrap}>
          <Image
            source={source}
            resizeMode="stretch"
            style={{ width: screenWidth, height: imageHeight }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'flex-start'
  }
});
