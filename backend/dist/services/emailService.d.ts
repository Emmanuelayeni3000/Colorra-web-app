/**
 * Send email verification email to new users
 */
export declare const sendVerificationEmail: (email: string, verificationToken: string, userName?: string) => Promise<import("resend").CreateEmailResponseSuccess>;
/**
 * Send password reset email
 */
export declare const sendPasswordResetEmail: (email: string, resetToken: string) => Promise<import("resend").CreateEmailResponseSuccess>;
/**
 * Verify email configuration by sending a test request
 */
export declare const verifyEmailConfig: () => Promise<boolean>;
//# sourceMappingURL=emailService.d.ts.map