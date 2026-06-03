/** Support contact — override via EXPO_PUBLIC_SUPPORT_EMAIL in .env */
export const SUPPORT_EMAIL =
  process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || 'support@whichgameused.com';

export const SUPPORT_RESPONSE_HINT = 'We typically respond within 1–2 business days.';
