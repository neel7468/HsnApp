"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const razorpay_1 = __importDefault(require("../config/razorpay"));
const Payment_1 = __importDefault(require("../models/Payment"));
const User_1 = require("../models/User");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware")); // 🔐 REQUIRED
const router = (0, express_1.Router)();
/**
 * ==============================
 * CREATE ORDER
 * ==============================
 * 🔐 userId comes ONLY from JWT
 */
router.post("/create-order", authMiddleware_1.default, async (req, res) => {
    try {
        const userId = req.user.id; // ✅ SECURE SOURCE
        const { amount, planName } = req.body;
        if (!amount || !planName) {
            return res.status(400).json({ success: false, message: "Invalid input" });
        }
        const order = await razorpay_1.default.orders.create({
            amount: amount * 100, // INR → paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        });
        await Payment_1.default.create({
            userId, // ✅ ALWAYS SAVED
            orderId: order.id,
            amount,
            planName,
            status: "CREATED",
        });
        res.json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
        });
    }
    catch (err) {
        console.error("CREATE ORDER ERROR:", err);
        res.status(500).json({ success: false });
    }
});
/**
 * ==============================
 * VERIFY PAYMENT & UPDATE USER
 * ==============================
 */
router.post("/verify-payment", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payload" });
        }
        // 1️⃣ Verify Razorpay signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }
        // 2️⃣ Update payment
        const payment = await Payment_1.default.findOneAndUpdate({ orderId: razorpay_order_id }, {
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            status: "SUCCESS",
        }, { new: true });
        if (!payment || !payment.userId) {
            return res.status(404).json({
                success: false,
                message: "Payment or user not found",
            });
        }
        // 3️⃣ PLAN MAPPING (NO GUESSING)
        let planTier;
        let role;
        switch (payment.planName.toLowerCase()) {
            case "basic":
                planTier = "basic";
                break;
            case "business":
                planTier = "business";
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid plan name",
                });
        }
        // 4️⃣ Update user
        await User_1.User.findByIdAndUpdate(payment.userId, {
            role,
            planTier,
        });
        res.json({ success: true });
    }
    catch (err) {
        console.error("VERIFY PAYMENT ERROR:", err);
        res.status(500).json({ success: false });
    }
});
exports.default = router;
