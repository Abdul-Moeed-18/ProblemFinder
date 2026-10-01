import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Link from '../models/Link.js';

const r = Router();

r.use(auth);

r.get('/', async (req, res) => {
    try {
        const links = await Link.find({
            owner: req.user._id,
        })
            .sort({ updatedAt: -1 })
            .lean();

        res.json(links);
    } catch (error) {
        console.error('GET LINKS ERROR:', error);
        res.status(500).json({ message: 'Failed to load links' });
    }
});

r.post('/', async (req, res) => {
    try {
        const url = String(req.body.url || '').trim();

        if (!/^https?:\/\//i.test(url)) {
            return res.status(400).json({
                message: 'URL must start with http:// or https://',
            });
        }

        const link = await Link.create({
            ...req.body,
            url,
            owner: req.user._id,
        });

        res.status(201).json(link);
    } catch (error) {
        console.error('CREATE LINK ERROR:', error);

        res.status(400).json({
            message: error.message || 'Failed to create link',
        });
    }
});

r.get('/:id', async (req, res) => {
    try {
        const link = await Link.findOne({
            _id: req.params.id,
            owner: req.user._id,
        }).lean();

        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }

        res.json(link);
    } catch {
        res.status(400).json({ message: 'Invalid link ID' });
    }
});

r.put('/:id', async (req, res) => {
    try {
        const link = await Link.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }

        const updates = { ...req.body };

        if (updates.url !== undefined) {
            const url = String(updates.url).trim();

            if (!/^https?:\/\//i.test(url)) {
                return res.status(400).json({
                    message: 'URL must start with http:// or https://',
                });
            }

            updates.url = url;
        }

        Object.assign(link, updates);

        await link.save();

        res.json(link);
    } catch (error) {
        console.error('UPDATE LINK ERROR:', error);

        res.status(400).json({
            message: error.message || 'Failed to update link',
        });
    }
});

r.delete('/:id', async (req, res) => {
    try {
        const link = await Link.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }

        res.json({ message: 'Link deleted' });
    } catch {
        res.status(400).json({ message: 'Invalid link ID' });
    }
});

export default r;