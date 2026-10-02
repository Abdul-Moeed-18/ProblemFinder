import 'dotenv/config';
import bcrypt from 'bcryptjs';

import app from './app.js';
import User from './models/User.js';
import { connectDB } from './config/db.js';

const port = Number(process.env.PORT || 5000);

async function startServer() {
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
      `MongoDB demo account created: ${demoEmail} / ${demoPassword}`
    );
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(
      `ProblemFinder API RUNNING: http://localhost:${port}`
    );
  });
}

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});