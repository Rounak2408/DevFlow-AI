import { Router } from 'express';
import { body } from 'express-validator';
import * as ai from '../controllers/aiController.js';
import { authenticate } from '../middlewares/auth.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';

const r = Router();
r.use(authenticate, aiLimiter);
r.post('/task-breakdown', [body('text').trim().notEmpty()], ai.taskBreakdown);
r.post('/bug-suggest', [body('text').trim().notEmpty()], ai.bugSuggest);

export default r;
