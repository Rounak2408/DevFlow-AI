import multer from 'multer';
import path from 'path';
import fs from 'fs';

const MAX = 3 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const avatarUploadMulter = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(process.cwd(), 'uploads', 'avatars');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '') || '.jpg';
      cb(null, `${req.userId}${ext}`);
    },
  }),
  limits: { fileSize: MAX },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error('Use JPG, PNG, WebP, or GIF'), false);
  },
});
