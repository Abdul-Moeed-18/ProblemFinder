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
        const now = new Date();

        // Counts only: much faster than loading every document from MongoDB.
        const [
            totalPlans,
            savedDocuments,
            totalProjects,
            activeProjects,
            completedTasks,
            pendingTasks,
            totalIdeas,
            savedLinks,
            unreadNotifications,
        ] = await Promise.all([
            Plan.countDocuments({ owner }),
            Document.countDocuments({ owner }),
            Project.countDocuments({ owner }),
            Project.countDocuments({ owner, status: { $regex: /^active$/i } }),
            Task.countDocuments({ owner, status: { $regex: /^completed$/i } }),
            Task.countDocuments({ owner, status: { $not: /^completed$/i } }),
            Idea.countDocuments({ owner }),
            Link.countDocuments({ owner }),
            Notification.countDocuments({ user: owner, read: false }),
        ]);

        // Only fetch a small number of recent records for the activity feed.
        const [plans, documents, projects, ideas, links] = await Promise.all([
            Plan.find({ owner }).select('title createdAt updatedAt').sort({ updatedAt: -1 }).limit(5).lean(),
            Document.find({ owner }).select('originalName createdAt updatedAt').sort({ updatedAt: -1 }).limit(5).lean(),
            Project.find({ owner }).select('name title createdAt updatedAt').sort({ updatedAt: -1 }).limit(5).lean(),
            Idea.find({ owner }).select('title createdAt updatedAt').sort({ updatedAt: -1 }).limit(5).lean(),
            Link.find({ owner }).select('name url createdAt updatedAt').sort({ updatedAt: -1 }).limit(5).lean(),
        ]);

        const activity = [
            ...plans.map((x) => ({ type: 'plan', id: x._id, title: x.title || 'Plan', date: x.updatedAt || x.createdAt })),
            ...documents.map((x) => ({ type: 'document', id: x._id, title: x.originalName || 'Document', date: x.updatedAt || x.createdAt })),
            ...projects.map((x) => ({ type: 'project', id: x._id, title: x.name || x.title || 'Project', date: x.updatedAt || x.createdAt })),
            ...ideas.map((x) => ({ type: 'idea', id: x._id, title: x.title || 'Idea', date: x.updatedAt || x.createdAt })),
            ...links.map((x) => ({ type: 'link', id: x._id, title: x.name || x.url || 'Link', date: x.updatedAt || x.createdAt })),
        ]
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
            .slice(0, 10);

        // Upcoming deadlines only. This avoids loading old records.
        const [planDeadlines, projectDeadlines, taskDeadlines] = await Promise.all([
            Plan.find({
                owner,
                $or: [
                    { deadline: { $gte: now } },
                    { dueDate: { $gte: now } },
                ],
            }).select('title deadline dueDate').sort({ deadline: 1, dueDate: 1 }).limit(8).lean(),

            Project.find({ owner, deadline: { $gte: now } })
                .select('name title deadline')
                .sort({ deadline: 1 })
                .limit(8)
                .lean(),

            Task.find({
                owner,
                deadline: { $gte: now },
                status: { $not: /^completed$/i },
            }).select('title deadline status').sort({ deadline: 1 }).limit(8).lean(),
        ]);

        const deadlines = [
            ...planDeadlines.map((x) => ({
                type: 'plan',
                id: x._id,
                title: x.title || 'Plan',
                deadline: x.deadline || x.dueDate,
            })),
            ...projectDeadlines.map((x) => ({
                type: 'project',
                id: x._id,
                title: x.name || x.title || 'Project',
                deadline: x.deadline,
            })),
            ...taskDeadlines.map((x) => ({
                type: 'task',
                id: x._id,
                title: x.title || 'Task',
                deadline: x.deadline,
            })),
        ]
            .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0))
            .slice(0, 8);

        res.json({
            counts: {
                // Names match Dashboard.jsx exactly.
                totalPlans,
                activeProjects,
                completedTasks,
                pendingTasks,
                savedDocuments,
                totalIdeas,
                savedLinks,
                unreadNotifications,
            },
            activity,
            deadlines,
        });
    } catch (error) {
        console.error('DASHBOARD ERROR:', error);
        res.status(500).json({ message: 'Failed to load dashboard' });
    }
});

export default r;
