import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: '',
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: true,
    }
);

const planSchema = new mongoose.Schema(
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

        goal: {
            type: String,
            default: '',
        },

        steps: {
            type: [stepSchema],
            default: [],
        },

        status: {
            type: String,
            default: 'active',
        },

        dueDate: {
            type: Date,
            default: null,
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

export default mongoose.model('Plan', planSchema);