import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType
} from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { pickResponseGif } from '@/constants/responseGifs';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

const DEFAULT_MS = 2400;

type Props = {
  visible: boolean;
  onDone: () => void;
  /** Prefer affirming clips for gifts / approvals. */
  mood?: 'success' | 'any';
  /** Override source; otherwise a random catalog GIF is picked when shown. */
  source?: ImageSourcePropType;
  label?: string;
  durationMs?: number;
};

/**
 * Full-screen reaction GIF after a successful action (Donut gift, submit, etc.).
 * Tap anywhere to dismiss early.
 */
export function ResponseGifOverlay({
  visible,
  onDone,
  mood = 'success',
  source,
  label,
  durationMs = DEFAULT_MS
}: Props) {
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [picked, setPicked] = useState(() => pickResponseGif(mood));
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!visible) return;
    if (!source) setPicked(pickResponseGif(mood));
    const id = setTimeout(() => doneRef.current(), durationMs);
    return () => clearTimeout(id);
  }, [visible, mood, source, durationMs]);

  if (!visible) return null;

  const img = source ?? picked.source;
  const caption = label ?? picked.label;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDone} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onDone} accessibilityRole="button" accessibilityLabel="Dismiss">
        <View style={styles.card}>
          <Image source={img} style={styles.gif} resizeMode="contain" />
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
      </Pressable>
    </Modal>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(20, 16, 12, 0.72)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(24)
    },
    card: {
      width: '100%',
      maxWidth: s(340),
      borderRadius: s(16),
      overflow: 'hidden',
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      paddingBottom: s(12),
      alignItems: 'center'
    },
    gif: {
      width: '100%',
      height: s(220),
      backgroundColor: figmaColors.black
    },
    caption: {
      marginTop: s(10),
      fontFamily: appFonts.accent,
      fontSize: t(13),
      letterSpacing: 0.8,
      color: figmaColors.charcoal,
      textTransform: 'uppercase'
    }
  });
}
