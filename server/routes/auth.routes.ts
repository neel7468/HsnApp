import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { OtpCode } from '../models/OtpCode';
import { generateOtp } from '../utils/otp';
import { signToken, verifyToken, JwtPayload } from '../utils/jwt';
import { sendOtpEmail } from '../utils/email';
import cloudinary from '../utils/cloudinary';
import { upload } from '../utils/upload';
const router = Router();

interface AuthRequest extends Request {
  user?: JwtPayload;
}

/* ================= AUTH MIDDLEWARE ================= */
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ ok: false });

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ ok: false });
  }
};

/* ================= REQUEST OTP ================= */
router.post('/request-otp', async (req, res) => {
  const email = req.body.email.toLowerCase();

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  await OtpCode.findOneAndUpdate(
    { email },
    { email, otpHash, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
    { upsert: true }
  );

  await User.findOneAndUpdate(
    { email },
    { $setOnInsert: { email, role: 'premium', planTier: 'basic' } },
    { upsert: true }
  );

  await sendOtpEmail(email, otp);
  res.json({ ok: true });
});

/* ================= VERIFY OTP ================= */
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const record = await OtpCode.findOne({ email });

  if (!record || !(await bcrypt.compare(otp, record.otpHash))) {
    return res.status(400).json({ ok: false });
  }

  const user = await User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true }
  );

  await OtpCode.deleteOne({ email });

  const token = signToken({
    userId: user!._id.toString(),
    email: user!.email,
    role: user!.role,
    planTier: user!.planTier,
  });

  res.json({ ok: true, token, profile: user });
});

/* ================= GET PROFILE ================= */
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId);
  res.json({ ok: true, profile: user });
});

/* ================= UPDATE PROFILE ================= */
router.put(
  '/me',
  authMiddleware,
  upload.single('avatar'),
  async (req: AuthRequest, res: Response) => {
    try {
      const name = req.body.name;
      let avatarUrl: string | undefined;

      if ((req as any).file) {
        const uploadResult = await cloudinary.uploader.upload(
          `data:${(req as any).file.mimetype};base64,${(req as any).file.buffer.toString(
            'base64'
          )}`,
          {
            folder: 'hsn-users',
            resource_type: 'image',
          }
        );

        avatarUrl = uploadResult.secure_url;
      }

      const update: any = {};
      if (name) update.name = name;
      if (avatarUrl) update.avatar = avatarUrl;

      const user = await User.findByIdAndUpdate(
        req.user!.userId,
        update,
        { new: true }
      );

      res.json({ ok: true, profile: user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Profile update failed' });
    }
  }
);

export default router;
