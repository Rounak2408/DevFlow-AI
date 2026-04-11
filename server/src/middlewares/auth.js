import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.sub;
    req.globalRole = decoded.role;
    next();
  } catch {
    res.status(401);
    next(new Error('Invalid token'));
  }
}

export async function loadUser(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('-password -githubAccessToken');
    if (!user) {
      res.status(401);
      return next(new Error('User not found'));
    }
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

export function requireAdmin(req, res, next) {
  if (req.globalRole !== 'admin') {
    res.status(403);
    return next(new Error('Admin only'));
  }
  next();
}
