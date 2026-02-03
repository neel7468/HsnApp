"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
async function sendOtpEmail(toEmail, otpCode) {
    try {
        const user = process.env.SMTP_USER;
        let pass = process.env.SMTP_PASS || '';
        pass = pass.replace(/\s+/g, '');
        const fromEmail = process.env.FROM_EMAIL || user;
        if (!user || !pass) {
            throw new Error('Email service not configured');
        }
        const transporter = nodemailer_1.default.createTransport({
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
    }
    catch (error) {
        console.error("EMAIL ERROR 👉", error);
        throw error;
    }
}
