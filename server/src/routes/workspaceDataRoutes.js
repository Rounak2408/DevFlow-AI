import { Router } from 'express';
import { authenticate, loadUser } from '../middlewares/auth.js';
import * as data from '../controllers/assistantDataController.js';

/** GET /api/tasks/my */
export const tasksMyRouter = Router();
tasksMyRouter.use(authenticate, loadUser);
tasksMyRouter.get('/my', data.getMyTasks);

/** GET /api/boards/my */
export const boardsMyRouter = Router();
boardsMyRouter.use(authenticate, loadUser);
boardsMyRouter.get('/my', data.getMyBoards);

/** GET /api/reports/summary */
export const reportsSummaryRouter = Router();
reportsSummaryRouter.use(authenticate, loadUser);
reportsSummaryRouter.get('/summary', data.getReportsSummary);
