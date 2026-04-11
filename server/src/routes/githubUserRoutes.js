import { Router } from 'express';
import * as github from '../controllers/githubController.js';
import { authenticate, loadUser } from '../middlewares/auth.js';

const r = Router();
r.use(authenticate, loadUser);
r.post('/connect', github.connectGithub);
r.post('/disconnect', github.disconnectGithub);

export default r;
