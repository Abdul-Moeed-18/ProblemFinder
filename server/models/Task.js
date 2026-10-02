import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null,
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

        status: {
            type: String,
            default: 'Pending',
        },

        priority: {
            type: String,
            default: 'Medium',
        },

        deadline: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        strict: false,
    }
);

taskSchema.index({ owner: 1, updatedAt: -1 });
taskSchema.index({ owner: 1, deadline: 1 });

export default mongoose.model('Task', taskSchema);