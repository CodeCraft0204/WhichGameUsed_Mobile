import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { figmaColors } from '@/constants/figmaColors';

/** Handles email-confirmation deep links after sign up. */
export default function AuthCallbackScreen() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={figmaColors.charcoal} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/database/database" />;
  }

  return <Redirect href="/sign-in/sign-in" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: figmaColors.background
  }
});
