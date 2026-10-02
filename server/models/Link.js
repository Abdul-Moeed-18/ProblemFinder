import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        name: {
            type: String,
            default: '',
            trim: true,
        },

        url: {
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
    },
    {
        timestamps: true,
        strict: false,
    }
);

linkSchema.index({ owner: 1, updatedAt: -1 });

export default mongoose.model('Link', linkSchema);