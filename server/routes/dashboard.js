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

        const [
            plans,
            documents,
            projects,
            tasks,
            ideas,
            links,
            unreadNotifications,
        ] = await Promise.all([
            Plan.find({ owner }).lean(),
            Document.find({ owner }).lean(),
            Project.find({ owner }).lean(),
            Task.find({ owner }).lean(),
            Idea.find({ owner }).lean(),
            Link.find({ owner }).lean(),
            Notification.countDocuments({
                user: owner,
                read: false,
            }),
        ]);

        const counts = {
            plans: plans.length,
            documents: documents.length,
            projects: projects.length,
            tasks: tasks.length,
            ideas: ideas.length,
            links: links.length,
            unreadNotifications,
        };

        const activity = [
            ...plans.map((x) => ({
                type: 'plan',
                id: x._id,
                title: x.title || 'Plan',
                updatedAt: x.updatedAt || x.createdAt,
            })),

            ...documents.map((x) => ({
                type: 'document',
                id: x._id,
                title: x.originalName || 'Document',
                updatedAt: x.updatedAt || x.createdAt,
            })),

            ...projects.map((x) => ({
                type: 'project',
                id: x._id,
                title: x.name || x.title || 'Project',
                updatedAt: x.updatedAt || x.createdAt,
            })),

            ...ideas.map((x) => ({
                type: 'idea',
                id: x._id,
                title: x.title || 'Idea',
                updatedAt: x.updatedAt || x.createdAt,
            })),

            ...links.map((x) => ({
                type: 'link',
                id: x._id,
                title: x.name || x.url || 'Link',
                updatedAt: x.updatedAt || x.createdAt,
            })),
        ]
            .sort(
                (a, b) =>
                    new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
            )
            .slice(0, 10);

        const deadlines = [
            ...plans
                .filter((x) => x.deadline || x.dueDate)
                .map((x) => ({
                    type: 'plan',
                    id: x._id,
                    title: x.title || 'Plan',
                    deadline: x.deadline || x.dueDate,
                })),

            ...projects
                .filter((x) => x.deadline)
                .map((x) => ({
                    type: 'project',
                    id: x._id,
                    title: x.name || x.title || 'Project',
                    deadline: x.deadline,
                })),

            ...tasks
                .filter(
                    (x) =>
                        x.deadline &&
                        String(x.status || '').toLowerCase() !== 'completed'
                )
                .map((x) => ({
                    type: 'task',
                    id: x._id,
                    title: x.title || 'Task',
                    deadline: x.deadline,
                })),
        ]
            .sort(
                (a, b) =>
                    new Date(a.deadline || 0) - new Date(b.deadline || 0)
            )
            .slice(0, 8);

        res.json({
            counts,
            activity,
            deadlines,
        });
    } catch (error) {
        console.error('DASHBOARD ERROR:', error);
        res.status(500).json({
            message: 'Failed to load dashboard',
        });
    }
});

export default r;