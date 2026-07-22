import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  EBGaramond_400Regular,
  EBGaramond_700Bold
} from '@expo-google-fonts/eb-garamond';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppBootstrapGate } from '@/components/AppBootstrapGate';
import { AppSplashScreen } from '@/components/AppSplashScreen';
import { AuthNavigationGuard } from '@/components/AuthNavigationGuard';
import { AuthProvider } from '@/context/AuthContext';
import { PresenceHeartbeat } from '@/components/PresenceHeartbeat';
import { SocialNotificationsProvider } from '@/context/SocialNotificationsContext';
import { SocialNotificationBanner } from '@/components/social/SocialNotificationBanner';
import { useBootstrapProgress } from '@/hooks/useBootstrapProgress';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PermanentMarker_400Regular,
    EBGaramond_400Regular,
    EBGaramond_700Bold,
    BroadsheetRegular: require('../assets/fonts/Broadsheet-Regular.ttf')
  });
  const fontProgress = useBootstrapProgress({ fontsReady: fontsLoaded, authReady: false });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <AppSplashScreen
          progress={fontProgress}
          message="Loading your research world…"
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppBootstrapGate fontsReady={fontsLoaded}>
          <SocialNotificationsProvider>
            <PresenceHeartbeat />
            <AuthNavigationGuard>
              <>
                <Stack screenOptions={{ headerShown: false }} />
                <SocialNotificationBanner />
              </>
            </AuthNavigationGuard>
          </SocialNotificationsProvider>
        </AppBootstrapGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
