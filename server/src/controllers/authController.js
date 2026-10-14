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

export async function googleAuth(req, res, next) {
  try {
    const { credential, accessToken, email, name, avatar, googleId } = req.body;
    let verifiedEmail = '';
    let verifiedName = name || '';
    let verifiedAvatar = avatar || '';
    let verifiedSub = googleId || '';

    if (credential) {
      // Verify Google ID token via Google Tokeninfo API
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!googleRes.ok) {
        res.status(401);
        return next(new Error('Invalid Google credential'));
      }
      const data = await googleRes.json();
      if (!data.email || (data.email_verified !== 'true' && data.email_verified !== true)) {
        res.status(400);
        return next(new Error('Google email is not verified'));
      }
      verifiedEmail = data.email.toLowerCase().trim();
      verifiedName = data.name || verifiedEmail.split('@')[0];
      verifiedAvatar = data.picture || '';
      verifiedSub = data.sub;
    } else if (accessToken) {
      // Verify via Google userinfo
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!googleRes.ok) {
        res.status(401);
        return next(new Error('Invalid Google access token'));
      }
      const data = await googleRes.json();
      if (!data.email) {
        res.status(400);
        return next(new Error('Unable to retrieve Google account email'));
      }
      verifiedEmail = data.email.toLowerCase().trim();
      verifiedName = data.name || verifiedEmail.split('@')[0];
      verifiedAvatar = data.picture || '';
      verifiedSub = data.sub;
    } else if (email) {
      // Direct Gmail / account sign in
      verifiedEmail = String(email).toLowerCase().trim();
      if (!/^\S+@\S+\.\S+$/.test(verifiedEmail)) {
        res.status(400);
        return next(new Error('Invalid email address'));
      }
      verifiedName = name ? String(name).trim() : verifiedEmail.split('@')[0];
      verifiedAvatar = avatar || '';
      verifiedSub = googleId || '';
    } else {
      res.status(400);
      return next(new Error('Google credential or email is required'));
    }

    let user = await User.findOne({
      $or: [
        { email: verifiedEmail },
        ...(verifiedSub ? [{ googleId: verifiedSub }] : []),
      ],
    });

    if (user) {
      let changed = false;
      if (verifiedSub && !user.googleId) {
        user.googleId = verifiedSub;
        changed = true;
      }
      if (!user.avatar && verifiedAvatar) {
        user.avatar = verifiedAvatar;
        changed = true;
      }
      if (changed) await user.save();
      await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
      user = await User.findById(user._id);
    } else {
      user = await User.create({
        email: verifiedEmail,
        name: verifiedName,
        avatar: verifiedAvatar,
        googleId: verifiedSub,
        authProvider: 'google',
        lastLoginAt: new Date(),
      });
    }

    const token = signToken(user);
    res.json({
      token,
      user: serializeUser(user),
    });
  } catch (e) {
    next(e);
  }
}

export async function facebookAuth(req, res, next) {
  try {
    const { accessToken, email, name, avatar, facebookId } = req.body;
    let verifiedEmail = '';
    let verifiedName = name || '';
    let verifiedAvatar = avatar || '';
    let verifiedId = facebookId || '';

    if (accessToken) {
      const fbRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.width(200).height(200)&access_token=${encodeURIComponent(accessToken)}`
      );
      if (!fbRes.ok) {
        res.status(401);
        return next(new Error('Invalid Facebook access token'));
      }
      const data = await fbRes.json();
      verifiedId = data.id;
      verifiedName = data.name || 'Facebook User';
      verifiedEmail = (data.email || `${data.id}@facebook.devflow.io`).toLowerCase().trim();
      verifiedAvatar = data.picture?.data?.url || '';
    } else if (email) {
      verifiedEmail = String(email).toLowerCase().trim();
      verifiedName = name ? String(name).trim() : 'Facebook User';
      verifiedAvatar = avatar || '';
      verifiedId = facebookId || '';
    } else {
      res.status(400);
      return next(new Error('Facebook access token or email is required'));
    }

    let user = await User.findOne({
      $or: [
        { email: verifiedEmail },
        ...(verifiedId ? [{ facebookId: verifiedId }] : []),
      ],
    });

    if (user) {
      let changed = false;
      if (verifiedId && !user.facebookId) {
        user.facebookId = verifiedId;
        changed = true;
      }
      if (!user.avatar && verifiedAvatar) {
        user.avatar = verifiedAvatar;
        changed = true;
      }
      if (changed) await user.save();
      await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
      user = await User.findById(user._id);
    } else {
      user = await User.create({
        email: verifiedEmail,
        name: verifiedName,
        avatar: verifiedAvatar,
        facebookId: verifiedId,
        authProvider: 'facebook',
        lastLoginAt: new Date(),
      });
    }

    const token = signToken(user);
    res.json({
      token,
      user: serializeUser(user),
    });
  } catch (e) {
    next(e);
  }
}

export async function socialAuth(req, res, next) {
  try {
    const { provider, email, name, avatar, id } = req.body;
    if (provider === 'google') {
      return googleAuth(req, res, next);
    }
    if (provider === 'facebook') {
      return facebookAuth(req, res, next);
    }

    const cleanEmail = String(email || '').toLowerCase().trim();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      res.status(400);
      return next(new Error('Valid email is required for social login'));
    }

    const cleanName = name ? String(name).trim() : cleanEmail.split('@')[0];
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      let changed = false;
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        changed = true;
      }
      if (provider === 'apple' && id && !user.appleId) {
        user.appleId = id;
        changed = true;
      }
      if (changed) await user.save();
      await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
      user = await User.findById(user._id);
    } else {
      user = await User.create({
        email: cleanEmail,
        name: cleanName,
        avatar: avatar || '',
        appleId: provider === 'apple' ? id || '' : '',
        authProvider: provider || 'google',
        lastLoginAt: new Date(),
      });
    }

    const token = signToken(user);
    res.json({
      token,
      user: serializeUser(user),
    });
  } catch (e) {
    next(e);
  }
}

