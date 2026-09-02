const express = require('express');
const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const Post = require('../models/Post');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// GET /api/projects/:projectId/collections (or /api/collections?projectId=...)
router.get('/', async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.query.projectId;
    if (!projectId) {
      const collections = await Collection.find().sort('sortOrder');
      return res.json(collections);
    }

    const pId = new mongoose.Types.ObjectId(projectId);
    const collectionsWithCounts = await Collection.aggregate([
      { $match: { project: pId } },
      { $sort: { sortOrder: 1 } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'collection',
          as: 'posts',
        },
      },
      {
        $project: {
          collectionKey: 1,
          name: 1,
          palette: 1,
          cover: 1,
          sortOrder: 1,
          project: 1,
          createdAt: 1,
          updatedAt: 1,
          postCount: { $size: '$posts' },
          slideCount: {
            $sum: {
              $map: {
                input: '$posts',
                as: 'p',
                in: { $size: { $ifNull: ['$$p.slides', []] } },
              },
            },
          },
        },
      },
    ]);

    res.json(collectionsWithCounts);
  } catch (err) {
    next(err);
  }
});

// GET /api/collections/:collectionId
router.get('/:collectionId', async (req, res, next) => {
  try {
    const { collectionId } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(collectionId);
    const query = isObjectId ? { _id: collectionId } : { collectionKey: collectionId };

    const collection = await Collection.findOne(query);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:projectId/collections
router.post('/', requireRole('editor'), async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const { collectionKey, name, palette, cover } = req.body;

    if (!projectId || !collectionKey || !name) {
      return res.status(400).json({ error: 'projectId, collectionKey, and name are required' });
    }

    const existing = await Collection.findOne({ project: projectId, collectionKey });
    if (existing) {
      return res.status(409).json({ error: `Collection "${collectionKey}" already exists in this project` });
    }

    const maxSort = await Collection.findOne({ project: projectId }).sort('-sortOrder');
    const sortOrder = maxSort ? maxSort.sortOrder + 1 : 0;

    const collection = await Collection.create({
      project: projectId,
      collectionKey: collectionKey.trim(),
      name: name.trim(),
      palette: palette || { name: 'Default', primary: '#2563eb', accent: '#93c5fd' },
      cover: cover || { headline: name.trim(), text: '', vibe: '' },
      sortOrder,
    });

    res.status(201).json(collection);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/collections/:collectionId
router.patch('/:collectionId', requireRole('editor'), async (req, res, next) => {
  try {
    const { collectionId } = req.params;
    const updates = { ...req.body };
    delete updates.project;
    delete updates._id;

    const collection = await Collection.findByIdAndUpdate(collectionId, updates, {
      new: true,
      runValidators: true,
    });

    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/collections/:collectionId
router.delete('/:collectionId', requireRole('admin'), async (req, res, next) => {
  try {
    const { collectionId } = req.params;

    const collection = await Collection.findByIdAndDelete(collectionId);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    // Cascade delete associated posts
    await Post.deleteMany({ collection: collectionId });

    res.json({ message: 'Collection and its posts deleted successfully', collectionId });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/collections/reorder/bulk
router.patch(['/reorder/bulk', '/reorder'], requireRole('editor'), async (req, res, next) => {
  try {
    const { projectId, orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array of Collection IDs' });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, ...(projectId ? { project: projectId } : {}) },
        update: { $set: { sortOrder: index } },
      },
    }));

    await Collection.bulkWrite(bulkOps);
    res.json({ message: 'Collections reordered successfully', count: orderedIds.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
