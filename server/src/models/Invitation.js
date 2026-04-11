import mongoose from 'mongoose';
import crypto from 'crypto';

const invitationSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

invitationSchema.statics.generateToken = function generateToken() {
  return crypto.randomBytes(32).toString('hex');
};

export const Invitation = mongoose.model('Invitation', invitationSchema);
