import { Redirect, useLocalSearchParams } from 'expo-router';

/** @deprecated Use /database/wishlist-add — kept for old deep links. */
export default function RequestCardRedirect() {
  const params = useLocalSearchParams<{ query?: string; returnTo?: string }>();
  return (
    <Redirect
      href={{
        pathname: '/database/wishlist-add',
        params: {
          ...(typeof params.query === 'string' ? { query: params.query } : {}),
          ...(typeof params.returnTo === 'string' ? { returnTo: params.returnTo } : {})
        }
      }}
    />
  );
}
