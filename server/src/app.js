import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import githubUserRoutes from './routes/githubUserRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import { tasksMyRouter, boardsMyRouter, reportsSummaryRouter } from './routes/workspaceDataRoutes.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { ensureRedisForBull } from './services/aiQueue.js';

export function createApp() {
  ensureRedisForBull();

  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));
  app.use('/api', apiLimiter);

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'devflow-api' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/github', githubUserRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/assistant', assistantRoutes);
  app.use('/api/tasks', tasksMyRouter);
  app.use('/api/boards', boardsMyRouter);
  app.use('/api/reports', reportsSummaryRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
