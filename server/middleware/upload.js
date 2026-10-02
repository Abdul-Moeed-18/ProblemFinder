import multer from 'multer';

const allowed = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

// Vercel Functions do not provide durable writable local storage.
// Keep uploads in memory and persist the file bytes in MongoDB.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    // Vercel currently limits incoming Function payloads to 4.5 MB.
    // Keep the file itself below that limit to leave room for multipart fields.
    fileSize: Number(process.env.MAX_FILE_SIZE || 4 * 1024 * 1024),
  },
  fileFilter: (req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }

    cb(null, true);
  },
});
