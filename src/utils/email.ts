import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: 'Reset your MemoryBook password',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #8B4513;">Reset your MemoryBook password</h2>
        <p>You requested a password reset. Click the button below.</p>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #D47C0F; color: white;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: bold; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 24px;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">MemoryBook — Your memories, bound together.</p>
      </div>
    `,
  });
};