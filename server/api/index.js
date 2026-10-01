import app from '../server.js';
import { connectDB } from '../config/db.js';

let initialized = false;

async function initialize() {
    if (initialized) return;

    await connectDB();
    initialized = true;
}

export default async function handler(req, res) {
    try {
        await initialize();
        return app(req, res);
    } catch (error) {
        console.error('Vercel API initialization error:', error);

        return res.status(500).json({
            message: 'Server initialization failed',
        });
    }
}