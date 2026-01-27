import nodemailer from 'nodemailer';

export async function sendOtpEmail(toEmail: string, otpCode: string) {
  try {
    const user = process.env.SMTP_USER;
    let pass = process.env.SMTP_PASS || '';
    pass = pass.replace(/\s+/g, '');
    const fromEmail = process.env.FROM_EMAIL || user;

    if (!user || !pass) {
      throw new Error('Email service not configured');
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.verify();
    console.log("SMTP READY");

    await transporter.sendMail({
      from: `HSN Finder <${fromEmail}>`,
      to: toEmail,
      subject: 'Your HSN Finder OTP',
      text: `Your verification code is ${otpCode}`,
      html: `<p>Your verification code is <strong>${otpCode}</strong></p>`,
    });

  } catch (error) {
    console.error("EMAIL ERROR 👉", error);
    throw error;
  }
}
