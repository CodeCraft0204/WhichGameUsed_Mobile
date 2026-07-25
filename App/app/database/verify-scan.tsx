import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { databaseVerificationHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { assetCodeFromScanPayload } from '@/lib/verification';

export default function VerifyScanScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);

  function onBarcode({ data }: { data: string }) {
    if (locked.current) return;
    const code = assetCodeFromScanPayload(data);
    if (!code) {
      setError('No asset ID found in that QR. Try again.');
      return;
    }
    locked.current = true;
    router.replace(databaseVerificationHref(code));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ProfileSubpageHeader
        title="Scan sticker"
        subtitle="Point at the Which Game Used QR"
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      {!permission?.granted ? (
        <View style={styles.center}>
          <Text style={styles.message}>Camera access is required to scan stickers.</Text>
          <AuthPrimaryButton label="Allow camera" onPress={() => void requestPermission()} />
        </View>
      ) : (
        <View style={styles.cameraWrap}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={onBarcode}
          />
          <View style={styles.frame} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            style={styles.cancel}
            onPress={() => {
              locked.current = false;
              setError(null);
            }}
          >
            <Text style={styles.cancelText}>Reset scanner</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.parchment },
    center: { flex: 1, padding: s(20), justifyContent: 'center', gap: s(16) },
    message: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    cameraWrap: {
      flex: 1,
      margin: s(16),
      borderRadius: s(16),
      overflow: 'hidden',
      backgroundColor: '#000'
    },
    frame: {
      position: 'absolute',
      top: '25%',
      left: '15%',
      right: '15%',
      bottom: '35%',
      borderWidth: 2,
      borderColor: '#fff',
      borderRadius: s(12)
    },
    error: {
      position: 'absolute',
      bottom: s(72),
      left: s(16),
      right: s(16),
      textAlign: 'center',
      color: '#fff',
      fontFamily: appFonts.bodyBold,
      fontSize: t(14)
    },
    cancel: {
      position: 'absolute',
      bottom: s(24),
      alignSelf: 'center',
      padding: s(10)
    },
    cancelText: {
      color: '#fff',
      fontFamily: appFonts.bodyBold,
      fontSize: t(14),
      textDecorationLine: 'underline'
    }
  });
}
