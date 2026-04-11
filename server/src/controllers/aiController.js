import { validationResult } from 'express-validator';
import { enqueueTaskBreakdown, enqueueBugSuggest } from '../services/aiQueue.js';

export async function taskBreakdown(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    const { text } = req.body;
    const result = await enqueueTaskBreakdown(text);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function bugSuggest(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    const { text } = req.body;
    const result = await enqueueBugSuggest(text);
    res.json(result);
  } catch (e) {
    next(e);
  }
}
