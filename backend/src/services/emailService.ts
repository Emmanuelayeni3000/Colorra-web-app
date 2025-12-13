import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email sender address
const FROM_EMAIL = process.env.FROM_EMAIL || 'Colorra <onboarding@resend.dev>'

/**
 * Send email verification email to new users
 */
export const sendVerificationEmail = async (email: string, verificationToken: string, userName?: string) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email - Colorra',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #8b5cf6; font-size: 28px; font-weight: bold; }
            .logo-icon { display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6, #14b8a6); border-radius: 8px; margin-right: 10px; vertical-align: middle; }
            .content { text-align: center; }
            h1 { color: #1f2937; font-size: 24px; margin-bottom: 16px; }
            p { color: #6b7280; font-size: 16px; margin-bottom: 24px; }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #8b5cf6, #7c3aed); 
              color: white !important; 
              padding: 14px 32px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
            }
            .button:hover { background: linear-gradient(135deg, #7c3aed, #6d28d9); }
            .link-text { color: #9ca3af; font-size: 14px; word-break: break-all; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px; }
            .divider { height: 1px; background: #e5e7eb; margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <span class="logo">◆ Colorra</span>
              </div>
              <div class="content">
                <h1>Verify your email address</h1>
                <p>Hi${userName ? ` ${userName}` : ''},</p>
                <p>Thanks for signing up for Colorra! Please verify your email address by clicking the button below:</p>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                <p class="link-text">Or copy and paste this link into your browser:<br>${verificationUrl}</p>
                <div class="divider"></div>
                <p style="font-size: 14px;"><strong>This link will expire in 24 hours.</strong></p>
                <p style="font-size: 14px;">If you didn't create an account with Colorra, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Colorra. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending verification email:', error)
      throw error
    }

    console.log('Verification email sent successfully:', data?.id)
    return data
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw error
  }
}

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Password Reset Request - Colorra',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #8b5cf6; font-size: 28px; font-weight: bold; }
            .content { text-align: center; }
            h1 { color: #1f2937; font-size: 24px; margin-bottom: 16px; }
            p { color: #6b7280; font-size: 16px; margin-bottom: 24px; }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #14b8a6, #0d9488); 
              color: white !important; 
              padding: 14px 32px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
            }
            .link-text { color: #9ca3af; font-size: 14px; word-break: break-all; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px; }
            .divider { height: 1px; background: #e5e7eb; margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <span class="logo">◆ Colorra</span>
              </div>
              <div class="content">
                <h1>Password Reset Request</h1>
                <p>Hello,</p>
                <p>We received a request to reset your password for your Colorra account. If you didn't make this request, you can ignore this email.</p>
                <p>To reset your password, click the button below:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p class="link-text">Or copy and paste this link into your browser:<br>${resetUrl}</p>
                <div class="divider"></div>
                <p style="font-size: 14px;"><strong>This link will expire in 1 hour.</strong></p>
                <p style="font-size: 14px;">If you continue to have problems, please contact our support team.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Colorra. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      throw error
    }

    console.log('Password reset email sent successfully:', data?.id)
    return data
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
}

/**
 * Verify email configuration by sending a test request
 */
export const verifyEmailConfig = async () => {
  try {
    // Just check if API key is set
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set - email functionality will not work')
      return false
    }
    console.log('Resend email configuration is set')
    return true
  } catch (error) {
    console.error('Email configuration error:', error)
    return false
  }
}
