import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Task from '../models/Task.js';

const r = Router();

r.use(auth);

// UPDATE task
r.put('/:id', async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
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

        if (!task) {
            return res.status(404).json({
                message: 'Task not found',
            });
        }

        res.json(task);
    } catch (error) {
        console.error('UPDATE TASK ERROR:', error);

        res.status(400).json({
            message: error.message || 'Failed to update task',
        });
    }
});

// DELETE task
r.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                message: 'Task not found',
            });
        }

        res.json({
            message: 'Task deleted',
        });
    } catch (error) {
        console.error('DELETE TASK ERROR:', error);

        res.status(400).json({
            message: 'Invalid task ID',
        });
    }
});

export default r;