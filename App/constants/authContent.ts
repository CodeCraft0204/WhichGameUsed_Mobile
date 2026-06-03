/** Auth flow copy, assets, and password rules. */
export const authIcons = {
  logo: require('@/assets/auth/logo.png'),
  heroLogin: require('@/assets/auth/hero_login_crop.png'),
  heroSignup: require('@/assets/auth/hero_signup_crop.png'),
  heroReset: require('@/assets/auth/hero_reset_crop.png'),
  heroSetPassword: require('@/assets/auth/hero_set_password_crop.png'),
  resetPasswordInfoIllustration: require('@/assets/auth/ResetPwd_info_img.png'),
  setNewPasswordInfoIllustration: require('@/assets/auth/SetNewPwd_info_img.png'),
  titleBrush: require('@/assets/figma/advocacy/title_brush.png'),
  tornEdge: require('@/assets/camera/bord.png')
} as const;

export const authCopy = {
  signIn: {
    title: 'WELCOME',
    subtitle: 'Continue your hunt for authentic game-used memorabilia.',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    otpPlaceholder: '8-digit code',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot Password?',
    sendCode: 'SEND CODE',
    resendCode: 'Resend code',
    changeEmail: 'Use a different email',
    otpSent: 'Enter the code we sent to your email.',
    otpModalTitle: 'VERIFY EMAIL',
    confirmOtp: 'CONFIRM',
    submit: 'SIGN IN',
    orContinue: 'or continue with',
    footerPrefix: 'New Collector?',
    footerLink: 'Create Account →'
  },
  signUp: {
    title: 'JOIN THE COMMUNITY',
    subtitle:
      'Track collections, verify memorabilia, and help bring transparency to the hobby.',
    namePlaceholder: 'Full Name',
    emailPlaceholder: 'Email Address',
    passwordPlaceholder: 'Password',
    confirmPlaceholder: 'Confirm Password',
    agreePrefix: 'I agree to the ',
    communityStandards: 'Community Standards',
    sendCode: 'SIGN UP',
    otpPlaceholder: '8-digit code',
    otpSent: 'Enter the code we sent to your email.',
    otpModalTitle: 'VERIFY EMAIL',
    confirmOtp: 'CREATE ACCOUNT',
    resendCode: 'Resend code',
    changeEmail: 'Use a different email',
    submit: 'CREATE ACCOUNT',
    orContinue: 'or continue with',
    footerPrefix: 'Already have an account?',
    footerLink: 'Sign In →'
  },
  passwordReset: {
    title: 'RESET PASSWORD',
    subtitle: 'Enter your email and we’ll send a one-time code to set a new password.',
    emailPlaceholder: 'Email Address',
    submit: 'CONTINUE',
    continueToSetPassword: 'Continue to set password',
    or: 'or',
    helpTitle: 'Trouble with your email?',
    helpBody: 'Make sure you’ve entered the email associated with your account.',
    helpLinkPrefix: 'Still need help? ',
    helpLink: 'Contact Support',
    backToSignIn: 'Back to Sign In',
    footerNote: 'We take your security seriously. Your information is safe with us.',
    success: 'If an account exists for that email, you will receive a code shortly.',
    otpSent: 'Check your email for your code, then continue below.'
  },
  setNewPassword: {
    back: 'Back',
    title: 'SET NEW PASSWORD',
    subtitle: 'Protect your collection with a strong and secure password.',
    emailPlaceholder: 'Email Address',
    otpPlaceholder: '8-digit code',
    resendCode: 'Resend code',
    newPasswordPlaceholder: 'New Password',
    confirmPlaceholder: 'Confirm Password',
    strengthLabel: 'Password Strength',
    strengthWeak: 'Weak',
    strengthStrong: 'Strong',
    requirementsTitle: 'Password must contain:',
    submit: 'UPDATE PASSWORD',
    or: 'or',
    backToSignIn: 'Back to Sign In →',
    footerNote: 'We never share your information. Your security is our priority.'
  }
} as const;

export const passwordRequirements = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
  {
    id: 'special',
    label: 'One special character',
    test: (p: string) => /[^A-Za-z0-9]/.test(p)
  }
] as const;

export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  for (const rule of passwordRequirements) {
    if (rule.test(password)) score += 1;
  }
  return score;
}
