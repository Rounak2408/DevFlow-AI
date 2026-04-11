import { validationResult } from 'express-validator';
import { Project } from '../models/Project.js';
import { Invitation } from '../models/Invitation.js';
import { User } from '../models/User.js';
import { getProjectForUser, requireProjectAdmin, refIdString } from '../utils/projectAccess.js';
import { USER_PUBLIC_POPULATE } from '../constants/userFields.js';
import { cacheDel } from '../config/redis.js';

export async function listProjects(req, res, next) {
  try {
    const userId = req.userId;
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', USER_PUBLIC_POPULATE)
      .sort({ updatedAt: -1 });
    const uid = String(userId);
    const withRole = projects.map((p) => {
      const isOwner = refIdString(p.owner) === uid;
      const m = p.members.find((x) => refIdString(x.user) === uid);
      return {
        id: p._id,
        name: p.name,
        description: p.description,
        githubRepo: p.githubRepo,
        owner: p.owner,
        role: isOwner ? 'admin' : m?.role || 'member',
        updatedAt: p.updatedAt,
      };
    });
    res.json({ projects: withRole });
  } catch (e) {
    next(e);
  }
}

export async function createProject(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    const { name, description, githubRepo } = req.body;
    const project = await Project.create({
      name,
      description: description || '',
      githubRepo: githubRepo || '',
      owner: req.userId,
      members: [],
    });
    const populated = await project.populate('owner', USER_PUBLIC_POPULATE);
    res.status(201).json({
      project: {
        id: populated._id,
        name: populated.name,
        description: populated.description,
        githubRepo: populated.githubRepo,
        owner: populated.owner,
        role: 'admin',
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function getProject(req, res, next) {
  try {
    const { id } = req.params;
    const { error, status, project, role } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    res.json({
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        githubRepo: project.githubRepo,
        owner: project.owner,
        members: project.members.map((m) => ({
          user: m.user,
          role: m.role,
        })),
        role,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const { error, status, project, role } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    requireProjectAdmin(role);
    const { name, description, githubRepo } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (githubRepo !== undefined) project.githubRepo = githubRepo;
    await project.save();
    await cacheDel(`analytics:${id}*`);
    res.json({
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        githubRepo: project.githubRepo,
      },
    });
  } catch (e) {
    if (e.status === 403) {
      res.status(403);
      return next(e);
    }
    next(e);
  }
}

export async function inviteMember(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    const { id } = req.params;
    const { email, role } = req.body;
    const { error, status, project, role: myRole } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    requireProjectAdmin(myRole);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const target = String(user._id);
      const already = project.members.some((m) => refIdString(m.user) === target);
      const isOwner = refIdString(project.owner) === target;
      if (!already && !isOwner) {
        project.members.push({ user: user._id, role: role || 'member' });
        await project.save();
        return res.json({ message: 'User added to project', added: true });
      }
      if (already || isOwner) {
        return res.json({ message: 'User already in project', added: false });
      }
    }

    const token = Invitation.generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Invitation.create({
      project: project._id,
      email: email.toLowerCase(),
      role: role || 'member',
      token,
      expiresAt,
      invitedBy: req.userId,
    });
    res.status(201).json({
      message: 'Invitation created',
      inviteToken: process.env.NODE_ENV === 'development' ? token : undefined,
    });
  } catch (e) {
    if (e.status === 403) {
      res.status(403);
      return next(e);
    }
    next(e);
  }
}

export async function acceptInvite(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400);
      return next(new Error('Token required'));
    }
    const inv = await Invitation.findOne({ token }).populate('project');
    if (!inv || inv.expiresAt < new Date()) {
      res.status(400);
      return next(new Error('Invalid or expired invitation'));
    }
    if (inv.email !== req.user.email.toLowerCase()) {
      res.status(403);
      return next(new Error('Invitation email does not match'));
    }
    const project = inv.project;
    const uid = String(req.userId);
    const already = project.members.some((m) => refIdString(m.user) === uid);
    const isOwner = refIdString(project.owner) === uid;
    if (!already && !isOwner) {
      project.members.push({ user: req.userId, role: inv.role });
      await project.save();
    }
    await Invitation.deleteOne({ _id: inv._id });
    res.json({ message: 'Joined project', projectId: project._id });
  } catch (e) {
    next(e);
  }
}

export async function updateMemberRole(req, res, next) {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    const { error, status, project, role: myRole } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    requireProjectAdmin(myRole);
    if (refIdString(project.owner) === String(userId)) {
      res.status(400);
      return next(new Error('Cannot change owner role here'));
    }
    const m = project.members.find((x) => refIdString(x.user) === String(userId));
    if (!m) {
      res.status(404);
      return next(new Error('Member not found'));
    }
    m.role = role === 'admin' ? 'admin' : 'member';
    await project.save();
    res.json({ message: 'Role updated' });
  } catch (e) {
    if (e.status === 403) {
      res.status(403);
      return next(e);
    }
    next(e);
  }
}
