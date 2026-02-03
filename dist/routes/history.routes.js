"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const History_1 = __importDefault(require("../models/History"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware")); // 🔐 SAME MIDDLEWARE
const router = (0, express_1.Router)();
/**
 * ==============================
 * SAVE HISTORY
 * ==============================
 * 🔐 userId comes ONLY from JWT
 */
router.post("/create", authMiddleware_1.default, async (req, res) => {
    try {
        const userId = req.user.id; // ✅ SAME AS PAYMENT SERVICE
        const { hsnCode, description, gstRate, source } = req.body;
        if (!hsnCode || !description || !gstRate || !source) {
            return res.status(400).json({
                success: false,
                message: "Invalid input",
            });
        }
        const history = await History_1.default.create({
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
    }
    catch (err) {
        console.error("SAVE HISTORY ERROR:", err);
        res.status(500).json({ success: false });
    }
});
/**
 * ==============================
 * GET USER HISTORY
 * ==============================
 */
router.get("/view", authMiddleware_1.default, async (req, res) => {
    try {
        const userId = req.user.id; // ✅ SECURE
        const history = await History_1.default.find({ userId })
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            history,
        });
    }
    catch (err) {
        console.error("GET HISTORY ERROR:", err);
        res.status(500).json({ success: false });
    }
});
exports.default = router;
