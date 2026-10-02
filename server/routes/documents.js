import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import Document from '../models/Document.js';

const r = Router();

r.use(auth);

r.get('/', async (req, res, next) => {
  try {
    let documents = await Document.find({ owner: req.user._id })
      .select('-data')
      .sort({ updatedAt: -1 });

    const q = String(req.query.q || '').trim().toLowerCase();

    if (q) {
      documents = documents.filter((x) =>
        JSON.stringify(x).toLowerCase().includes(q)
      );
    }

    res.json(documents);
  } catch (error) {
    next(error);
  }
});

r.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'A supported file is required' });
    }

    const tags = String(req.body.tags || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const document = await Document.create({
      owner: req.user._id,
      originalName: req.file.originalname,
      storedName: '',
      data: req.file.buffer,
      mimeType: req.file.mimetype,
      size: req.file.size,
      description: req.body.description || '',
      category: req.body.category || 'Other',
      tags,
      favorite: false,
    });

    const safeDocument = document.toObject();
    delete safeDocument.data;
    res.status(201).json(safeDocument);
  } catch (error) {
    next(error);
  }
});

r.get('/:id/download', async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).select('+data');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${String(document.originalName).replace(/"/g, '')}"`
    );
    res.setHeader('Content-Length', document.data.length);
    return res.send(document.data);
  } catch (error) {
    next(error);
  }
});

r.get('/:id', async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).select('-data');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
});

r.put('/:id', async (req, res, next) => {
  try {
    const patch = { ...req.body };

    if (typeof patch.tags === 'string') {
      patch.tags = patch.tags
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
    }

    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      patch,
      { new: true, runValidators: true }
    ).select('-data');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
});

r.delete('/:id', async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
});

export default r;
