import { Router } from "express";
import crypto from "crypto";
import razorpay from "../config/razorpay";
import Payment from "../models/Payment";
import { User } from "../models/User";
import authMiddleware from "../middleware/authMiddleware"; // 🔐 REQUIRED

const router = Router();

/**
 * ==============================
 * CREATE ORDER
 * ==============================
 * 🔐 userId comes ONLY from JWT
 */
router.post("/create-order", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id; // ✅ SECURE SOURCE
    const { amount, planName } = req.body;

    if (!amount || !planName) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // INR → paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    await Payment.create({
      userId,                // ✅ ALWAYS SAVED
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
  } catch (err) {
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    // 1️⃣ Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // 2️⃣ Update payment
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "SUCCESS",
      },
      { new: true }
    );

    if (!payment || !payment.userId) {
      return res.status(404).json({
        success: false,
        message: "Payment or user not found",
      });
    }

    // 3️⃣ PLAN MAPPING (NO GUESSING)
    let planTier: "basic" | "business";
    let role: "premium";

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
    await User.findByIdAndUpdate(payment.userId, {
      role,
      planTier,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
