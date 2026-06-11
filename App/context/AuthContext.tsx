import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { formatAuthError } from '@/lib/auth-errors';
import { signInWithGoogleOAuth } from '@/lib/google-auth';
import {
  completeMobileSetNewPassword,
  completeMobileSignUp,
  requestSignInOtpAfterPassword,
  resendMobileOtp,
  sendMobileOtp,
  verifyMobileOtp
} from '@/lib/mobile-auth';
import { supabase } from '@/lib/supabase';
import type { AppRole, Profile } from '@/types/profile';

type AuthResult = { error: string | null };

type AuthSessionResult = AuthResult & {
  profile: Profile | null;
  isAdmin: boolean;
};

type PasswordResetCompleteResult = AuthResult & {
  requiresReauth: boolean;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  isAdmin: boolean;
  requestSignInOtp: (email: string, password: string) => Promise<AuthResult>;
  verifySignIn: (email: string, otp: string) => Promise<AuthSessionResult>;
  sendSignUpOtp: (email: string, displayName?: string) => Promise<AuthResult>;
  completeSignUp: (
    email: string,
    otp: string,
    password?: string,
    displayName?: string
  ) => Promise<AuthSessionResult>;
  sendPasswordOtp: (email: string) => Promise<AuthResult>;
  completeSetNewPassword: (
    email: string,
    otp: string,
    password: string
  ) => Promise<PasswordResetCompleteResult>;
  resendOtp: (email: string, createUser: boolean, displayName?: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthSessionResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** True while password was verified and OTP entry is pending (blocks auth guard redirect). */
  otpChallengeActive: boolean;
  /** Synchronous check — use in navigation guard before state flushes. */
  isOtpChallengePending: () => boolean;
  clearOtpChallenge: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function isAdminRole(role: AppRole | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

function isJwtClockSkewError(message: string): boolean {
  return message.toLowerCase().includes('jwt issued at future');
}

async function fetchProfile(
  userId: string
): Promise<{ profile: Profile | null; clockSkew: boolean }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, username, avatar_url, about, location_text')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    const clockSkew = isJwtClockSkewError(error.message);
    if (clockSkew) {
      console.warn(
        'Failed to load profile: device clock is behind server time (JWT issued at future). Sync date/time, then sign in again.'
      );
    } else {
      console.error('Failed to load profile', error.message);
    }
    return { profile: null, clockSkew };
  }
  return { profile: data as Profile | null, clockSkew: false };
}

async function profileAfterSession(): Promise<AuthSessionResult> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) {
    return { error: null, profile: null, isAdmin: false };
  }
  const { profile, clockSkew } = await fetchProfile(userId);
  if (clockSkew) {
    await supabase.auth.signOut();
    return { error: null, profile: null, isAdmin: false };
  }
  return { error: null, profile, isAdmin: isAdminRole(profile?.role) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [otpChallengeActive, setOtpChallengeActive] = useState(false);
  const otpChallengeRef = useRef(false);

  const startOtpChallenge = useCallback(() => {
    otpChallengeRef.current = true;
    setOtpChallengeActive(true);
  }, []);

  const clearOtpChallenge = useCallback(() => {
    otpChallengeRef.current = false;
    setOtpChallengeActive(false);
  }, []);

  const isOtpChallengePending = useCallback(() => otpChallengeRef.current, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    const { profile: next, clockSkew } = await fetchProfile(user.id);
    if (clockSkew) {
      await supabase.auth.signOut();
      setProfile(null);
      return;
    }
    setProfile(next);
    setProfileLoading(false);
  }, [user]);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
      if (!nextSession) {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let mounted = true;
    setProfileLoading(true);
    void fetchProfile(user.id).then(async ({ profile: next, clockSkew }) => {
      if (!mounted) return;
      if (clockSkew) {
        await supabase.auth.signOut();
        setProfile(null);
        setProfileLoading(false);
        return;
      }
      setProfile(next);
      setProfileLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [user]);

  const requestSignInOtp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    startOtpChallenge();
    try {
      const { passwordError, otpError } = await requestSignInOtpAfterPassword(email, password);
      const error = passwordError ?? otpError;
      if (error) {
        clearOtpChallenge();
        return { error: formatAuthError(error.message) };
      }
      return { error: null };
    } catch (err) {
      clearOtpChallenge();
      const message = err instanceof Error ? err.message : 'Sign-in failed.';
      return { error: formatAuthError(message) };
    }
  }, [clearOtpChallenge, startOtpChallenge]);

  const verifySignIn = useCallback(async (email: string, otp: string): Promise<AuthSessionResult> => {
    const { error } = await verifyMobileOtp(email, otp, ['email']);
    if (error) {
      return { error: formatAuthError(error.message), profile: null, isAdmin: false };
    }
    clearOtpChallenge();
    return profileAfterSession();
  }, [clearOtpChallenge]);

  const sendSignUpOtp = useCallback(async (email: string, _displayName?: string): Promise<AuthResult> => {
    const { error } = await sendMobileOtp(email, { createUser: true });
    return { error: error ? formatAuthError(error.message) : null };
  }, []);

  const completeSignUp = useCallback(
    async (
      email: string,
      otp: string,
      password?: string,
      displayName?: string
    ): Promise<AuthSessionResult> => {
      const { verify, profileError } = await completeMobileSignUp(
        email,
        otp,
        password,
        displayName
      );
      if (verify.error) {
        return { error: formatAuthError(verify.error.message), profile: null, isAdmin: false };
      }
      if (profileError) {
        return { error: formatAuthError(profileError.message), profile: null, isAdmin: false };
      }
      return profileAfterSession();
    },
    []
  );

  const sendPasswordOtp = useCallback(async (email: string): Promise<AuthResult> => {
    const { error } = await sendMobileOtp(email, { createUser: false });
    return { error: error ? formatAuthError(error.message) : null };
  }, []);

  const completeSetNewPassword = useCallback(
    async (email: string, otp: string, password: string): Promise<PasswordResetCompleteResult> => {
      const { verify, password: pwdResult, signOutError } = await completeMobileSetNewPassword(
        email,
        otp,
        password
      );
      if (verify.error) {
        return { error: formatAuthError(verify.error.message), requiresReauth: false };
      }
      if (pwdResult?.error) {
        return { error: formatAuthError(pwdResult.error.message), requiresReauth: false };
      }
      if (signOutError) {
        await supabase.auth.signOut();
      }
      setSession(null);
      setUser(null);
      setProfile(null);
      return { error: null, requiresReauth: true };
    },
    []
  );

  const resendOtp = useCallback(
    async (email: string, createUser: boolean, _displayName?: string): Promise<AuthResult> => {
      const { error } = await resendMobileOtp(email, createUser);
      return { error: error ? formatAuthError(error.message) : null };
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthSessionResult> => {
    const { error } = await signInWithGoogleOAuth();
    if (error) {
      return { error: formatAuthError(error), profile: null, isAdmin: false };
    }
    return profileAfterSession();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user,
      profile,
      loading,
      profileLoading,
      isAdmin: isAdminRole(profile?.role),
      requestSignInOtp,
      verifySignIn,
      sendSignUpOtp,
      completeSignUp,
      sendPasswordOtp,
      completeSetNewPassword,
      resendOtp,
      signInWithGoogle,
      signOut,
      refreshProfile,
      otpChallengeActive,
      isOtpChallengePending,
      clearOtpChallenge
    }),
    [
      session,
      user,
      profile,
      loading,
      profileLoading,
      otpChallengeActive,
      isOtpChallengePending,
      requestSignInOtp,
      verifySignIn,
      sendSignUpOtp,
      completeSignUp,
      sendPasswordOtp,
      completeSetNewPassword,
      resendOtp,
      signInWithGoogle,
      signOut,
      refreshProfile,
      clearOtpChallenge
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
