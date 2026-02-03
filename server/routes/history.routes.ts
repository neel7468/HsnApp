import { Router } from "express";
import History from "../models/History";
import authMiddleware from "../middleware/authMiddleware"; // 🔐 SAME MIDDLEWARE

const router = Router();

/**
 * ==============================
 * SAVE HISTORY
 * ==============================
 * 🔐 userId comes ONLY from JWT
 */
router.post("/create", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id; // ✅ SAME AS PAYMENT SERVICE
    const { hsnCode, description, gstRate, source } = req.body;

    if (!hsnCode || !description || !gstRate || !source) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
      });
    }

    const history = await History.create({
      userId,
      hsnCode,
      description,
      gstRate,
      source,
    });

    res.status(201).json({
      success: true,
      history,
    });
  } catch (err) {
    console.error("SAVE HISTORY ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/**
 * ==============================
 * GET USER HISTORY
 * ==============================
 */
router.get("/view", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id; // ✅ SECURE

    const history = await History.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      history,
    });
  } catch (err) {
    console.error("GET HISTORY ERROR:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
