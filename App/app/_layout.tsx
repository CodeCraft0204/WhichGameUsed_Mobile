import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { AuthNavigationGuard } from '@/components/AuthNavigationGuard';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PermanentMarker_400Regular,
    BroadsheetRegular: require('../assets/fonts/Broadsheet-Regular.ttf')
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AuthNavigationGuard>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthNavigationGuard>
    </AuthProvider>
  );
}
