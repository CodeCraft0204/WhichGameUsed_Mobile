import { Stack } from 'expo-router';
import { useFonts as useInterFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import {
  useFonts as useEbgFonts,
  EBGaramond_400Regular,
  EBGaramond_600SemiBold,
  EBGaramond_700Bold
} from '@expo-google-fonts/eb-garamond';
import { useFonts as usePmFonts, PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';

export default function RootLayout() {
  const [interLoaded] = useInterFonts({ Inter_400Regular, Inter_700Bold });
  const [ebgLoaded] = useEbgFonts({ EBGaramond_400Regular, EBGaramond_600SemiBold, EBGaramond_700Bold });
  const [pmLoaded] = usePmFonts({ PermanentMarker_400Regular });

  if (!interLoaded || !ebgLoaded || !pmLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
