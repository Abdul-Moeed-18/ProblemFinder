import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Idea from '../models/Idea.js';

const r = Router();

r.use(auth);

r.get('/', async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();

        const filter = { owner: req.user._id };

        if (q) {
            const regex = new RegExp(
                q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                'i'
            );

            filter.$or = [
                { title: regex },
                { description: regex },
                { category: regex },
                { status: regex },
            ];
        }

        const ideas = await Idea.find(filter)
            .sort({ updatedAt: -1 })
            .lean();

        res.json(ideas);
    } catch (error) {
        console.error('GET IDEAS ERROR:', error);
        res.status(500).json({ message: 'Failed to load ideas' });
    }
});

r.post('/', async (req, res) => {
    try {
        const idea = await Idea.create({
            ...req.body,
            owner: req.user._id,
        });

        res.status(201).json(idea);
    } catch (error) {
        console.error('CREATE IDEA ERROR:', error);
        res.status(400).json({
            message: error.message || 'Failed to create idea',
        });
    }
});

r.get('/:id', async (req, res) => {
    try {
        const idea = await Idea.findOne({
            _id: req.params.id,
            owner: req.user._id,
        }).lean();

        if (!idea) {
            return res.status(404).json({ message: 'Idea not found' });
        }

        res.json(idea);
    } catch {
        res.status(400).json({ message: 'Invalid idea ID' });
    }
});

r.put('/:id', async (req, res) => {
    try {
        const idea = await Idea.findOneAndUpdate(
            {
                _id: req.params.id,
                owner: req.user._id,
            },
            { $set: req.body },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!idea) {
            return res.status(404).json({ message: 'Idea not found' });
        }

        res.json(idea);
    } catch (error) {
        console.error('UPDATE IDEA ERROR:', error);
        res.status(400).json({
            message: error.message || 'Failed to update idea',
        });
    }
});

r.delete('/:id', async (req, res) => {
    try {
        const idea = await Idea.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!idea) {
            return res.status(404).json({ message: 'Idea not found' });
        }

        res.json({ message: 'Idea deleted' });
    } catch {
        res.status(400).json({ message: 'Invalid idea ID' });
    }
});

export default r;