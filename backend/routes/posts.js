const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Collection = require('../models/Collection');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// GET /api/posts or /api/collections/:collectionId/posts
router.get('/', async (req, res, next) => {
  try {
    const collectionId = req.params.collectionId || req.query.collectionId;
    const filter = {};

    if (collectionId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(collectionId);
      if (isObjectId) {
        filter.collection = collectionId;
      } else {
        const coll = await Collection.findOne({ collectionKey: collectionId });
        if (!coll) return res.json([]);
        filter.collection = coll._id;
      }
    }

    const posts = await Post.find(filter)
      .populate('collection', 'collectionKey name palette')
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

    const post = await Post.findOne(query)
      .populate('collection', 'collectionKey name palette');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/collections/:collectionId/posts
router.post('/', requireRole('editor'), async (req, res, next) => {
  try {
    const collectionId = req.params.collectionId || req.body.collectionId;
    const { title, postNo, resources, assets, slides } = req.body;

    const isObjectId = mongoose.Types.ObjectId.isValid(collectionId);
    const query = isObjectId ? { _id: collectionId } : { collectionKey: collectionId };

    const coll = await Collection.findOne(query);
    if (!coll) return res.status(404).json({ error: 'Collection not found' });

    const maxPost = await Post.findOne({ collection: coll._id }).sort('-sortOrder');
    const sortOrder = maxPost ? maxPost.sortOrder + 1 : 0;
    const calculatedPostNo = postNo !== undefined ? postNo : (maxPost ? maxPost.postNo + 1 : 1);

    const collKey = coll.collectionKey || '01';
    const externalId = `post_c${collKey}_p${String(calculatedPostNo).padStart(2, '0')}`;

    const defaultSlides = (slides && slides.length > 0)
      ? slides
      : [
        {
          externalId: `slide_${externalId}_s01`,
          slideNo: 1,
          layout: 'hook-open',
          heading: title || 'New Hook Headline',
          bodyText: 'Supporting narrative for the concept.',
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
      project: coll.project,
      collection: coll._id,
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

// PATCH /api/Collections/:collectionId/posts/reorder
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
    const { layout, heading, bodyText, visualDirective } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const nextSlideNo = (post.slides?.length || 0) + 1;
    const externalId = `slide_${post.externalId}_s${String(nextSlideNo).padStart(2, '0')}`;

    const newSlide = {
      externalId,
      slideNo: nextSlideNo,
      layout: layout || 'concept-explain',
      heading: heading || `Slide ${nextSlideNo} Heading`,
      bodyText: bodyText || 'Slide body description text.',
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
    const { heading, bodyText, layout, visualDirective } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const slide = post.slides.id(req.params.slideId) || post.slides.find((s) => s.externalId === req.params.slideId);
    if (!slide) return res.status(404).json({ error: 'Slide not found' });

    if (heading !== undefined) slide.heading = heading;
    if (bodyText !== undefined) slide.bodyText = bodyText;
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
