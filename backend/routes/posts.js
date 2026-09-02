const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Track = require('../models/Track');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// GET /api/posts or /api/tracks/:trackId/posts
router.get('/', async (req, res, next) => {
  try {
    const trackId = req.params.trackId || req.query.trackId;
    const filter = {};

    if (trackId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(trackId);
      if (isObjectId) {
        filter.track = trackId;
      } else {
        const track = await Track.findOne({ trackKey: trackId });
        if (!track) return res.json([]);
        filter.track = track._id;
      }
    }

    const posts = await Post.find(filter)
      .populate('track', 'trackKey name palette')
      .sort('sortOrder');

    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:postId
router.get('/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(postId);
    const query = isObjectId ? { _id: postId } : { externalId: postId };

    const post = await Post.findOne(query).populate('track', 'trackKey name palette');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/tracks/:trackId/posts
router.post('/', requireRole('editor'), async (req, res, next) => {
  try {
    const trackId = req.params.trackId || req.body.trackId;
    const { title, postNo, resources, assets, slides } = req.body;

    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    const maxPost = await Post.findOne({ track: track._id }).sort('-sortOrder');
    const sortOrder = maxPost ? maxPost.sortOrder + 1 : 0;
    const calculatedPostNo = postNo !== undefined ? postNo : (maxPost ? maxPost.postNo + 1 : 1);

    const externalId = `post_t${track.trackKey}_p${String(calculatedPostNo).padStart(2, '0')}`;

    const defaultSlides = (slides && slides.length > 0)
      ? slides
      : [
          {
            externalId: `slide_${externalId}_s01`,
            slideNo: 1,
            layout: 'hook-open',
            headline: title || 'New Hook Headline',
            text: 'Supporting narrative for the concept.',
            canvas: {
              version: 1,
              width: 1080,
              height: 1350,
              aspectRatio: '4:5',
              bgPattern: 'solid',
              textAlign: 'left',
              objects: [],
              background: { type: 'color', value: '#121212' },
            },
          },
        ];

    const post = await Post.create({
      project: track.project,
      track: track._id,
      externalId,
      title: title || `Post #${calculatedPostNo}`,
      postNo: calculatedPostNo,
      sortOrder,
      resources: resources || [],
      assets: assets || [],
      slides: defaultSlides,
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/posts/:postId
router.patch('/:postId', requireRole('editor'), async (req, res, next) => {
  try {
    const { title, resources, assets } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (title) post.title = title.trim();
    if (resources) post.resources = resources;
    if (assets) post.assets = assets;

    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:postId
router.delete('/:postId', requireRole('editor'), async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await Post.findByIdAndDelete(post._id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tracks/:trackId/posts/reorder
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
      await Post.bulkWrite(bulkOps);
    }

    res.json({ message: 'Posts reordered successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:postId/slides - add slide
router.post('/:postId/slides', requireRole('editor'), async (req, res, next) => {
  try {
    const { layout, headline, text, visualDirective } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const nextSlideNo = (post.slides?.length || 0) + 1;
    const externalId = `slide_${post.externalId}_s${String(nextSlideNo).padStart(2, '0')}`;

    const newSlide = {
      externalId,
      slideNo: nextSlideNo,
      layout: layout || 'concept-explain',
      headline: headline || `Slide ${nextSlideNo} Headline`,
      text: text || 'Slide body description text.',
      visualDirective: visualDirective || {},
      canvas: {
        version: 1,
        width: 1080,
        height: 1350,
        aspectRatio: '4:5',
        bgPattern: 'solid',
        textAlign: 'left',
        objects: [],
        background: { type: 'color', value: '#121212' },
      },
    };

    post.slides.push(newSlide);
    await post.save();

    res.status(201).json(post.slides[post.slides.length - 1]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/posts/:postId/slides/:slideId - update slide content
router.patch('/:postId/slides/:slideId', requireRole('editor'), async (req, res, next) => {
  try {
    const { headline, text, layout, visualDirective } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const slide = post.slides.id(req.params.slideId) || post.slides.find((s) => s.externalId === req.params.slideId);
    if (!slide) return res.status(404).json({ error: 'Slide not found' });

    if (headline !== undefined) slide.headline = headline;
    if (text !== undefined) slide.text = text;
    if (layout !== undefined) slide.layout = layout;
    if (visualDirective !== undefined) slide.visualDirective = visualDirective;

    await post.save();
    res.json(slide);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/posts/:postId/slides/:slideId/canvas - update isolated canvas document
router.patch('/:postId/slides/:slideId/canvas', requireRole('editor'), async (req, res, next) => {
  try {
    const { canvas } = req.body;
    if (!canvas) return res.status(400).json({ error: 'Canvas data object is required' });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const slide = post.slides.id(req.params.slideId) || post.slides.find((s) => s.externalId === req.params.slideId);
    if (!slide) return res.status(404).json({ error: 'Slide not found' });

    slide.canvas = {
      ...slide.canvas?.toObject?.() || {},
      ...canvas,
    };

    await post.save();
    res.json({ message: 'Slide canvas saved successfully', canvas: slide.canvas });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:postId/slides/:slideId - delete slide
router.delete('/:postId/slides/:slideId', requireRole('editor'), async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const initialLen = post.slides.length;
    post.slides = post.slides.filter((s) => s._id.toString() !== req.params.slideId && s.externalId !== req.params.slideId);

    if (post.slides.length === initialLen) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    // Re-index slide numbers
    post.slides.forEach((s, idx) => {
      s.slideNo = idx + 1;
    });

    await post.save();
    res.json({ message: 'Slide deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/posts/:postId/slides/reorder - reorder slides
router.patch('/:postId/slides/reorder/bulk', requireRole('editor'), async (req, res, next) => {
  try {
    const { orderedSlideIds } = req.body;
    if (!Array.isArray(orderedSlideIds)) {
      return res.status(400).json({ error: 'orderedSlideIds array is required' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const slideMap = new Map();
    post.slides.forEach((s) => {
      slideMap.set(s._id.toString(), s);
      slideMap.set(s.externalId, s);
    });

    const reordered = [];
    orderedSlideIds.forEach((id, index) => {
      const slide = slideMap.get(id);
      if (slide) {
        slide.slideNo = index + 1;
        reordered.push(slide);
      }
    });

    post.slides = reordered;
    await post.save();

    res.json({ message: 'Slides reordered successfully', slides: post.slides });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
