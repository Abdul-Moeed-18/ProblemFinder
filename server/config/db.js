import mongoose from 'mongoose';

// Reuse the same connection across warm Vercel invocations.
let connectionPromise = null;

const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  // readyState 2 means a connection is already being established.
  // Reuse that promise instead of opening another connection.
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, mongoOptions)
      .then(() => {
        console.log('MongoDB Atlas connected successfully');
        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error('MongoDB connection failed:', error.message);
        throw error;
      });
  }

  return connectionPromise;
}
