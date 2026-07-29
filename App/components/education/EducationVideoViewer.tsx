import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appFonts } from '@/constants/appFonts';
import type { EducationVideo } from '@/constants/educationContent';
import { figmaColors } from '@/constants/figmaColors';
import { resolveEducationVideoPlayback } from '@/lib/education-video';

type Props = {
  video: EducationVideo;
  onClose: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function EducationVideoViewer({ video, onClose, s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const playback = useMemo(() => resolveEducationVideoPlayback(video.href), [video.href]);

  const openExternally = () => {
    void Linking.openURL(video.href);
  };

  const embedUri =
    playback.mode === 'youtube'
      ? playback.embedUrl
      : playback.mode === 'webview'
        ? playback.url
        : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={2}>
            {video.publisher || video.channel}
            {video.duration ? ` · ${video.duration}` : ''}
            {video.platform ? ` · ${video.platform}` : ''}
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={s(26)} color={figmaColors.umber} />
        </Pressable>
      </View>

      {embedUri ? (
        <View style={styles.player}>
          {Platform.OS === 'web' ? (
            React.createElement('iframe', {
              title: video.title,
              src: embedUri,
              allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
              allowFullScreen: true,
              style: { width: '100%', height: '100%', border: 'none', background: '#000' }
            })
          ) : (
            <WebView
              source={{ uri: embedUri }}
              style={styles.webview}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              setSupportMultipleWindows={false}
            />
          )}
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Open this video externally</Text>
          <Text style={styles.statusText}>
            This source can’t play inside the app. Continue in your browser or the host’s player.
          </Text>
          <Pressable style={styles.secondaryBtn} onPress={openExternally}>
            <Text style={styles.secondaryBtnText}>OPEN VIDEO</Text>
          </Pressable>
        </View>
      )}

      {embedUri ? (
        <Pressable style={styles.openExternal} onPress={openExternally}>
          <Ionicons name="open-outline" size={s(16)} color={figmaColors.cream} />
          <Text style={styles.openExternalText}>Open in browser</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: s(12),
      paddingHorizontal: s(16),
      paddingVertical: s(12),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.borderLight
    },
    headerText: { flex: 1, gap: s(4) },
    headerTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(13),
      letterSpacing: 0.5,
      color: figmaColors.brown
    },
    headerSubtitle: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      lineHeight: t(16),
      color: figmaColors.brownMuted
    },
    player: { flex: 1, backgroundColor: '#000' },
    webview: { flex: 1, backgroundColor: '#000' },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(12),
      paddingHorizontal: s(24)
    },
    errorTitle: {
      fontFamily: appFonts.display,
      fontSize: t(20),
      color: figmaColors.ink,
      textAlign: 'center'
    },
    statusText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    secondaryBtn: {
      marginTop: s(8),
      backgroundColor: figmaColors.umber,
      borderRadius: s(8),
      paddingHorizontal: s(16),
      paddingVertical: s(10)
    },
    secondaryBtnText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      color: figmaColors.cream,
      letterSpacing: 0.6
    },
    openExternal: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8),
      backgroundColor: figmaColors.umber,
      paddingVertical: s(12),
      paddingHorizontal: s(16)
    },
    openExternalText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      color: figmaColors.cream,
      letterSpacing: 0.5
    }
  });
}
