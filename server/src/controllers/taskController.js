import { validationResult } from 'express-validator';
import { Task } from '../models/Task.js';
import { getProjectForUser } from '../utils/projectAccess.js';
import { cacheDel } from '../config/redis.js';

export async function listTasks(req, res, next) {
  try {
    const { id } = req.params;
    const { error, status } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    const tasks = await Task.find({ project: id })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ updatedAt: -1 });
    res.json({
      tasks: tasks.map((t) => ({
        id: t._id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignee: t.assignee,
        dueDate: t.dueDate,
        createdBy: t.createdBy,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    });
  } catch (e) {
    next(e);
  }
}

export async function createTask(req, res, next) {
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
    const { title, description, status: st, priority, assignee, dueDate } = req.body;
    const task = await Task.create({
      project: id,
      title,
      description: description || '',
      status: st || 'todo',
      priority: priority || 'medium',
      assignee: assignee || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: req.userId,
    });
    await task.populate(['assignee', 'createdBy']);
    await cacheDel(`analytics:${id}*`);
    res.status(201).json({ task: formatTask(task) });
  } catch (e) {
    next(e);
  }
}

export async function updateTask(req, res, next) {
  try {
    const { id, taskId } = req.params;
    const { error, status } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    const task = await Task.findOne({ _id: taskId, project: id });
    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }
    const { title, description, status: st, priority, assignee, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (st) task.status = st;
    if (priority) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    await task.save();
    await task.populate(['assignee', 'createdBy']);
    await cacheDel(`analytics:${id}*`);
    res.json({ task: formatTask(task) });
  } catch (e) {
    next(e);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { id, taskId } = req.params;
    const { error, status } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    const r = await Task.deleteOne({ _id: taskId, project: id });
    if (!r.deletedCount) {
      res.status(404);
      return next(new Error('Task not found'));
    }
    await cacheDel(`analytics:${id}*`);
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
}

function formatTask(t) {
  return {
    id: t._id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    assignee: t.assignee,
    dueDate: t.dueDate,
    createdBy: t.createdBy,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}
