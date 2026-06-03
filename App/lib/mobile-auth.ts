import type { EmailOtpType } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const MOBILE_META = { auth_client: 'mobile' as const };

export const MOBILE_OTP_LENGTH = 8;

type SendOtpOptions = {
  createUser: boolean;
  displayName?: string;
};

/**
 * Request a one-time code by email (Email OTP must be enabled in Supabase).
 * Do not pass user metadata when creating a user — Supabase may send a confirmation
 * link instead of a numeric OTP (see supabase/supabase#9285). Apply metadata after verify.
 */
export async function sendMobileOtp(email: string, options: SendOtpOptions) {
  const otpOptions: {
    shouldCreateUser: boolean;
    data?: typeof MOBILE_META;
  } = {
    shouldCreateUser: options.createUser
  };

  if (!options.createUser) {
    otpOptions.data = MOBILE_META;
  }

  return supabase.auth.signInWithOtp({
    email: email.trim(),
    options: otpOptions
  });
}

async function syncMobileProfile(userId: string, displayName?: string) {
  await supabase
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

/** Set password on the active session (after OTP verify). */
export async function setMobilePassword(password: string) {
  return supabase.auth.updateUser({ password });
}

/** Sign up: verify OTP → set metadata/password (call sendMobileOtp from UI first). */
export async function completeMobileSignUp(
  email: string,
  otp: string,
  password?: string,
  displayName?: string
) {
  const verify = await verifyMobileOtp(email, otp, ['signup', 'email', 'magiclink']);
  if (verify.error) {
    return { verify, password: null, metaError: null };
  }

  const meta = {
    ...MOBILE_META,
    ...(displayName?.trim() ? { display_name: displayName.trim() } : {})
  };
  const { error: metaError } = await supabase.auth.updateUser({ data: meta });
  if (metaError) {
    return { verify, password: null, metaError };
  }

  const userId = verify.data.user?.id;
  if (userId) {
    await syncMobileProfile(userId, displayName);
  }

  if (!password) {
    return { verify, password: null, metaError: null };
  }

  const passwordResult = await setMobilePassword(password);
  return { verify, password: passwordResult, metaError: null };
}

/** Sign in: OTP only (send must be called first from UI). */
export async function completeMobileSignIn(email: string, otp: string) {
  return verifyMobileOtp(email, otp, ['email', 'magiclink']);
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

/** Set new password: verify OTP then updateUser (no resetPasswordForEmail). */
export async function completeMobileSetNewPassword(
  email: string,
  otp: string,
  newPassword: string
) {
  const verify = await verifyMobileOtp(email, otp, ['email', 'magiclink']);
  if (verify.error) return { verify, password: null };

  const password = await setMobilePassword(newPassword);
  return { verify, password };
}

/** Resend OTP for the same email. */
export async function resendMobileOtp(email: string, createUser: boolean, _displayName?: string) {
  return sendMobileOtp(email, { createUser });
}
