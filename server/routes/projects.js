import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const r = Router();
r.use(auth);

// GET projects
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
                { name: regex },
                { title: regex },
                { description: regex },
                { status: regex },
            ];
        }

        const projects = await Project.find(filter)
            .sort({ updatedAt: -1 })
            .lean();

        res.json(projects);
    } catch (error) {
        console.error('GET PROJECTS ERROR:', error);
        res.status(500).json({ message: 'Failed to load projects' });
    }
});

// CREATE project
r.post('/', async (req, res) => {
    try {
        const project = await Project.create({
            ...req.body,
            owner: req.user._id,
            members: [req.user._id],
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('CREATE PROJECT ERROR:', error);
        res.status(400).json({
            message: error.message || 'Failed to create project',
        });
    }
});

// GET project + tasks
r.get('/:id', async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user._id,
        }).lean();

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            });
        }

        const tasks = await Task.find({
            project: project._id,
            owner: req.user._id,
        })
            .sort({ updatedAt: -1 })
            .lean();

        res.json({
            ...project,
            tasks,
        });
    } catch (error) {
        console.error('GET PROJECT ERROR:', error);
        res.status(400).json({ message: 'Invalid project ID' });
    }
});

// UPDATE project
r.put('/:id', async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
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

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            });
        }

        res.json(project);
    } catch (error) {
        console.error('UPDATE PROJECT ERROR:', error);
        res.status(400).json({
            message: error.message || 'Failed to update project',
        });
    }
});

// DELETE project + its tasks
r.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            });
        }

        await Task.deleteMany({
            project: project._id,
            owner: req.user._id,
        });

        res.json({
            message: 'Project deleted',
        });
    } catch (error) {
        console.error('DELETE PROJECT ERROR:', error);
        res.status(400).json({ message: 'Invalid project ID' });
    }
});

// CREATE task inside project
r.post('/:projectId/tasks', async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.projectId,
            owner: req.user._id,
        });

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            });
        }

        const task = await Task.create({
            ...req.body,
            project: project._id,
            owner: req.user._id,
        });

        res.status(201).json(task);
    } catch (error) {
        console.error('CREATE PROJECT TASK ERROR:', error);
        res.status(400).json({
            message: error.message || 'Failed to create task',
        });
    }
});

// ADD member
r.post('/:id/members', async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            });
        }

        const email = String(req.body.email || '').trim().toLowerCase();

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'User with that email was not found',
            });
        }

        const exists = project.members.some(
            (member) => String(member) === String(user._id)
        );

        if (!exists) {
            project.members.push(user._id);
            await project.save();
        }

        res.json(project);
    } catch (error) {
        console.error('ADD MEMBER ERROR:', error);
        res.status(400).json({
            message: error.message || 'Failed to add member',
        });
    }
});

// REMOVE member
r.delete('/:id/members/:memberId', async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            });
        }

        project.members = project.members.filter(
            (member) => String(member) !== String(req.params.memberId)
        );

        await project.save();

        res.json(project);
    } catch (error) {
        console.error('REMOVE MEMBER ERROR:', error);
        res.status(400).json({
            message: error.message || 'Failed to remove member',
        });
    }
});

export default r;