import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(toEmail: string, otpCode: string) {
  await resend.emails.send({
    from: "HSN Finder <onboarding@resend.dev>",
    to: [toEmail],
    subject: "Your OTP Code",
    html: `
      <div style="font-family:sans-serif">
        <h2>Your OTP</h2>
        <h1>${otpCode}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `,
  });
}
