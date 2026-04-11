import { getProjectForUser } from '../utils/projectAccess.js';

function inferType(mime) {
  if (!mime) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'image';
}

export async function uploadChatMedia(req, res, next) {
  try {
    const { id } = req.params;
    const { error, status } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    if (!req.file) {
      res.status(400);
      return next(new Error('No file uploaded'));
    }
    const type = inferType(req.file.mimetype);
    const url = `/api/uploads/chat/${id}/${req.file.filename}`;
    res.json({
      url,
      type,
      name: req.file.originalname || req.file.filename,
    });
  } catch (e) {
    next(e);
  }
}
