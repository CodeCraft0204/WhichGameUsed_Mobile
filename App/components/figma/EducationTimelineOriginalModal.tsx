import React, { useMemo } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';

type Props = {
  visible: boolean;
  onClose: () => void;
  imageSource: ImageSourcePropType | null;
  title: string;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function EducationTimelineOriginalModal({
  visible,
  onClose,
  imageSource,
  title,
  s,
  t
}: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {title}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close original timeline"
          >
            <Ionicons name="close" size={s(26)} color={figmaColors.umber} />
          </Pressable>
        </View>
        {imageSource ? (
          <ScrollView
            maximumZoomScale={4}
            minimumZoomScale={1}
            contentContainerStyle={styles.scrollContent}
            centerContent
          >
            <ScrollView horizontal maximumZoomScale={4} minimumZoomScale={1}>
              <Image source={imageSource} style={styles.image} resizeMode="contain" />
            </ScrollView>
            <Text style={styles.hint}>Pinch or scroll to explore the original timeline.</Text>
          </ScrollView>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Original timeline unavailable</Text>
            <Text style={styles.emptyBody}>
              The interactive timeline above is the primary experience. The landscape reference image
              will appear here when hosted.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: figmaColors.background
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12),
      paddingHorizontal: s(16),
      paddingVertical: s(12),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.borderLight
    },
    headerTitle: {
      flex: 1,
      fontFamily: appFonts.accent,
      fontSize: t(13),
      letterSpacing: 0.6,
      color: figmaColors.brown
    },
    scrollContent: {
      padding: s(12),
      alignItems: 'center'
    },
    image: {
      width: s(900),
      height: s(420),
      backgroundColor: figmaColors.cream
    },
    hint: {
      marginTop: s(12),
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.brownMuted,
      textAlign: 'center'
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: s(24),
      gap: s(8)
    },
    emptyTitle: {
      fontFamily: appFonts.display,
      fontSize: t(20),
      color: figmaColors.ink,
      textAlign: 'center'
    },
    emptyBody: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(21),
      color: figmaColors.charcoal,
      textAlign: 'center'
    }
  });
}
