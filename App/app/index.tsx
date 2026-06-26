import { Redirect } from 'expo-router';
import { AppSplashScreen } from '@/components/AppSplashScreen';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return <AppSplashScreen progress={0.9} message="Loading your research world…" />;
  }

  if (session) {
    return <Redirect href="/database/database" />;
  }

  return <Redirect href="/sign-in/sign-in" />;
}
