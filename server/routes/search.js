import { Router } from 'express';
import { auth } from '../middleware/auth.js';

import Plan from '../models/Plan.js';
import Document from '../models/Document.js';
import Project from '../models/Project.js';
import Idea from '../models/Idea.js';
import Link from '../models/Link.js';

const r = Router();

r.use(auth);

r.get('/', async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();

        if (!q) {
            return res.json({
                plans: [],
                documents: [],
                projects: [],
                ideas: [],
                links: [],
            });
        }

        const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(safeQ, 'i');

        const owner = req.user._id;

        const [plans, documents, projects, ideas, links] =
            await Promise.all([
                Plan.find({
                    owner,
                    $or: [
                        { title: regex },
                        { description: regex },
                        { goal: regex },
                    ],
                })
                    .sort({ updatedAt: -1 })
                    .limit(8)
                    .lean(),

                Document.find({
                    owner,
                    $or: [
                        { originalName: regex },
                        { description: regex },
                        { category: regex },
                        { tags: regex },
                    ],
                })
                    .sort({ updatedAt: -1 })
                    .limit(8)
                    .lean(),

                Project.find({
                    owner,
                    $or: [
                        { name: regex },
                        { description: regex },
                        { status: regex },
                    ],
                })
                    .sort({ updatedAt: -1 })
                    .limit(8)
                    .lean(),

                Idea.find({
                    owner,
                    $or: [
                        { title: regex },
                        { description: regex },
                        { category: regex },
                        { status: regex },
                    ],
                })
                    .sort({ updatedAt: -1 })
                    .limit(8)
                    .lean(),

                Link.find({
                    owner,
                    $or: [
                        { name: regex },
                        { url: regex },
                        { description: regex },
                        { category: regex },
                    ],
                })
                    .sort({ updatedAt: -1 })
                    .limit(8)
                    .lean(),
            ]);

        res.json({
            plans,
            documents,
            projects,
            ideas,
            links,
        });
    } catch (error) {
        console.error('GLOBAL SEARCH ERROR:', error);

        res.status(500).json({
            message: 'Search failed',
        });
    }
});

export default r;