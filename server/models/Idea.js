import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: '',
        },

        category: {
            type: String,
            default: '',
        },

        status: {
            type: String,
            default: 'New',
        },
    },
    {
        timestamps: true,
        strict: false,
    }
);

ideaSchema.index({ owner: 1, updatedAt: -1 });

export default mongoose.model('Idea', ideaSchema);