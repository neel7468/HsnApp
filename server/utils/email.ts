import nodemailer from 'nodemailer';

export async function sendOtpEmail(toEmail: string, otpCode: string) {
  try {
    const user = process.env.SMTP_USER!;
    const pass = process.env.SMTP_PASS!.replace(/\s+/g, '');
    const fromEmail = process.env.FROM_EMAIL || user;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `HSN Finder <${fromEmail}>`,
      to: toEmail,
      subject: 'Your HSN Finder OTP',
      html: `
        <div style="font-family:Arial">
          <h2>HSN Finder</h2>
          <p>Your OTP is:</p>
          <h1>${otpCode}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `,
    });

  } catch (err) {
    console.error('EMAIL ERROR:', err);
    throw err;
  }
}

