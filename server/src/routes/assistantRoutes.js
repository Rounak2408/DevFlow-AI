import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate, loadUser } from '../middlewares/auth.js';
import * as assistant from '../controllers/assistantController.js';

const r = Router();

r.use(authenticate, loadUser);

r.get('/history', query('q').optional().isString(), assistant.listHistory);
r.delete('/history', assistant.deleteAllChats);
r.get('/suggestions', assistant.getSuggestions);
r.get('/insights', assistant.getInsights);
r.get('/chat/:id', assistant.getOneChat);

r.post(
  '/chat',
  [
    body('message').optional().isString().isLength({ max: 32000 }),
    body('chatId').optional().isMongoId(),
    body('stream').optional().isBoolean(),
    body('regenerate').optional().isBoolean(),
  ],
  assistant.postChat
);

r.patch(
  '/chat/:id',
  [body('title').optional().isString().isLength({ max: 200 }), body('pinned').optional().isBoolean()],
  assistant.patchChat
);
r.delete('/chat/:id', assistant.deleteChat);
r.patch('/chat/:id/messages/:messageId/feedback', assistant.patchMessageFeedback);

export default r;
