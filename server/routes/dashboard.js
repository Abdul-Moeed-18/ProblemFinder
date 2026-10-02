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
            Plan.find({ owner })
                .sort({ updatedAt: -1 })
                .lean(),

            Document.find({ owner })
                .select('-data')
                .sort({ updatedAt: -1 })
                .lean(),

            Project.find({ owner })
                .sort({ updatedAt: -1 })
                .lean(),

            Task.find({ owner })
                .sort({ updatedAt: -1 })
                .lean(),

            Idea.find({ owner })
                .sort({ updatedAt: -1 })
                .lean(),

            Link.find({ owner })
                .sort({ updatedAt: -1 })
                .lean(),

            Notification.countDocuments({
                user: owner,
                read: false,
            }),
        ]);

        // -----------------------------
        // COUNTS
        // -----------------------------

        const activeProjects = projects.filter(
            (project) =>
                String(project.status || '').toLowerCase() !== 'completed' &&
                String(project.status || '').toLowerCase() !== 'archived'
        ).length;

        const completedTasks = tasks.filter(
            (task) =>
                String(task.status || '').toLowerCase() === 'completed'
        ).length;

        const pendingTasks = tasks.filter(
            (task) =>
                String(task.status || '').toLowerCase() !== 'completed'
        ).length;

        const counts = {
            totalPlans: plans.length,

            activeProjects,

            completedTasks,

            pendingTasks,

            savedDocuments: documents.length,

            totalIdeas: ideas.length,

            savedLinks: links.length,

            unreadNotifications,
        };

        // -----------------------------
        // RECENT ACTIVITY
        // -----------------------------

        const activity = [
            ...plans.map((item) => ({
                type: 'plan',
                id: item._id,
                title: item.title || 'Plan',
                updatedAt:
                    item.updatedAt ||
                    item.createdAt ||
                    new Date(),
            })),

            ...documents.map((item) => ({
                type: 'document',
                id: item._id,
                title:
                    item.originalName ||
                    'Document',
                updatedAt:
                    item.updatedAt ||
                    item.createdAt ||
                    new Date(),
            })),

            ...projects.map((item) => ({
                type: 'project',
                id: item._id,
                title:
                    item.name ||
                    item.title ||
                    'Project',
                updatedAt:
                    item.updatedAt ||
                    item.createdAt ||
                    new Date(),
            })),

            ...tasks.map((item) => ({
                type: 'task',
                id: item._id,
                title:
                    item.title ||
                    'Task',
                updatedAt:
                    item.updatedAt ||
                    item.createdAt ||
                    new Date(),
            })),

            ...ideas.map((item) => ({
                type: 'idea',
                id: item._id,
                title:
                    item.title ||
                    'Idea',
                updatedAt:
                    item.updatedAt ||
                    item.createdAt ||
                    new Date(),
            })),

            ...links.map((item) => ({
                type: 'link',
                id: item._id,
                title:
                    item.name ||
                    item.url ||
                    'Link',
                updatedAt:
                    item.updatedAt ||
                    item.createdAt ||
                    new Date(),
            })),
        ]
            .sort(
                (a, b) =>
                    new Date(b.updatedAt || 0) -
                    new Date(a.updatedAt || 0)
            )
            .slice(0, 10);

        // -----------------------------
        // UPCOMING DEADLINES
        // -----------------------------

        const deadlines = [
            ...plans
                .filter(
                    (item) =>
                        item.deadline ||
                        item.dueDate
                )
                .map((item) => ({
                    type: 'plan',
                    id: item._id,
                    title:
                        item.title ||
                        'Plan',
                    deadline:
                        item.deadline ||
                        item.dueDate,
                })),

            ...projects
                .filter(
                    (item) =>
                        item.deadline
                )
                .map((item) => ({
                    type: 'project',
                    id: item._id,
                    title:
                        item.name ||
                        item.title ||
                        'Project',
                    deadline:
                        item.deadline,
                })),

            ...tasks
                .filter(
                    (item) =>
                        item.deadline &&
                        String(
                            item.status || ''
                        ).toLowerCase() !==
                        'completed'
                )
                .map((item) => ({
                    type: 'task',
                    id: item._id,
                    title:
                        item.title ||
                        'Task',
                    deadline:
                        item.deadline,
                })),
        ]
            .sort(
                (a, b) =>
                    new Date(a.deadline || 0) -
                    new Date(b.deadline || 0)
            )
            .slice(0, 8);

        // -----------------------------
        // RESPONSE
        // -----------------------------

        res.json({
            success: true,

            counts,

            activity,

            deadlines,
        });

    } catch (error) {
        console.error(
            'DASHBOARD ERROR:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Failed to load dashboard',
        });
    }
});

export default r;