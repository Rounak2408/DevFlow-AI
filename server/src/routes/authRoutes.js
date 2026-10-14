import { Router } from 'express';
import { body } from 'express-validator';
import * as auth from '../controllers/authController.js';
import { authenticate, loadUser } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { avatarUploadMulter } from '../middlewares/avatarUpload.js';

const r = Router();

r.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty(),
  ],
  auth.register
);
r.post(
  '/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  auth.login
);
r.post('/google', authLimiter, auth.googleAuth);
r.post('/facebook', authLimiter, auth.facebookAuth);
r.post('/social', authLimiter, auth.socialAuth);
r.get('/me', authenticate, loadUser, auth.me);
r.patch(
  '/me',
  authenticate,
  loadUser,
  [
    body('name').optional().trim().notEmpty(),
    body('avatar').optional().isString(),
    body('jobTitle').optional().isString().isLength({ max: 120 }),
    body('avatarEmoji').optional().isString().isLength({ max: 8 }),
  ],
  auth.updateProfile
);
r.post('/me/avatar', authenticate, loadUser, avatarUploadMulter.single('photo'), auth.uploadAvatar);
r.post(
  '/me/password',
  authenticate,
  loadUser,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  auth.changePassword
);

export default r;
