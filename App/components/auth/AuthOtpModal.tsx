import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthOtpHelperRow } from '@/components/auth/AuthOtpHelperRow';
import { AuthOtpInput } from '@/components/auth/AuthOtpInput';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';
import { MOBILE_OTP_LENGTH } from '@/lib/mobile-auth';

type AuthOtpModalProps = {
  visible: boolean;
  title: string;
  message?: string | null;
  confirmLabel: string;
  resendLabel: string;
  changeEmailLabel: string;
  otp: string;
  onChangeOtp: (value: string) => void;
  onConfirm: () => void | Promise<void>;
  onResend: () => void | Promise<void>;
  onChangeEmail: () => void;
  onRequestClose?: () => void;
  error?: string | null;
  loading?: boolean;
};

export function AuthOtpModal({
  visible,
  title,
  message,
  confirmLabel,
  resendLabel,
  changeEmailLabel,
  otp,
  onChangeOtp,
  onConfirm,
  onResend,
  onChangeEmail,
  onRequestClose,
  error,
  loading
}: AuthOtpModalProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const canConfirm = otp.trim().length >= MOBILE_OTP_LENGTH && !loading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel="Dismiss verification"
          onPress={onRequestClose}
        />
        <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.panelSafe}>
          <View style={styles.panel}>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <AuthErrorBanner message={error ?? null} />
            <AuthOtpInput
              key={visible ? 'otp-open' : 'otp-closed'}
              value={otp}
              onChangeValue={onChangeOtp}
              editable={!loading}
              autoFocus
              onComplete={() => canConfirm && void onConfirm()}
            />
            <AuthOtpHelperRow
              resendLabel={resendLabel}
              changeEmailLabel={changeEmailLabel}
              onResend={onResend}
              onChangeEmail={onChangeEmail}
              disabled={loading}
            />
            <AuthPrimaryButton
              label={confirmLabel}
              disabled={!canConfirm}
              loading={loading}
              onPress={onConfirm}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end'
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)'
    },
    panelSafe: {
      width: '100%',
      justifyContent: 'center'
    },
    panel: {
      marginHorizontal: s(16),
      paddingHorizontal: s(20),
      paddingTop: s(20),
      paddingBottom: s(22),
      borderRadius: s(16),
      borderWidth: 1,
      borderColor: 'rgba(212, 206, 200, 0.8)',
      backgroundColor: 'rgba(245, 245, 240, 1)'
    },
    title: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(22),
      lineHeight: t(28),
      color: figmaColors.black,
      textAlign: 'center',
      letterSpacing: 0.6,
      marginBottom: s(8)
    },
    message: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.gray,
      textAlign: 'center',
      marginBottom: s(14)
    }
  });
}
