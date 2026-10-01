import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const r = Router();

r.use(auth);

// Get notifications
r.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({
            user: req.user._id,
        })
            .sort({ createdAt: -1 })
            .lean();

        res.json(notifications);
    } catch (error) {
        console.error('GET NOTIFICATIONS ERROR:', error);
        res.status(500).json({
            message: 'Failed to load notifications',
        });
    }
});

// Mark all as read
r.put('/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('READ ALL NOTIFICATIONS ERROR:', error);
        res.status(500).json({
            message: 'Failed to mark notifications as read',
        });
    }
});

// Mark one as read
r.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id,
            },
            { $set: { read: true } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found',
            });
        }

        res.json(notification);
    } catch (error) {
        console.error('READ NOTIFICATION ERROR:', error);
        res.status(400).json({
            message: 'Invalid notification ID',
        });
    }
});

// Delete one
r.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found',
            });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('DELETE NOTIFICATION ERROR:', error);
        res.status(400).json({
            message: 'Invalid notification ID',
        });
    }
});

export default r;