import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  avatar?: string;
  role: 'free' | 'premium' | 'admin';
  planTier: 'free' | 'basic' | 'business';
  isVerified: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['free', 'premium', 'admin'], default: 'free' },
  planTier: { type: String, enum: ['free', 'basic', 'business'], default: 'free' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', UserSchema);
