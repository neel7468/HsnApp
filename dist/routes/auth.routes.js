"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const OtpCode_1 = require("../models/OtpCode");
const otp_1 = require("../utils/otp");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const upload_1 = require("../utils/upload");
const router = (0, express_1.Router)();
/* ================= AUTH MIDDLEWARE ================= */
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token)
        return res.status(401).json({ ok: false });
    try {
        req.user = (0, jwt_1.verifyToken)(token);
        next();
    }
    catch {
        return res.status(401).json({ ok: false });
    }
};
/* ================= REQUEST OTP ================= */
router.post('/request-otp', async (req, res) => {
    const email = req.body.email.toLowerCase();
    const otp = (0, otp_1.generateOtp)();
    const otpHash = await bcrypt_1.default.hash(otp, 10);
    await OtpCode_1.OtpCode.findOneAndUpdate({ email }, { email, otpHash, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, { upsert: true });
    await User_1.User.findOneAndUpdate({ email }, { $setOnInsert: { email, role: 'premium', planTier: 'basic' } }, { upsert: true });
    await (0, email_1.sendOtpEmail)(email, otp);
    res.json({ ok: true });
});
/* ================= VERIFY OTP ================= */
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const record = await OtpCode_1.OtpCode.findOne({ email });
    if (!record || !(await bcrypt_1.default.compare(otp, record.otpHash))) {
        return res.status(400).json({ ok: false });
    }
    const user = await User_1.User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    await OtpCode_1.OtpCode.deleteOne({ email });
    const token = (0, jwt_1.signToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        planTier: user.planTier,
    });
    res.json({ ok: true, token, profile: user });
});
/* ================= GET PROFILE ================= */
router.get('/me', authMiddleware, async (req, res) => {
    const user = await User_1.User.findById(req.user.userId);
    res.json({ ok: true, profile: user });
});
/* ================= UPDATE PROFILE ================= */
router.put('/me', authMiddleware, upload_1.upload.single('avatar'), async (req, res) => {
    try {
        const name = req.body.name;
        let avatarUrl;
        if (req.file) {
            const uploadResult = await cloudinary_1.default.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
                folder: 'hsn-users',
                resource_type: 'image',
            });
            avatarUrl = uploadResult.secure_url;
        }
        const update = {};
        if (name)
            update.name = name;
        if (avatarUrl)
            update.avatar = avatarUrl;
        const user = await User_1.User.findByIdAndUpdate(req.user.userId, update, { new: true });
        res.json({ ok: true, profile: user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: 'Profile update failed' });
    }
});
exports.default = router;
