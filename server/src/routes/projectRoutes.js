import { Router } from 'express';
import { body } from 'express-validator';
import * as project from '../controllers/projectController.js';
import * as task from '../controllers/taskController.js';
import * as message from '../controllers/messageController.js';
import * as analytics from '../controllers/analyticsController.js';
import * as github from '../controllers/githubController.js';
import * as chatUpload from '../controllers/chatUploadController.js';
import { authenticate, loadUser } from '../middlewares/auth.js';
import { chatUploadMulter } from '../middlewares/chatUpload.js';

const r = Router();
r.use(authenticate, loadUser);

r.get('/', project.listProjects);
r.post('/', [body('name').trim().notEmpty()], project.createProject);
r.post('/invite/accept', [body('token').notEmpty()], project.acceptInvite);

r.get('/:id', project.getProject);
r.patch('/:id', project.updateProject);
r.post(
  '/:id/invite',
  [body('email').isEmail().normalizeEmail(), body('role').optional().isIn(['admin', 'member'])],
  project.inviteMember
);
r.patch('/:id/members/:userId/role', [body('role').isIn(['admin', 'member'])], project.updateMemberRole);

r.get('/:id/tasks', task.listTasks);
r.post(
  '/:id/tasks',
  [body('title').trim().notEmpty()],
  task.createTask
);
r.patch('/:id/tasks/:taskId', task.updateTask);
r.delete('/:id/tasks/:taskId', task.deleteTask);

r.get('/:id/messages', message.listMessages);
r.post('/:id/messages/upload', chatUploadMulter.single('file'), chatUpload.uploadChatMedia);
r.post(
  '/:id/messages',
  [body('content').optional().isString(), body('attachments').optional().isArray()],
  message.createMessage
);

r.get('/:id/analytics', analytics.projectAnalytics);
r.get('/:id/github/activity', github.projectGithubActivity);

export default r;
