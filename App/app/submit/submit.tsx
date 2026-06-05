import { Redirect, useLocalSearchParams } from 'expo-router';

/** Legacy route — redirects to Create edit screen. */
export default function SubmitRedirect() {
  const params = useLocalSearchParams<{ frontUri?: string; backUri?: string }>();
  return (
    <Redirect
      href={{
        pathname: '/create/edit',
        params: {
          ...(typeof params.frontUri === 'string' ? { frontUri: params.frontUri } : {}),
          ...(typeof params.backUri === 'string' ? { backUri: params.backUri } : {})
        }
      }}
    />
  );
}
