import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || '',
  notificationsEnabled: user.notificationsEnabled ?? true,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.userSafe = publicUser(user);
    next();
  } catch (error) {
    console.error('AUTH ERROR:', error.name, error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
