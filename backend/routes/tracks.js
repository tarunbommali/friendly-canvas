const express = require('express');
const mongoose = require('mongoose');
const Track = require('../models/Track');
const Post = require('../models/Post');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');

const router = express.Router({ mergeParams: true });

// Optional auth: allows public read if legacy or requires auth with role check
router.use(authMiddleware);

// GET /api/projects/:projectId/tracks (or /api/tracks?projectId=...)
router.get('/', async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.query.projectId;
    if (!projectId) {
      // Fallback: list all tracks sorted
      const tracks = await Track.find().sort('sortOrder');
      return res.json(tracks);
    }

    const pId = new mongoose.Types.ObjectId(projectId);
    const tracksWithCounts = await Track.aggregate([
      { $match: { project: pId } },
      { $sort: { sortOrder: 1 } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'track',
          as: 'posts',
        },
      },
      {
        $project: {
          trackKey: 1,
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

    res.json(tracksWithCounts);
  } catch (err) {
    next(err);
  }
});

// GET /api/tracks/:trackId
router.get('/:trackId', async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(trackId);
    const query = isObjectId ? { _id: trackId } : { trackKey: trackId };

    const track = await Track.findOne(query);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.json(track);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:projectId/tracks
router.post('/', requireRole('editor'), async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const { trackKey, name, palette, cover } = req.body;

    if (!projectId || !trackKey || !name) {
      return res.status(400).json({ error: 'projectId, trackKey, and name are required' });
    }

    const existing = await Track.findOne({ project: projectId, trackKey });
    if (existing) {
      return res.status(409).json({ error: `TrackKey "${trackKey}" already exists in this project` });
    }

    const maxSort = await Track.findOne({ project: projectId }).sort('-sortOrder');
    const sortOrder = maxSort ? maxSort.sortOrder + 1 : 0;

    const track = await Track.create({
      project: projectId,
      trackKey: trackKey.trim(),
      name: name.trim(),
      palette: palette || { name: 'Teal Minimal', primary: '#14b8a6', accent: '#0f766e' },
      cover: cover || { headline: name.trim(), text: '', vibe: '' },
      sortOrder,
    });

    res.status(201).json(track);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tracks/:trackId
router.patch('/:trackId', requireRole('editor'), async (req, res, next) => {
  try {
    const { name, palette, cover, trackKey } = req.body;
    const track = await Track.findById(req.params.trackId);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    if (name) track.name = name.trim();
    if (palette) track.palette = palette;
    if (cover) track.cover = cover;
    if (trackKey) track.trackKey = trackKey.trim();

    await track.save();
    res.json(track);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tracks/:trackId
router.delete('/:trackId', requireRole('admin'), async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.trackId);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    await Post.deleteMany({ track: track._id });
    await Track.findByIdAndDelete(track._id);

    res.json({ message: 'Track and associated posts deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/:projectId/tracks/reorder
router.patch('/reorder/bulk', requireRole('editor'), async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array is required' });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sortOrder: index } },
      },
    }));

    if (bulkOps.length > 0) {
      await Track.bulkWrite(bulkOps);
    }

    res.json({ message: 'Tracks reordered successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
