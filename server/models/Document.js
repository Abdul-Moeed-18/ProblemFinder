import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    // Kept for backwards compatibility with older records.
    storedName: {
      type: String,
      default: '',
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    // File bytes are persisted in MongoDB instead of Vercel's ephemeral filesystem.
    data: {
      type: Buffer,
      required: true,
      select: false,
    },

    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },

    category: {
      type: String,
      default: 'Other',
      maxlength: 100,
    },

    tags: {
      type: [String],
      default: [],
    },

    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Document', documentSchema);
