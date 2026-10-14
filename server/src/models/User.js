import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const preferencesSchema = new mongoose.Schema(
  {
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'auto' },
    dateFormat: { type: String, default: 'mdy' },
    compactMode: { type: Boolean, default: false },
    sidebarCollapsedDefault: { type: Boolean, default: false },
    dashboardLayout: { type: String, default: 'comfortable' },
  },
  { _id: false }
);

const notificationsSchema = new mongoose.Schema(
  {
    email: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    weekly: { type: Boolean, default: true },
    tasks: { type: Boolean, default: true },
    product: { type: Boolean, default: false },
  },
  { _id: false }
);

const integrationsSchema = new mongoose.Schema(
  {
    google: { type: Boolean, default: false },
    slack: { type: Boolean, default: false },
  },
  { _id: false }
);

const billingSchema = new mongoose.Schema(
  {
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    periodEnd: { type: Date, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      minlength: 8,
      select: false,
      required: function () {
        return !this.googleId && !this.facebookId && !this.appleId && (!this.authProvider || this.authProvider === 'local');
      },
    },
    name: { type: String, required: true, trim: true },
    username: { type: String, trim: true, maxlength: 32, sparse: true, unique: true },
    phone: { type: String, default: '', trim: true, maxlength: 32 },
    bio: { type: String, default: '', maxlength: 4000 },
    avatar: { type: String, default: '' },
    avatarEmoji: { type: String, default: '', maxlength: 8 },
    jobTitle: { type: String, default: '', trim: true, maxlength: 120 },
    company: { type: String, default: '', trim: true, maxlength: 120 },
    location: { type: String, default: '', trim: true, maxlength: 120 },
    website: { type: String, default: '', trim: true, maxlength: 500 },
    skills: { type: [String], default: [] },
    preferences: { type: preferencesSchema, default: () => ({}) },
    notifications: { type: notificationsSchema, default: () => ({}) },
    integrations: { type: integrationsSchema, default: () => ({}) },
    /** Stored server-side; never returned in API — only openaiConnected flag */
    openaiKey: { type: String, select: false, default: '' },
    twoFactorEnabled: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    billing: { type: billingSchema, default: () => ({ plan: 'free' }) },
    globalRole: { type: String, enum: ['admin', 'member'], default: 'member' },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook', 'apple', 'github'],
      default: 'local',
    },
    googleId: { type: String, default: '', sparse: true },
    facebookId: { type: String, default: '', sparse: true },
    appleId: { type: String, default: '', sparse: true },
    githubAccessToken: { type: String, select: false, default: '' },
    githubUsername: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.password || !this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
