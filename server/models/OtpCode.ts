import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpCode extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
}

const OtpSchema = new Schema<IOtpCode>({
  email: String,
  otpHash: String,
  expiresAt: Date,
  attempts: { type: Number, default: 0 },
});

export const OtpCode = mongoose.model<IOtpCode>('OtpCode', OtpSchema);
