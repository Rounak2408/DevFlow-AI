import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { serializeUserClient } from '../utils/userSerialize.js';

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.globalRole },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function serializeUser(user) {
  return serializeUserClient(user);
}

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    const { email, password, name } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409);
      return next(new Error('Email already registered'));
    }
    const user = await User.create({ email, password, name });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: serializeUser(user),
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }
    await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
    const fresh = await User.findById(user._id);
    const token = signToken(fresh);
    res.json({
      token,
      user: serializeUser(fresh),
    });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    res.json({ user: serializeUser(req.user) });
  } catch (e) {
    next(e);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    const { name, avatar, jobTitle, avatarEmoji } = req.body;
    if (name !== undefined) req.user.name = String(name).trim().slice(0, 80);
    if (avatar !== undefined) req.user.avatar = String(avatar || '').trim().slice(0, 500);
    if (jobTitle !== undefined) req.user.jobTitle = String(jobTitle || '').trim().slice(0, 120);
    if (avatarEmoji !== undefined) req.user.avatarEmoji = String(avatarEmoji || '').trim().slice(0, 8);
    await req.user.save();
    res.json({ user: serializeUser(req.user) });
  } catch (e) {
    next(e);
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('No image uploaded'));
    }
    const url = `/api/uploads/avatars/${req.file.filename}`;
    req.user.avatar = url;
    req.user.avatarEmoji = '';
    await req.user.save();
    res.json({ user: serializeUser(req.user) });
  } catch (e) {
    next(e);
  }
}

export async function changePassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      res.status(400);
      return next(new Error('Current password is incorrect'));
    }
    user.password = newPassword;
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
