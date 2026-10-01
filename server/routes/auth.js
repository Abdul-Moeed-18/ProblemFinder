import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const r = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-me';
const normalize = (email) => String(email || '').trim().toLowerCase();

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || '',
  notificationsEnabled: user.notificationsEnabled ?? true,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createToken = (user) => jwt.sign(
  { id: user._id.toString() },
  JWT_SECRET,
  { expiresIn: '7d' }
);

r.post('/register', async (req, res, next) => {
  try {
    const { name, password, confirmPassword } = req.body;
    const email = normalize(req.body.email);

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: String(name).trim(),
      email,
      password: hashedPassword,
      avatar: '',
      notificationsEnabled: true,
    });

    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

r.post('/login', async (req, res, next) => {
  try {
    const email = normalize(req.body.email);
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

r.get('/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));

r.put('/profile', auth, async (req, res, next) => {
  try {
    const patch = {};
    if (req.body.name) patch.name = String(req.body.name).trim();

    if (req.body.email) {
      const email = normalize(req.body.email);
      const taken = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (taken) return res.status(409).json({ message: 'Email already registered' });
      patch.email = email;
    }

    if (typeof req.body.notificationsEnabled === 'boolean') {
      patch.notificationsEnabled = req.body.notificationsEnabled;
    }

    const user = await User.findByIdAndUpdate(req.user._id, patch, {
      new: true,
      runValidators: true,
    });

    return res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

r.put('/password', auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const valid = await bcrypt.compare(currentPassword || '', req.user.password || '');

    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      password: await bcrypt.hash(newPassword, 12),
    });

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

export default r;
