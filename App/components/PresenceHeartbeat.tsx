import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startPresenceHeartbeat } from '@/lib/presence';

/** Publishes online/away/offline while the collector app is running. */
export function PresenceHeartbeat() {
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    if (!user) return;
    return startPresenceHeartbeat(() => Boolean(userRef.current));
  }, [user]);

  return null;
}
