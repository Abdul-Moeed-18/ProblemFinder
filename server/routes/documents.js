import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import Document from '../models/Document.js';

const r = Router();

r.use(auth);

r.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();

    const filter = { owner: req.user._id };

    if (q) {
      const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(safeQ, 'i');

      filter.$or = [
        { originalName: regex },
        { description: regex },
        { category: regex },
        { tags: regex },
      ];
    }

    // `data` is select:false, so listing documents never returns file bytes.
    const documents = await Document.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    res.json(documents);
  } catch (error) {
    next(error);
  }
});

r.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        message: 'A supported file is required',
      });
    }

    const tags = String(req.body.tags || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const document = await Document.create({
      owner: req.user._id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      description: String(req.body.description || ''),
      category: String(req.body.category || 'Other'),
      tags,
      favorite: false,
    });

    // Do not send binary data back to the browser.
    const response = document.toObject();
    delete response.data;

    res.status(201).json(response);
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
      return res.status(404).json({
        message: 'Document not found',
      });
    }

    if (!document.data) {
      return res.status(410).json({
        message: 'This document has no stored file data. Please upload it again.',
      });
    }

    res.set({
      'Content-Type': document.mimeType,
      'Content-Length': String(document.data.length),
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(document.originalName)}`,
      'Cache-Control': 'private, no-store',
    });

    res.send(document.data);
  } catch (error) {
    next(error);
  }
});

r.get('/:id', async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: 'Document not found',
      });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
});

r.put('/:id', async (req, res, next) => {
  try {
    const patch = {
      ...req.body,
    };

    if (typeof patch.tags === 'string') {
      patch.tags = patch.tags
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
    }

    // Never allow metadata updates to replace the stored file bytes.
    delete patch.data;
    delete patch.owner;
    delete patch.storedName;
    delete patch.mimeType;
    delete patch.size;
    delete patch.originalName;

    const document = await Document.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
      },
      patch,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!document) {
      return res.status(404).json({
        message: 'Document not found',
      });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
});

r.delete('/:id', async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: 'Document not found',
      });
    }

    await Document.deleteOne({ _id: document._id });

    res.json({
      message: 'Document deleted',
    });
  } catch (error) {
    next(error);
  }
});

export default r;
