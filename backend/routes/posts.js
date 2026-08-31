const router = require('express').Router();
const Post = require('../models/Post');
const Track = require('../models/Track');

// GET /api/posts?trackKey=01
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.trackKey) {
      const track = await Track.findOne({ trackKey: req.query.trackKey });
      if (!track) return res.json([]);
      filter.track = track._id;
    }
    const posts = await Post.find(filter)
      .select('-slides -resources -assets') // list view: skip heavy fields
      .populate('track', 'trackKey name')
      .sort('postNo');
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:externalId
router.get('/:externalId', async (req, res, next) => {
  try {
    const post = await Post.findOne({ externalId: req.params.externalId })
      .populate('track', 'trackKey name palette');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
