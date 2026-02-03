import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendOtpEmail(toEmail: string, otpCode: string) {
  try {
    console.log("📨 Sending OTP to:", toEmail);

    const res = await sgMail.send({
      to: toEmail,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: "Your HSN Finder OTP",
      html: `<h1>${otpCode}</h1>`,
    });

    console.log("✅ Status:", res[0].statusCode);
  } catch (err: any) {
    console.error("❌ SENDGRID ERROR:", err?.response?.body || err);
    throw err;
  }
}
