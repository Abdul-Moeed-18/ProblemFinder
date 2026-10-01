import mongoose from 'mongoose';

let connectionPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI);
  }

  try {
    await connectionPromise;

    console.log('MongoDB Atlas connected successfully');

    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;

    console.error(
      'MongoDB connection failed:',
      error.message
    );

    throw error;
  }
}