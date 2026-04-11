import jwt from 'jsonwebtoken';
import { Message } from '../models/Message.js';
import { getProjectForUser } from '../utils/projectAccess.js';
import { sanitizeAttachments } from '../utils/chatAttachments.js';
import { USER_PUBLIC_POPULATE } from '../constants/userFields.js';

const typingUsers = new Map();

async function bothProjectMembers(projectId, userA, userB) {
  const [a, b] = await Promise.all([
    getProjectForUser(projectId, userA),
    getProjectForUser(projectId, userB),
  ]);
  return !a.error && !b.error;
}

export function setupSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.sub;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('project:join', async (projectId, cb) => {
      try {
        const { error, project } = await getProjectForUser(projectId, socket.userId);
        if (error || !project) {
          cb?.({ ok: false, error });
          return;
        }
        socket.join(`project:${projectId}`);
        cb?.({ ok: true });
      } catch (e) {
        cb?.({ ok: false, error: e.message });
      }
    });

    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('chat:message', async ({ projectId, content, attachments: rawAtt }, cb) => {
      try {
        const { error } = await getProjectForUser(projectId, socket.userId);
        if (error) {
          cb?.({ ok: false, error });
          return;
        }
        const attachments = sanitizeAttachments(projectId, rawAtt);
        const text = String(content || '').trim().slice(0, 4000);
        if (!text && !attachments.length) {
          cb?.({ ok: false, error: 'Empty message' });
          return;
        }
        const message = await Message.create({
          project: projectId,
          user: socket.userId,
          content: text,
          attachments,
        });
        await message.populate('user', USER_PUBLIC_POPULATE);
        const payload = {
          id: message._id,
          content: message.content || '',
          attachments: message.attachments || [],
          user: message.user,
          createdAt: message.createdAt,
        };
        io.to(`project:${projectId}`).emit('chat:message', payload);
        cb?.({ ok: true, message: payload });
      } catch (e) {
        cb?.({ ok: false, error: e.message });
      }
    });

    socket.on('chat:typing', ({ projectId, isTyping }) => {
      const key = `${projectId}:${socket.userId}`;
      if (isTyping) typingUsers.set(key, Date.now());
      else typingUsers.delete(key);

      socket.to(`project:${projectId}`).emit('chat:typing', {
        userId: socket.userId,
        isTyping: !!isTyping,
      });
    });

    socket.on('call:offer', async ({ projectId, toUserId, offer, kind }, cb) => {
      try {
        if (!projectId || !toUserId || !offer || String(toUserId) === String(socket.userId)) {
          cb?.({ ok: false, error: 'Invalid call' });
          return;
        }
        const ok = await bothProjectMembers(projectId, socket.userId, toUserId);
        if (!ok) {
          cb?.({ ok: false, error: 'Forbidden' });
          return;
        }
        io.to(`user:${toUserId}`).emit('call:incoming', {
          fromUserId: socket.userId,
          projectId,
          offer,
          kind: kind === 'audio' ? 'audio' : 'video',
        });
        cb?.({ ok: true });
      } catch (e) {
        cb?.({ ok: false, error: e.message });
      }
    });

    socket.on('call:answer', async ({ projectId, toUserId, answer }, cb) => {
      try {
        if (!projectId || !toUserId || !answer) {
          cb?.({ ok: false });
          return;
        }
        const ok = await bothProjectMembers(projectId, socket.userId, toUserId);
        if (!ok) {
          cb?.({ ok: false, error: 'Forbidden' });
          return;
        }
        io.to(`user:${toUserId}`).emit('call:answered', {
          fromUserId: socket.userId,
          projectId,
          answer,
        });
        cb?.({ ok: true });
      } catch (e) {
        cb?.({ ok: false, error: e.message });
      }
    });

    socket.on('call:candidate', async ({ projectId, toUserId, candidate }, cb) => {
      try {
        if (!projectId || !toUserId || !candidate) return cb?.({ ok: false });
        const ok = await bothProjectMembers(projectId, socket.userId, toUserId);
        if (!ok) return cb?.({ ok: false });
        io.to(`user:${toUserId}`).emit('call:candidate', {
          fromUserId: socket.userId,
          projectId,
          candidate,
        });
        cb?.({ ok: true });
      } catch (e) {
        cb?.({ ok: false, error: e.message });
      }
    });

    socket.on('call:hangup', async ({ projectId, toUserId }, cb) => {
      try {
        if (!toUserId) return cb?.({ ok: false });
        io.to(`user:${toUserId}`).emit('call:hangup', {
          fromUserId: socket.userId,
          projectId,
        });
        cb?.({ ok: true });
      } catch (e) {
        cb?.({ ok: false, error: e.message });
      }
    });

    socket.on('call:decline', async ({ projectId, toUserId }, cb) => {
      try {
        if (!toUserId) return cb?.({ ok: false });
        io.to(`user:${toUserId}`).emit('call:declined', {
          fromUserId: socket.userId,
          projectId,
        });
        cb?.({ ok: true });
      } catch (e) {
        cb?.({ ok: false, error: e.message });
      }
    });
  });

  setInterval(() => {
    const now = Date.now();
    for (const [k, t] of typingUsers.entries()) {
      if (now - t > 4000) typingUsers.delete(k);
    }
  }, 2000);
}
