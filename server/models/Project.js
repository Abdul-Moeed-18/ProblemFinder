import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      default: 'Active',
    },

    deadline: {
      type: Date,
      default: null,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    strict: false,
  }
);

projectSchema.index({ owner: 1, updatedAt: -1 });
projectSchema.index({ owner: 1, deadline: 1 });

export default mongoose.model('Project', projectSchema);