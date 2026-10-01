import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

import authRoutes from './routes/auth.js';
import planRoutes from './routes/plans.js';
import documentRoutes from './routes/documents.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import ideaRoutes from './routes/ideas.js';
import linkRoutes from './routes/links.js';
import notificationRoutes from './routes/notifications.js';
import searchRoutes from './routes/search.js';
import dashboardRoutes from './routes/dashboard.js';
import User from './models/User.js';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/error.js';

fs.mkdirSync(path.resolve('data'), { recursive: true });
fs.mkdirSync(path.resolve('uploads'), { recursive: true });

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'ProblemFinder API', storage: 'MongoDB' });
});

app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

await connectDB();

const demoEmail = 'demo@problemfinder.local';
const demoPassword = 'Demo1234';
const existingDemo = await User.findOne({ email: demoEmail });

if (!existingDemo) {
  const password = await bcrypt.hash(demoPassword, 12);

  await User.create({
    name: 'Demo User',
    email: demoEmail,
    password,
    avatar: '',
    notificationsEnabled: true,
  });

  console.log(`MongoDB demo account created: ${demoEmail} / ${demoPassword}`);
}
export default app;
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`ProblemFinder API RUNNING: http://127.0.0.1:${port}`);
});

server.on('error', (err) => console.error('SERVER ERROR:', err));
server.on('close', () => console.log('SERVER CLOSED'));
