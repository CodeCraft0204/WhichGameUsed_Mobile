import { Redirect, useLocalSearchParams } from 'expo-router';
import { databaseVerificationHref } from '@/constants/navigation';

/** Universal-link / path alias for portal `/v/:code` → in-app verification. */
export default function PublicVerifyDeepLinkScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  if (!code || typeof code !== 'string') {
    return <Redirect href="/database/verify" />;
  }
  return <Redirect href={databaseVerificationHref(code)} />;
}
