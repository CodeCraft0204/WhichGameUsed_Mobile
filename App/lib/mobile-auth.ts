import type { EmailOtpType } from '@supabase/supabase-js';
import { authRedirectPath } from '@/lib/auth-redirect';
import { supabase } from '@/lib/supabase';

export const MOBILE_META = { auth_client: 'mobile' as const };

/** Deep link passed on OTP sends so auth hooks do not treat mobile as portal reset. */
export const MOBILE_OTP_REDIRECT = authRedirectPath('auth/mobile-otp');

export const MOBILE_OTP_LENGTH = 8;

type SendOtpOptions = {
  createUser: boolean;
};

/**
 * Request a one-time code by email (Email OTP must be enabled in Supabase).
 *
 * Signup: call with `{ email }` only — do not pass an `options` object. With
 * `enable_confirmations` on, passing `options` (even `{ shouldCreateUser: true }`)
 * can make Supabase send a confirmation link instead of an OTP (supabase#9285).
 *
 * Sign-in / resend for existing users: pass `shouldCreateUser: false` and metadata.
 */
export async function sendMobileOtp(email: string, options: SendOtpOptions) {
  const trimmed = email.trim();

  if (options.createUser) {
    return supabase.auth.signInWithOtp({ email: trimmed });
  }

  return supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      shouldCreateUser: false,
      data: MOBILE_META,
      emailRedirectTo: MOBILE_OTP_REDIRECT
    }
  });
}

async function resolveUserId(fallbackUserId?: string | null) {
  if (fallbackUserId) return fallbackUserId;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    return null;
  }
  return data.user.id;
}

async function syncMobileProfile(userId: string, displayName?: string) {
  return supabase
    .from('profiles')
    .update({
      auth_client: 'mobile',
      ...(displayName?.trim() ? { display_name: displayName.trim() } : {})
    })
    .eq('id', userId);
}

/** Verify the email OTP and establish a session. */
export async function verifyMobileOtp(
  email: string,
  otp: string,
  types: EmailOtpType[] = ['email']
) {
  const trimmedEmail = email.trim();
  const token = otp.trim();
  let lastError: Error | null = null;

  for (const type of types) {
    const result = await supabase.auth.verifyOtp({
      email: trimmedEmail,
      token,
      type
    });
    if (!result.error) {
      return result;
    }
    lastError = result.error;
  }

  return { data: { user: null, session: null }, error: lastError };
}

/** Sign up: verify OTP → set metadata/password (call sendMobileOtp from UI first). */
export async function completeMobileSignUp(
  email: string,
  otp: string,
  password?: string,
  displayName?: string
) {
  const verify = await verifyMobileOtp(email, otp, ['signup', 'email']);
  if (verify.error) {
    return { verify, profileError: null };
  }

  const meta = {
    ...MOBILE_META,
    ...(displayName?.trim() ? { display_name: displayName.trim() } : {})
  };

  const { error: updateError } = await supabase.auth.updateUser({
    ...(password ? { password } : {}),
    data: meta
  });
  if (updateError) {
    return { verify, profileError: updateError };
  }

  const userId = await resolveUserId(verify.data.user?.id ?? verify.data.session?.user?.id);
  if (!userId) {
    return {
      verify,
      profileError: new Error('Could not resolve user after verification.')
    };
  }

  const { error: profileError } = await syncMobileProfile(userId, displayName);
  return { verify, profileError };
}

/** Sign in: OTP only (send must be called first from UI). */
export async function completeMobileSignIn(email: string, otp: string) {
  return verifyMobileOtp(email, otp, ['email']);
}

/** Sign in: verify password, then email an OTP (session opens only after verifyOtp). */
export async function requestSignInOtpAfterPassword(email: string, password: string) {
  const trimmed = email.trim();
  const { error: passwordError } = await supabase.auth.signInWithPassword({
    email: trimmed,
    password
  });
  if (passwordError) {
    return { passwordError, otpError: null };
  }

  await supabase.auth.signOut();

  const { error: otpError } = await sendMobileOtp(trimmed, { createUser: false });
  return { passwordError: null, otpError };
}

/** Set new password: verify OTP → update password → revoke all sessions (force re-sign-in). */
export async function completeMobileSetNewPassword(
  email: string,
  otp: string,
  newPassword: string
) {
  const verify = await verifyMobileOtp(email, otp, ['email']);
  if (verify.error) {
    return { verify, password: null, signOutError: null };
  }

  const password = await supabase.auth.updateUser({ password: newPassword });
  if (password.error) {
    return { verify, password, signOutError: null };
  }

  const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
  return { verify, password: { error: null }, signOutError };
}

/** End every session for the current user (other devices and browsers). */
export async function revokeAllSessions() {
  return supabase.auth.signOut({ scope: 'global' });
}

/** Resend OTP for the same email. */
export async function resendMobileOtp(email: string, createUser: boolean) {
  return sendMobileOtp(email, { createUser });
}
