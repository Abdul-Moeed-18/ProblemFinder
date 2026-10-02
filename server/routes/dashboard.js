import { Router } from 'express';
import { auth } from '../middleware/auth.js';

import Plan from '../models/Plan.js';
import Document from '../models/Document.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Idea from '../models/Idea.js';
import Link from '../models/Link.js';
import Notification from '../models/Notification.js';

const r = Router();
r.use(auth);

r.get('/', async (req, res) => {
    try {
        const owner = req.user._id;
        const recentLimit = 10;

        // Keep dashboard payloads small. Previously this endpoint loaded every
        // record from every collection and counted in JavaScript.
        const [
            totalPlans,
            activeProjects,
            completedTasks,
            pendingTasks,
            savedDocuments,
            totalIdeas,
            savedLinks,
            unreadNotifications,
            plans,
            documents,
            projects,
            tasks,
            ideas,
            links,
            deadlinesPlans,
            deadlinesProjects,
            deadlinesTasks,
        ] = await Promise.all([
            Plan.countDocuments({ owner }),
            Project.countDocuments({ owner, status: { $not: /^(completed|archived)$/i } }),
            Task.countDocuments({ owner, status: /^(completed)$/i }),
            Task.countDocuments({ owner, status: { $not: /^completed$/i } }),
            Document.countDocuments({ owner }),
            Idea.countDocuments({ owner }),
            Link.countDocuments({ owner }),
            Notification.countDocuments({ user: owner, read: false }),

            Plan.find({ owner }).sort({ updatedAt: -1 }).limit(recentLimit).lean(),
            Document.find({ owner }).select('-data').sort({ updatedAt: -1 }).limit(recentLimit).lean(),
            Project.find({ owner }).sort({ updatedAt: -1 }).limit(recentLimit).lean(),
            Task.find({ owner }).sort({ updatedAt: -1 }).limit(recentLimit).lean(),
            Idea.find({ owner }).sort({ updatedAt: -1 }).limit(recentLimit).lean(),
            Link.find({ owner }).sort({ updatedAt: -1 }).limit(recentLimit).lean(),

            Plan.find({ owner, $or: [{ deadline: { $ne: null } }, { dueDate: { $ne: null } }] })
                .sort({ deadline: 1, dueDate: 1 }).limit(8).lean(),
            Project.find({ owner, deadline: { $ne: null } })
                .sort({ deadline: 1 }).limit(8).lean(),
            Task.find({ owner, deadline: { $ne: null }, status: { $not: /^completed$/i } })
                .sort({ deadline: 1 }).limit(8).lean(),
        ]);

        const counts = {
            totalPlans,
            activeProjects,
            completedTasks,
            pendingTasks,
            savedDocuments,
            totalIdeas,
            savedLinks,
            unreadNotifications,
        };

        const activity = [
            ...plans.map((item) => ({ type: 'plan', id: item._id, title: item.title || 'Plan', updatedAt: item.updatedAt || item.createdAt || new Date() })),
            ...documents.map((item) => ({ type: 'document', id: item._id, title: item.originalName || 'Document', updatedAt: item.updatedAt || item.createdAt || new Date() })),
            ...projects.map((item) => ({ type: 'project', id: item._id, title: item.name || item.title || 'Project', updatedAt: item.updatedAt || item.createdAt || new Date() })),
            ...tasks.map((item) => ({ type: 'task', id: item._id, title: item.title || 'Task', updatedAt: item.updatedAt || item.createdAt || new Date() })),
            ...ideas.map((item) => ({ type: 'idea', id: item._id, title: item.title || 'Idea', updatedAt: item.updatedAt || item.createdAt || new Date() })),
            ...links.map((item) => ({ type: 'link', id: item._id, title: item.name || item.url || 'Link', updatedAt: item.updatedAt || item.createdAt || new Date() })),
        ]
            .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
            .slice(0, 10);

        const deadlines = [
            ...deadlinesPlans
                .filter((item) => item.deadline || item.dueDate)
                .map((item) => ({ type: 'plan', id: item._id, title: item.title || 'Plan', deadline: item.deadline || item.dueDate })),
            ...deadlinesProjects.map((item) => ({ type: 'project', id: item._id, title: item.name || item.title || 'Project', deadline: item.deadline })),
            ...deadlinesTasks.map((item) => ({ type: 'task', id: item._id, title: item.title || 'Task', deadline: item.deadline })),
        ]
            .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0))
            .slice(0, 8);

        res.json({ success: true, counts, activity, deadlines });
    } catch (error) {
        console.error('DASHBOARD ERROR:', error);
        res.status(500).json({ success: false, message: 'Failed to load dashboard' });
    }
});

export default r;
