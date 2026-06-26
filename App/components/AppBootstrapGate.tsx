import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, type ReactNode } from 'react';
import { AppSplashScreen } from '@/components/AppSplashScreen';
import { useAuth } from '@/context/AuthContext';
import { useBootstrapProgress } from '@/hooks/useBootstrapProgress';

type Props = {
  fontsReady: boolean;
  children: ReactNode;
};

void SplashScreen.preventAutoHideAsync().catch(() => {});

export function AppBootstrapGate({ fontsReady, children }: Props) {
  const { loading: authLoading } = useAuth();
  const authReady = !authLoading;
  const workReady = fontsReady && authReady;
  const progress = useBootstrapProgress({ fontsReady, authReady });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!workReady) return;

    const timeout = setTimeout(() => {
      void SplashScreen.hideAsync().finally(() => setDismissed(true));
    }, 350);

    return () => clearTimeout(timeout);
  }, [workReady]);

  if (!dismissed) {
    const message = workReady
      ? 'Opening the archive…'
      : 'Loading your research world…';

    return <AppSplashScreen progress={workReady ? 1 : progress} message={message} />;
  }

  return <>{children}</>;
}
