"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
async function sendOtpEmail(toEmail, otpCode) {
    try {
        console.log("📨 Sending OTP to:", toEmail);
        const res = await mail_1.default.send({
            to: toEmail,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: "Your HSN Finder OTP",
            html: `<h1>${otpCode}</h1>`,
        });
        console.log("✅ Status:", res[0].statusCode);
    }
    catch (err) {
        console.error("❌ SENDGRID ERROR:", err?.response?.body || err);
        throw err;
    }
}
