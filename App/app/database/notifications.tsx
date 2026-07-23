import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { socialNotificationsHref } from '@/constants/navigation';

/** Legacy route — redirects to the canonical full notification log. */
export default function DatabaseNotificationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(socialNotificationsHref());
  }, [router]);

  return null;
}
