/** Map Supabase auth errors to user-friendly copy. */
export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('token') && (lower.includes('invalid') || lower.includes('expired'))) {
    return 'That code is invalid or expired. Request a new code and try again.';
  }
  if (lower.includes('otp') && lower.includes('expired')) {
    return 'That code has expired. Request a new code and try again.';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid email or password')) {
    return 'Invalid email or password.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }
  if (lower.includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password does not meet security requirements.';
  }
  if (lower.includes('signup is disabled')) {
    return 'Sign up is currently disabled. Please contact support.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (lower.includes('session') && lower.includes('missing')) {
    return 'Your reset link has expired. Please request a new password reset email.';
  }

  return message;
}
