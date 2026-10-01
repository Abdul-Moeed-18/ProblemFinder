import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        title: {
            type: String,
            default: '',
        },

        message: {
            type: String,
            default: '',
        },

        type: {
            type: String,
            default: 'info',
        },

        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        strict: false,
    }
);

export default mongoose.model('Notification', notificationSchema);