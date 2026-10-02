import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import Document from '../models/Document.js';

import fs from 'fs';
import path from 'path';

const r = Router();

r.use(auth);

/* =========================
   GET ALL DOCUMENTS
========================= */

r.get('/', async (req, res, next) => {
    try {
        let documents = await Document.find({
            owner: req.user._id,
        }).sort({
            updatedAt: -1,
        });

        const q = String(req.query.q || '')
            .trim()
            .toLowerCase();

        if (q) {
            documents = documents.filter((x) =>
                JSON.stringify(x)
                    .toLowerCase()
                    .includes(q)
            );
        }

        res.json(documents);
    } catch (error) {
        next(error);
    }
});

/* =========================
   UPLOAD DOCUMENT
========================= */

r.post(
    '/',
    upload.single('file'),
    async (req, res, next) => {
        try {
            if (!req.file) {
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
                storedName: req.file.filename,
                mimeType: req.file.mimetype,
                size: req.file.size,
                description: req.body.description || '',
                category: req.body.category || 'Other',
                tags,
                favorite: false,
            });

            res.status(201).json(document);
        } catch (error) {
            // Agar MongoDB save fail ho jaye to uploaded file
            // ko remove karne ki koshish karte hain.
            if (req.file) {
                try {
                    fs.unlinkSync(
                        path.resolve(
                            'uploads',
                            req.file.filename
                        )
                    );
                } catch { }
            }

            next(error);
        }
    }
);

/* =========================
   DOWNLOAD DOCUMENT
========================= */

r.get(
    '/:id/download',
    async (req, res, next) => {
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

            const filePath = path.resolve(
                'uploads',
                document.storedName
            );

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    message: 'File not found on server',
                });
            }

            res.download(
                filePath,
                document.originalName
            );
        } catch (error) {
            next(error);
        }
    }
);

/* =========================
   GET SINGLE DOCUMENT
========================= */

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

/* =========================
   UPDATE DOCUMENT
========================= */

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

        const document =
            await Document.findOneAndUpdate(
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

/* =========================
   DELETE DOCUMENT
========================= */

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

        try {
            fs.unlinkSync(
                path.resolve(
                    'uploads',
                    document.storedName
                )
            );
        } catch { }

        await Document.deleteOne({
            _id: document._id,
        });

        res.json({
            message: 'Document deleted',
        });
    } catch (error) {
        next(error);
    }
});

export default r;