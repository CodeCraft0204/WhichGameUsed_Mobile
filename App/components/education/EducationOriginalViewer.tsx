import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appFonts } from '@/constants/appFonts';
import type { EducationDocument } from '@/constants/educationDocuments';
import { figmaColors } from '@/constants/figmaColors';
import {
  pdfViewerHtml,
  resolveEducationDocument,
  toContentUriIfNeeded,
  type ResolvedDocumentSource
} from '@/lib/education-document-source';

type Props = {
  document: EducationDocument;
  onClose: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
  /** Optional remote/original image override (timeline). */
  imageOverride?: ImageSourcePropType | { uri: string } | null;
};

type LoadState =
  | { status: 'loading'; message: string }
  | {
      status: 'ready';
      source: ResolvedDocumentSource;
      pdfBase64?: string;
      preferExternal?: boolean;
    }
  | { status: 'error'; message: string };

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

function clampZoom(value: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100));
}

export function EducationOriginalViewer({ document, onClose, s, t, imageOverride }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const { width: windowWidth } = useWindowDimensions();
  const webRef = useRef<WebView>(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const panStart = useRef({ x: 0, y: 0 });
  const [load, setLoad] = useState<LoadState>({
    status: 'loading',
    message: 'Preparing original…'
  });
  const [zoom, setZoom] = useState(ZOOM_MIN);

  useEffect(() => {
    setZoom(ZOOM_MIN);
    pan.setValue({ x: 0, y: 0 });
    panStart.current = { x: 0, y: 0 };
  }, [document.id, imageOverride, pan]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
        onPanResponderGrant: () => {
          panStart.current = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            x: (pan.x as any)._value ?? 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            y: (pan.y as any)._value ?? 0
          };
        },
        onPanResponderMove: (_, g) => {
          pan.setValue({
            x: panStart.current.x + g.dx,
            y: panStart.current.y + g.dy
          });
        }
      }),
    [pan]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (imageOverride) {
          if (!cancelled) {
            setLoad({
              status: 'ready',
              source:
                typeof imageOverride === 'object' && 'uri' in imageOverride && imageOverride.uri
                  ? { kind: 'image', uri: imageOverride.uri }
                  : { kind: 'image', imageSource: imageOverride as ImageSourcePropType }
            });
          }
          return;
        }

        setLoad({ status: 'loading', message: 'Loading document…' });
        const source = await resolveEducationDocument(document);
        if (cancelled) return;

        if (source.kind === 'unavailable') {
          setLoad({ status: 'error', message: source.reason });
          return;
        }

        if (source.kind === 'image') {
          setLoad({ status: 'ready', source });
          return;
        }

        // PDF path
        if (!source.local && source.uri.startsWith('http')) {
          setLoad({ status: 'ready', source });
          return;
        }

        // Web: Metro serves bundled assets as http(s) URLs. expo-file-system native
        // APIs (getInfoAsync / readAsStringAsync) are unavailable — never call them.
        if (Platform.OS === 'web') {
          setLoad({ status: 'ready', source: { ...source, local: false } });
          return;
        }

        // Android: large bundled PDFs (e.g. Babe Ruth ~24MB) should not be base64'd into JS.
        // Prefer PDF.js for smaller files; otherwise present one-tap system viewer.
        const info = await FileSystem.getInfoAsync(source.uri);
        const size = info.exists && 'size' in info ? Number(info.size ?? 0) : 0;
        const LARGE_PDF_BYTES = 10 * 1024 * 1024;
        if (Platform.OS === 'android' && size > LARGE_PDF_BYTES) {
          setLoad({ status: 'ready', source, preferExternal: true });
          return;
        }

        // Prefer in-app PDF.js when practical (remote or smaller local files).
        if (Platform.OS === 'ios' && source.local) {
          setLoad({ status: 'ready', source });
          return;
        }

        setLoad({ status: 'loading', message: 'Preparing PDF for viewing…' });
        const base64 = await FileSystem.readAsStringAsync(source.uri, {
          encoding: FileSystem.EncodingType.Base64
        });
        if (cancelled) return;
        setLoad({ status: 'ready', source, pdfBase64: base64 });
      } catch (err) {
        if (cancelled) return;
        setLoad({
          status: 'error',
          message: err instanceof Error ? err.message : 'Could not open this document.'
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [document, imageOverride]);

  const openExternally = useCallback(async () => {
    if (load.status !== 'ready' || load.source.kind !== 'pdf') return;
    try {
      if (Platform.OS === 'web') {
        await Linking.openURL(load.source.uri);
        return;
      }
      const uri = await toContentUriIfNeeded(load.source.uri);
      await Linking.openURL(uri);
    } catch {
      // ignore
    }
  }, [load]);

  const applyPdfZoom = useCallback(
    (next: number) => {
      const z = clampZoom(next);
      setZoom(z);
      webRef.current?.injectJavaScript(
        `if (window.WGU_setZoom) window.WGU_setZoom(${z}); true;`
      );
    },
    []
  );

  const zoomIn = useCallback(() => {
    if (load.status !== 'ready') return;
    if (load.source.kind === 'pdf' && !load.preferExternal && !(Platform.OS === 'web')) {
      applyPdfZoom(zoom + ZOOM_STEP);
      return;
    }
    if (load.source.kind === 'pdf' && Platform.OS === 'web') {
      setZoom((z) => clampZoom(z + ZOOM_STEP));
      return;
    }
    setZoom((z) => clampZoom(z + ZOOM_STEP));
  }, [applyPdfZoom, load, zoom]);

  const zoomOut = useCallback(() => {
    if (load.status !== 'ready') return;
    if (load.source.kind === 'pdf' && !load.preferExternal && !(Platform.OS === 'web')) {
      applyPdfZoom(zoom - ZOOM_STEP);
      return;
    }
    if (load.source.kind === 'pdf' && Platform.OS === 'web') {
      setZoom((z) => clampZoom(z - ZOOM_STEP));
      return;
    }
    setZoom((z) => clampZoom(z - ZOOM_STEP));
  }, [applyPdfZoom, load, zoom]);

  const zoomReset = useCallback(() => {
    if (load.status !== 'ready') return;
    if (load.source.kind === 'pdf' && !load.preferExternal && Platform.OS !== 'web') {
      applyPdfZoom(ZOOM_MIN);
      return;
    }
    setZoom(ZOOM_MIN);
  }, [applyPdfZoom, load]);

  const onWebLoadEnd = useCallback(() => {
    if (load.status !== 'ready' || load.source.kind !== 'pdf') return;
    if (load.pdfBase64) {
      const payload = JSON.stringify(load.pdfBase64);
      webRef.current?.injectJavaScript(
        `window.WGU_PDF_BASE64 = ${payload}; if (window.WGU_loadPdfBase64) window.WGU_loadPdfBase64(window.WGU_PDF_BASE64); if (window.WGU_setZoom) window.WGU_setZoom(${zoom}); true;`
      );
      return;
    }
    if (load.source.uri.startsWith('http')) {
      const payload = JSON.stringify(load.source.uri);
      webRef.current?.injectJavaScript(
        `window.WGU_PDF_URL = ${payload}; if (window.WGU_loadPdfUrl) window.WGU_loadPdfUrl(window.WGU_PDF_URL); if (window.WGU_setZoom) window.WGU_setZoom(${zoom}); true;`
      );
    }
  }, [load, zoom]);

  const imageSource: ImageSourcePropType | null =
    load.status === 'ready' && load.source.kind === 'image'
      ? load.source.imageSource
        ? load.source.imageSource
        : load.source.uri
          ? { uri: load.source.uri }
          : null
      : null;

  const imageBaseWidth = Math.max(windowWidth - s(24), s(280));
  const imageBaseHeight = s(420);
  const isPdfJsViewer =
    load.status === 'ready' &&
    load.source.kind === 'pdf' &&
    !load.preferExternal &&
    !(Platform.OS === 'ios' && load.source.local && !load.pdfBase64);
  const showZoomBar =
    load.status === 'ready' &&
    ((load.source.kind === 'image' && Boolean(imageSource)) ||
      isPdfJsViewer ||
      (load.source.kind === 'pdf' && Platform.OS === 'web' && !load.preferExternal));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {document.title}
          </Text>
          {document.subtitle ? (
            <Text style={styles.headerSubtitle} numberOfLines={3}>
              {document.subtitle}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={s(26)} color={figmaColors.umber} />
        </Pressable>
      </View>

      {showZoomBar ? (
        <View style={styles.zoomBar}>
          <Pressable
            onPress={zoomOut}
            disabled={zoom <= ZOOM_MIN}
            style={({ pressed }) => [
              styles.zoomBtn,
              zoom <= ZOOM_MIN ? styles.zoomBtnDisabled : null,
              pressed && zoom > ZOOM_MIN ? styles.zoomBtnPressed : null
            ]}
            accessibilityRole="button"
            accessibilityLabel="Zoom out"
          >
            <Ionicons name="remove" size={s(18)} color={figmaColors.cream} />
          </Pressable>
          <Pressable onPress={zoomReset} accessibilityRole="button" accessibilityLabel="Reset zoom">
            <Text style={styles.zoomLabel}>{Math.round(zoom * 100)}%</Text>
          </Pressable>
          <Pressable
            onPress={zoomIn}
            disabled={zoom >= ZOOM_MAX}
            style={({ pressed }) => [
              styles.zoomBtn,
              zoom >= ZOOM_MAX ? styles.zoomBtnDisabled : null,
              pressed && zoom < ZOOM_MAX ? styles.zoomBtnPressed : null
            ]}
            accessibilityRole="button"
            accessibilityLabel="Zoom in"
          >
            <Ionicons name="add" size={s(18)} color={figmaColors.cream} />
          </Pressable>
        </View>
      ) : null}

      {load.status === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator color={figmaColors.umber} />
          <Text style={styles.statusText}>{load.message}</Text>
        </View>
      ) : null}

      {load.status === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Could not open original</Text>
          <Text style={styles.statusText}>{load.message}</Text>
          <Pressable style={styles.secondaryBtn} onPress={onClose}>
            <Text style={styles.secondaryBtnText}>Close</Text>
          </Pressable>
        </View>
      ) : null}

      {load.status === 'ready' && load.source.kind === 'image' && imageSource ? (
        <View style={styles.flex}>
          <View style={styles.imageStage} {...panResponder.panHandlers}>
            <Animated.Image
              source={imageSource}
              style={{
                width: imageBaseWidth * zoom,
                height: imageBaseHeight * zoom,
                backgroundColor: figmaColors.cream,
                transform: [{ translateX: pan.x }, { translateY: pan.y }]
              }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.hint}>Use + / − to zoom. Drag to pan around the image.</Text>
        </View>
      ) : null}

      {load.status === 'ready' && load.source.kind === 'pdf' ? (
        <View style={styles.pdfWrap}>
          {load.preferExternal ? (
            <View style={styles.center}>
              <Text style={styles.errorTitle}>Original PDF ready</Text>
              <Text style={styles.statusText}>
                This guide is a large document. Open it in your device PDF viewer for the best
                reading experience — pinch, search, and page jump all work there.
              </Text>
              <Pressable style={styles.secondaryBtn} onPress={() => void openExternally()}>
                <Text style={styles.secondaryBtnText}>OPEN ORIGINAL PDF</Text>
              </Pressable>
            </View>
          ) : Platform.OS === 'web' ? (
            // Serve from /public so Content-Type is application/pdf (Metro asset URLs fail).
            <View style={styles.webview}>
              <ScrollView
                style={styles.flex}
                contentContainerStyle={{
                  width: `${100 * zoom}%` as unknown as number,
                  height: `${100 * zoom}%` as unknown as number,
                  minHeight: '100%' as unknown as number
                }}
              >
                {React.createElement('iframe', {
                  title: document.title,
                  src: load.source.uri,
                  style: {
                    width: '100%',
                    height: '100%',
                    minHeight: 640,
                    border: 'none',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left'
                  }
                })}
              </ScrollView>
            </View>
          ) : Platform.OS === 'ios' && load.source.local && !load.pdfBase64 ? (
            <WebView
              originWhitelist={['*']}
              allowFileAccess
              allowUniversalAccessFromFileURLs
              source={{ uri: load.source.uri }}
              style={styles.webview}
              scalesPageToFit
            />
          ) : (
            <WebView
              ref={webRef}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              mixedContentMode="always"
              onLoadEnd={onWebLoadEnd}
              source={{ html: pdfViewerHtml(document.title), baseUrl: 'https://cdnjs.cloudflare.com' }}
              style={styles.webview}
              scalesPageToFit
              setBuiltInZoomControls
              setDisplayZoomControls={false}
            />
          )}
          {!load.preferExternal ? (
            <Pressable style={styles.openExternal} onPress={() => void openExternally()}>
              <Ionicons name="share-outline" size={s(16)} color={figmaColors.cream} />
              <Text style={styles.openExternalText}>
                {Platform.OS === 'web' ? 'Open in new tab' : 'Open in system PDF viewer'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    flex: { flex: 1 },
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
    zoomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(16),
      paddingVertical: s(8),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream
    },
    zoomBtn: {
      width: s(36),
      height: s(36),
      borderRadius: s(8),
      backgroundColor: figmaColors.umber,
      alignItems: 'center',
      justifyContent: 'center'
    },
    zoomBtnPressed: { opacity: 0.85 },
    zoomBtnDisabled: { opacity: 0.4 },
    zoomLabel: {
      minWidth: s(56),
      textAlign: 'center',
      fontFamily: appFonts.accent,
      fontSize: t(13),
      letterSpacing: 0.4,
      color: figmaColors.brown
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(12),
      paddingHorizontal: s(24)
    },
    statusText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    errorTitle: {
      fontFamily: appFonts.display,
      fontSize: t(20),
      color: figmaColors.ink,
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
    scrollContent: { padding: s(12), alignItems: 'center' },
    imageStage: {
      flex: 1,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: figmaColors.background
    },
    imageScrollInner: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: s(12)
    },
    hint: {
      marginTop: s(8),
      marginBottom: s(10),
      paddingHorizontal: s(16),
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.brownMuted,
      textAlign: 'center'
    },
    pdfWrap: { flex: 1 },
    webview: { flex: 1, backgroundColor: figmaColors.background },
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
