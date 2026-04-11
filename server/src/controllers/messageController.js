import { validationResult } from 'express-validator';
import { Message } from '../models/Message.js';
import { getProjectForUser } from '../utils/projectAccess.js';
import { USER_PUBLIC_POPULATE } from '../constants/userFields.js';
import { sanitizeAttachments } from '../utils/chatAttachments.js';

export async function listMessages(req, res, next) {
  try {
    const { id } = req.params;
    const { error, status } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const messages = await Message.find({ project: id })
      .populate('user', USER_PUBLIC_POPULATE)
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ messages: messages.reverse().map((m) => formatMessage(m)) });
  } catch (e) {
    next(e);
  }
}

export async function createMessage(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    const { id } = req.params;
    const { error, status } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    const { content = '', attachments: rawAtt } = req.body;
    const attachments = sanitizeAttachments(id, rawAtt);
    const text = String(content).trim().slice(0, 4000);
    if (!text && !attachments.length) {
      res.status(400);
      return next(new Error('Message must have text or attachments'));
    }
    const message = await Message.create({
      project: id,
      user: req.userId,
      content: text,
      attachments,
    });
    await message.populate('user', USER_PUBLIC_POPULATE);
    res.status(201).json({ message: formatMessage(message) });
  } catch (e) {
    next(e);
  }
}

function formatMessage(m) {
  return {
    id: m._id,
    content: m.content || '',
    attachments: m.attachments || [],
    user: m.user,
    createdAt: m.createdAt,
  };
}
