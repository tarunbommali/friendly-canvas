const router = require('express').Router();
const Track = require('../models/Track');

// GET /api/tracks
router.get('/', async (req, res, next) => {
  try {
    const tracks = await Track.find().sort('sortOrder');
    res.json(tracks);
  } catch (err) {
    next(err);
  }
});

// GET /api/tracks/:trackKey
router.get('/:trackKey', async (req, res, next) => {
  try {
    const track = await Track.findOne({ trackKey: req.params.trackKey });
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.json(track);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
