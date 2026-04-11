import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { serializeUserPrivate } from '../utils/userSerialize.js';
import * as auth from './authController.js';

async function loadPrimaryWorkspace(userId) {
  const uid = String(userId);
  const projects = await Project.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
  })
    .sort({ updatedAt: -1 })
    .limit(1)
    .select('name owner members createdAt')
    .lean();

  if (!projects.length) return null;
  const p = projects[0];
  if (String(p.owner) === uid) {
    return {
      id: p._id,
      name: p.name,
      role: 'Owner',
      joinedAt: p.createdAt,
    };
  }
  const m = p.members?.find((x) => String(x.user) === uid);
  const role = m?.role === 'admin' ? 'Admin' : 'Developer';
  return {
    id: p._id,
    name: p.name,
    role,
    joinedAt: p.createdAt,
  };
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('+openaiKey').lean();
    if (!user) {
      res.status(401);
      return next(new Error('User not found'));
    }
    const workspace = await loadPrimaryWorkspace(req.userId);
    res.json({ user: serializeUserPrivate(user), workspace });
  } catch (e) {
    next(e);
  }
}

export async function updateUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const user = await User.findById(req.userId).select('+openaiKey');
    if (!user) {
      res.status(401);
      return next(new Error('User not found'));
    }

    const {
      name,
      email,
      username,
      phone,
      bio,
      jobTitle,
      company,
      location,
      website,
      skills,
      preferences,
      notifications,
      integrations,
      openaiKey,
      twoFactorEnabled,
      avatar,
      avatarEmoji,
    } = req.body;

    if (name !== undefined) user.name = String(name).trim().slice(0, 80);
    if (email !== undefined) {
      const em = String(email).trim().toLowerCase();
      const taken = await User.findOne({ email: em, _id: { $ne: user._id } });
      if (taken) {
        res.status(409);
        return next(new Error('Email already in use'));
      }
      user.email = em;
    }
    let clearUsername = false;
    if (username !== undefined) {
      const u = String(username).trim().slice(0, 32);
      if (u) {
        const taken = await User.findOne({ username: u, _id: { $ne: user._id } });
        if (taken) {
          res.status(409);
          return next(new Error('Username already taken'));
        }
        user.username = u;
      } else {
        clearUsername = true;
      }
    }
    if (phone !== undefined) user.phone = String(phone).trim().slice(0, 32);
    if (bio !== undefined) user.bio = String(bio).slice(0, 4000);
    if (jobTitle !== undefined) user.jobTitle = String(jobTitle).trim().slice(0, 120);
    if (company !== undefined) user.company = String(company).trim().slice(0, 120);
    if (location !== undefined) user.location = String(location).trim().slice(0, 120);
    if (website !== undefined) user.website = String(website).trim().slice(0, 500);
    if (avatar !== undefined) user.avatar = String(avatar || '').trim().slice(0, 500);
    if (avatarEmoji !== undefined) user.avatarEmoji = String(avatarEmoji || '').trim().slice(0, 8);

    if (skills !== undefined) {
      const arr = Array.isArray(skills)
        ? skills.filter((s) => typeof s === 'string').map((s) => s.trim()).filter(Boolean)
        : [];
      user.skills = arr.slice(0, 50);
    }

    if (preferences !== undefined && typeof preferences === 'object' && preferences) {
      const cur = user.preferences?.toObject?.() || {};
      const allowed = ['theme', 'language', 'timezone', 'dateFormat', 'compactMode', 'sidebarCollapsedDefault', 'dashboardLayout'];
      const next = { ...cur };
      for (const k of allowed) {
        if (preferences[k] !== undefined) next[k] = preferences[k];
      }
      user.preferences = next;
      user.markModified('preferences');
    }

    if (notifications !== undefined && typeof notifications === 'object' && notifications) {
      const cur = user.notifications?.toObject?.() || {};
      const next = { ...cur };
      for (const k of ['email', 'mentions', 'weekly', 'tasks', 'product']) {
        if (notifications[k] !== undefined) next[k] = Boolean(notifications[k]);
      }
      user.notifications = next;
      user.markModified('notifications');
    }

    if (integrations !== undefined && typeof integrations === 'object' && integrations) {
      const cur = user.integrations?.toObject?.() || {};
      const next = { ...cur };
      if (integrations.google !== undefined) next.google = Boolean(integrations.google);
      if (integrations.slack !== undefined) next.slack = Boolean(integrations.slack);
      user.integrations = next;
      user.markModified('integrations');
    }

    if (openaiKey !== undefined) {
      const v = String(openaiKey).trim().slice(0, 500);
      user.openaiKey = v;
    }

    if (twoFactorEnabled !== undefined) user.twoFactorEnabled = Boolean(twoFactorEnabled);

    await user.save();
    if (clearUsername) {
      await User.collection.updateOne({ _id: user._id }, { $unset: { username: 1 } });
    }

    const fresh = await User.findById(req.userId).select('+openaiKey').lean();
    const workspace = await loadPrimaryWorkspace(req.userId);
    res.json({ user: serializeUserPrivate(fresh), workspace });
  } catch (e) {
    next(e);
  }
}

export const uploadAvatar = auth.uploadAvatar;
export const changePassword = auth.changePassword;
