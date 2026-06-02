import { supabase } from '@/lib/supabase';

export const MOBILE_META = { auth_client: 'mobile' as const };

export const MOBILE_OTP_LENGTH = 8;

type SendOtpOptions = {
  createUser: boolean;
  displayName?: string;
};

/** Request a one-time code by email (Email OTP must be enabled in Supabase). */
export async function sendMobileOtp(email: string, options: SendOtpOptions) {
  return supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: options.createUser,
      data: {
        ...MOBILE_META,
        ...(options.displayName?.trim() ? { display_name: options.displayName.trim() } : {})
      }
    }
  });
}

/** Verify the email OTP and establish a session. */
export async function verifyMobileOtp(email: string, otp: string) {
  return supabase.auth.verifyOtp({
    email: email.trim(),
    token: otp.trim(),
    type: 'email'
  });
}

/** Set password on the active session (after OTP verify). */
export async function setMobilePassword(password: string) {
  return supabase.auth.updateUser({ password });
}

/** Sign up: verify OTP → optional password (call sendMobileOtp from UI first). */
export async function completeMobileSignUp(email: string, otp: string, password?: string) {
  const verify = await verifyMobileOtp(email, otp);
  if (verify.error) return { verify, password: null };

  if (!password) return { verify, password: null };

  const passwordResult = await setMobilePassword(password);
  return { verify, password: passwordResult };
}

/** Sign in: OTP only (send must be called first from UI). */
export async function completeMobileSignIn(email: string, otp: string) {
  return verifyMobileOtp(email, otp);
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
  const verify = await verifyMobileOtp(email, otp);
  if (verify.error) return { verify, password: null };

  const password = await setMobilePassword(newPassword);
  return { verify, password };
}

/** Resend OTP for the same email. */
export async function resendMobileOtp(email: string, createUser: boolean, displayName?: string) {
  return sendMobileOtp(email, { createUser, displayName });
}
