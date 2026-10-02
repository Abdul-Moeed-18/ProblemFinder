export function validateEnv() {
  const required = ['MONGODB_URI', 'JWT_SECRET'];

  const missing = required.filter((name) => !process.env[name]);

  if (missing.length) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}`
    );
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
}
