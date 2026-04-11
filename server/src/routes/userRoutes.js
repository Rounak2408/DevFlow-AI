import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, loadUser } from '../middlewares/auth.js';
import { avatarUploadMulter } from '../middlewares/avatarUpload.js';
import * as user from '../controllers/userController.js';

const r = Router();

const updateValidators = [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('username').optional().isString().isLength({ max: 32 }),
  body('phone').optional().isString().isLength({ max: 32 }),
  body('bio').optional().isString().isLength({ max: 4000 }),
  body('jobTitle').optional().isString().isLength({ max: 120 }),
  body('company').optional().isString().isLength({ max: 120 }),
  body('location').optional().isString().isLength({ max: 120 }),
  body('website').optional().isString().isLength({ max: 500 }),
  body('skills').optional().isArray(),
  body('preferences').optional().isObject(),
  body('notifications').optional().isObject(),
  body('integrations').optional().isObject(),
  body('openaiKey').optional().isString().isLength({ max: 500 }),
  body('twoFactorEnabled').optional().isBoolean(),
  body('avatar').optional().isString(),
  body('avatarEmoji').optional().isString().isLength({ max: 8 }),
];

r.get('/me', authenticate, user.getMe);
r.put('/update', authenticate, updateValidators, user.updateUser);
r.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  user.changePassword
);
r.post('/avatar', authenticate, loadUser, avatarUploadMulter.single('photo'), user.uploadAvatar);

export default r;
