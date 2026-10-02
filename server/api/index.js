import app from '../app.js';
import { connectDB } from '../config/db.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { validateEnv } from '../config/env.js';

let initializationPromise = null;

validateEnv();

async function initialize() {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            await connectDB();

            const demoEmail = 'demo@problemfinder.local';
            const demoPassword = 'Demo1234';

            const existingDemo = await User.findOne({
                email: demoEmail,
            });

            if (!existingDemo) {
                const password = await bcrypt.hash(demoPassword, 12);

                await User.create({
                    name: 'Demo User',
                    email: demoEmail,
                    password,
                    avatar: '',
                    notificationsEnabled: true,
                });

                console.log(
                    `MongoDB demo account created: ${demoEmail}`
                );
            }
        })();
    }

    return initializationPromise;
}

export default async function handler(req, res) {
    try {
        await initialize();

        return app(req, res);
    } catch (error) {
        console.error('Vercel API error:', error);

        return res.status(500).json({
            ok: false,
            message: 'Server initialization failed',
            error:
                process.env.NODE_ENV === 'production'
                    ? undefined
                    : error.message,
        });
    }
}