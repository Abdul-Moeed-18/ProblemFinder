import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Plan from '../models/Plan.js';

const r = Router();

r.use(auth);

// GET all plans
r.get('/', async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();

        const filter = {
            owner: req.user._id,
        };

        if (q) {
            const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

            filter.$or = [
                { title: regex },
                { description: regex },
                { goal: regex },
            ];
        }

        const plans = await Plan.find(filter)
            .sort({ updatedAt: -1 })
            .lean();

        res.json(plans);
    } catch (error) {
        console.error('GET PLANS ERROR:', error);
        res.status(500).json({
            message: 'Failed to load plans',
        });
    }
});

// CREATE plan
r.post('/', async (req, res) => {
    try {
        const plan = await Plan.create({
            ...req.body,
            owner: req.user._id,
            steps: Array.isArray(req.body.steps) ? req.body.steps : [],
        });

        res.status(201).json(plan);
    } catch (error) {
        console.error('CREATE PLAN ERROR:', error);

        res.status(400).json({
            message: error.message || 'Failed to create plan',
        });
    }
});

// GET single plan
r.get('/:id', async (req, res) => {
    try {
        const plan = await Plan.findOne({
            _id: req.params.id,
            owner: req.user._id,
        }).lean();

        if (!plan) {
            return res.status(404).json({
                message: 'Plan not found',
            });
        }

        res.json(plan);
    } catch (error) {
        console.error('GET PLAN ERROR:', error);

        res.status(400).json({
            message: 'Invalid plan ID',
        });
    }
});

// UPDATE plan
r.put('/:id', async (req, res) => {
    try {
        const plan = await Plan.findOneAndUpdate(
            {
                _id: req.params.id,
                owner: req.user._id,
            },
            {
                $set: req.body,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!plan) {
            return res.status(404).json({
                message: 'Plan not found',
            });
        }

        res.json(plan);
    } catch (error) {
        console.error('UPDATE PLAN ERROR:', error);

        res.status(400).json({
            message: error.message || 'Failed to update plan',
        });
    }
});

// DELETE plan
r.delete('/:id', async (req, res) => {
    try {
        const plan = await Plan.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!plan) {
            return res.status(404).json({
                message: 'Plan not found',
            });
        }

        res.json({
            message: 'Plan deleted',
        });
    } catch (error) {
        console.error('DELETE PLAN ERROR:', error);

        res.status(400).json({
            message: 'Invalid plan ID',
        });
    }
});

export default r;