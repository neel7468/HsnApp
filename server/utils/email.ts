import nodemailer from 'nodemailer';

export async function sendOtpEmail(toEmail: string, otpCode: string) {
  const user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS || '';
  pass = pass.replace(/\s+/g, '');
  const fromEmail = process.env.FROM_EMAIL || user;

  if (!user || !pass) {
    throw new Error('Email service not configured');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `HSN Finder <${fromEmail}>`,
    to: toEmail,
    subject: 'Your HSN Finder OTP',
    text: `Your verification code is ${otpCode}. It will expire in 10 minutes.`,
    html: `<p>Your verification code is <strong>${otpCode}</strong>.</p><p>It will expire in 10 minutes.</p>`,
  });
}