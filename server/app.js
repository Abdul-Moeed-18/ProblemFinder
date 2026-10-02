import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
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
import { notFound, errorHandler } from './middleware/error.js';
import { validateEnv } from './config/env.js';

validateEnv();

const app = express();

const configuredOrigins = String(
    process.env.CLIENT_URL || 'http://localhost:5173'
)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        // Allow non-browser requests (health checks, Vercel, curl) without an Origin header.
        if (!origin || configuredOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('CORS origin not allowed'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 500,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        service: 'ProblemFinder API',
        storage: 'MongoDB',
    });
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

export default app;