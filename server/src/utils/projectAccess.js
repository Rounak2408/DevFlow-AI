import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { USER_PUBLIC_POPULATE } from '../constants/userFields.js';

/** Normalize populated or raw ObjectId refs to a comparable string (matches JWT `sub`). */
export function refIdString(ref) {
  if (ref == null) return '';
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object' && ref._id != null) return String(ref._id);
  return String(ref);
}

export async function getProjectForUser(projectId, userId) {
  const pid = String(projectId || '');
  if (!mongoose.Types.ObjectId.isValid(pid)) {
    return { error: 'Project not found', status: 404, project: null };
  }

  const uid = String(userId || '');
  const project = await Project.findById(pid)
    .populate('owner', USER_PUBLIC_POPULATE)
    .populate('members.user', USER_PUBLIC_POPULATE);
  if (!project) return { error: 'Project not found', status: 404, project: null };

  const ownerId = refIdString(project.owner);
  const isOwner = Boolean(uid && ownerId && ownerId === uid);
  const member = project.members.find((m) => {
    const mid = refIdString(m.user);
    return Boolean(mid && mid === uid);
  });
  if (!isOwner && !member) {
    return { error: 'Forbidden', status: 403, project: null };
  }

  const role = isOwner ? 'admin' : member.role;
  return { error: null, status: 200, project, role, isOwner };
}

export function requireProjectAdmin(role) {
  if (role !== 'admin') {
    const err = new Error('Project admin required');
    err.status = 403;
    throw err;
  }
}
