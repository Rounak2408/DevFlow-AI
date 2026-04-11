import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const MAX_SIZE = 80 * 1024 * 1024; // 80 MB

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/mp3',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
]);

function storageForProject() {
  return multer.diskStorage({
    destination: (req, _file, cb) => {
      const dir = path.join(process.cwd(), 'uploads', 'chat', String(req.params.id));
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '') || guessExt(file.mimetype);
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

function guessExt(mime) {
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/gif') return '.gif';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'video/mp4') return '.mp4';
  if (mime === 'video/webm') return '.webm';
  if (mime === 'video/quicktime') return '.mov';
  if (mime === 'audio/webm') return '.webm';
  if (mime === 'audio/mpeg' || mime === 'audio/mp3') return '.mp3';
  if (mime === 'audio/ogg') return '.ogg';
  if (mime === 'audio/wav' || mime === 'audio/x-wav') return '.wav';
  return '';
}

export const chatUploadMulter = multer({
  storage: storageForProject(),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'), false);
  },
});
